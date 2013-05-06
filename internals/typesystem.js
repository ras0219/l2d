var nodelist = require('./nodelist');
var toposort = nodelist.toposort;
var buildmap = nodelist.buildmap;

var defmap = require('./builtins').defmap;

////////////////////////////////////////////////////////////////////////
// TYPE CHECKING ERROR MESSAGES
//
// Code | Data                | Description
// -----+---------------------+-----------------------------------------
// 1000 |                     | 'There must be one output.'
// 1001 | [n]                 | 'Incorrect number of inputs.'
// 1002 | [n, ix]             | 'Input not connected.'
// 2000 | [n, ix, t1, t2]     | 'Incompatible input types.'
// 3000 |                     | 'There must be one input to main.'
// 3001 | [node]              | 'Input of main must be of type world.'
// 3002 | [node]              | 'Output of main must be of type world.'
////////////////////////////////////////////////////////////////////////


// Type Object Representation
//
// Type := string | world | number
//       | type -> type -> ... -> type      -- Note that this does not mean curried
//       | (type, type, ...)
//       | Tvar <gid>
//
// Types are objects of the form
// { name: 'tuple', args: <[type]> }
// { name: 'fn', args: <[type]> }
// { name: 'variable', id: <number> }
// { name: <string> }

// mktype interprets the string serialization of types
// mktype :: String -> Type
// creates a type object out of a string representation
function mktype(st) {
    var stk = [[""]];
    for(var x = 0; x < st.length; ++x) {
	var c = st.charAt(x);
	if (c == '(') {
	    // add new stack frame
	    stk.push([""]);
	} else if (c == ')') {
	    // pop last stack frame
	    var k = stk[stk.length-1];
	    stk.pop();
	    var last = stk[stk.length-1];
	    last[last.length-1] = k;
	} else if (c == ',') {
	    // add new empty string
	    stk[stk.length-1].push('');
	} else if (c == ' ') {
	} else {
	    var last = stk[stk.length-1];
	    last[last.length-1] += c;
	}
    }
    if (stk.length != 1) {
	throw "Mismatched parentheses in mktype argument.";
    }
    if (stk[0].length != 1) {
	throw "Top level commas in mktype argument.";
    }
    function maptype(t) {
	if (typeof t == 'string') {
	    return { name: t };
	} else {
	    return { name: 'tuple', args: t.map(maptype) }
	}
    }
    return maptype(stk[0][0]);
}

function string_of_type(ty) {
    var nicenames = ['a', 'b', 'c', 'd', 'e', 'f'];
    var namemap = {};
    var temps = 0;
    function getName(id) {
        if (id in namemap) {
            // Nothing needed.
        } else if (nicenames.length > 0) {
            namemap[id] = nicenames.shift();
        } else {
            namemap[id] = 't' + temps;
            temps++;
        }
        return namemap[id];
    }
    return (function recurse(ty) {
        if (typeof ty.ref !== 'undefined')
            return recurse(ty.ref);
        if (ty.name === 'tuple')
            return '(' + ty.args.map(recurse).join(', ') + ')';
        if (ty.name === 'fn')
            return ty.args.map(recurse).join(' -> ');
        if (ty.name === 'variable' || ty.name === 'global')
            return getName(ty.id);
        return ty.name;
    })(ty);
}

// Compare types
function typecmp(ty1, ty2) {
    if (ty1.name != ty2.name) return false;
    if (typeof ty1.args == 'undefined' ) return true;
    if (ty1.args.length != ty2.args.length) return false;
    for (var x in ty1.args) {
	if (!typecmp(ty1.args[x], ty2.args[x])) return false;
    }
    return true;
}

//////////////////////////////////////////////////////////////////////
// Typecheck a node list
function checkinputs(nlist) {
    var sources = []
    for (var k in nlist) {
	if (nlist[k].kind == 'input') {
	    sources.push(nlist[k]);
	}
    }
    sources.sort(function(a,b){return a.id-b.id;});
    for (var i in sources) {
	sources[i].ordinal = i;
    }
    return sources;
}

function checkoutputs(nlist) {
    var nodes = []
    for (var k in nlist) {
	if (nlist[k].kind == 'output') {
	    nodes.push(nlist[k]);
	}
    }
    // Check that nodes has exactly 1 element
    if (nodes.length != 1) {
	return { errors: [ { code: 1000 } ], nodes: nodes };
    }
    return { errors: [], nodes: nodes };
}

function gettype(node) {
    return node.type;
}

function deref_type(ty) {
    if (ty == null)
	return ty;
    var t = ty;
    while ("ref" in t) {
	t = t.ref;
    }
    return t;
}

function finaltype(ty, notes) {
//    console.log('finaltype', ty, notes);
    if ('args' in ty) {
	return { name: ty.name,
		 args: ty.args.map(function(x) {
		     var t = finaltype(x, notes);
//		     console.log('mapping repl', x, t, notes);
		     return t;
		 })
	       };
    } else if (ty.name == 'variable') {
	if (ty.id in notes)
	    return finaltype(notes[ty.id], notes);
    } else if (ty.name == 'global' && 'ref' in ty) {
	return finaltype(ty.ref, notes);
    } else if (ty.name == 'global') {
	return { name: 'variable', id: ty.id };
    }
    return ty;
}

function outtype(node) {
    var ty = gettype(node);
    if (ty.name == 'fn')
	return ty.args[ty.args.length - 1];
    return ty;
}

function getfinaltype(node) {
    return finaltype(gettype(node), node.annote);
}

function getfinalouttype(node) {
    return finaltype(outtype(node), node.annote);
}

GLOBAL_UNIQ_VAR = 999

function get_fresh_var() {
    var t = GLOBAL_UNIQ_VAR;
    GLOBAL_UNIQ_VAR++;
    return { name: 'global', id: t };
}

function add_global_note(ty, ty_annote) {
    if (ty.name == 'variable' && !(ty.id in ty_annote)) {
        ty_annote[ty.id] = get_fresh_var();
        return;
    }

    if (typeof ty.args !== 'undefined') {
        for (var k in ty.args) {
            add_global_note(ty.args[k], ty_annote);
        }
    }
}

// Type Unification
function unify(ty, ty_annote, tref, tref_annote) {
    // Begin new unification
    if (ty.name == 'variable')
	ty = deref_type(ty_annote[ty.id]);
    if (tref.name == 'variable')
	tref = deref_type(tref_annote[tref.id]);

    if (ty.name == 'global') {
        if (ty !== tref)
	    ty.ref = finaltype(tref, tref_annote);
	return true;
    }

    if (tref.name == 'global') {
	tref.ref = finaltype(ty, ty_annote);
	return true;
    }

    if (ty.name != tref.name) {
	// completely disparate types
	return false;
    }

    // for tuples and functions
    if (typeof ty.args !== 'undefined') {
	for (var k in ty.args) {
	    if (!(k in tref.args))
		return false;
	    if (!unify(ty.args[k], ty_annote, tref.args[k], tref_annote))
		return false;
	}
    }

    return true;
}

// Checknode checks a single node (nodes must be checked in topological order)
function checknode(node) {
    console.log("checking node", node);
    var errors = [];
    var ty = gettype(node);

    if (ty.name == 'fn') {
	if (node.in.length != ty.args.length - 1) {
	    errors.push({ code: 1001, data: [node] });
	    return errors;
	}
	for (var a in node.in) {
	    if (node.in[a] === null) {
		errors.push({ code: 1002, data: [ node, a ]});
		continue;
	    }
	    var incty = outtype(nmap[node.in[a]]);
	    if (!unify(ty.args[a], node.annote, incty, nmap[node.in[a]].annote)) {
		errors.push({ code: 2000,
			      data: [ node, // The node under scrutiny
				      a, // The index of the input
				      ty.args[a], // The requested type
				      incty // The inputted type
				    ]});
	    }
	}
    } else if (node.kind === 'input' && node.in.length === 1 && node.in[0] === null) {
	// HACK: This is a special case to handle the current state of the transformation layer
	// Do nothing
    } else if (node.in.length > 0) {
	errors.push({ code: 1001, data: [node] });
	return errors;
    }

    /*if (node.out.length > 1 && outtype(node).name == 'world') {
	errors.push({ message: 'Splitting world is invalid.', data: [node] });
    }*/

    return errors;
}

// typecheck
// arguments:
//   nlist -- list of nodes
//   main -- bool -- is this the main function?
function typecheck(nlist, main) {
    // First, check the input and output
    var ires = checkinputs(nlist);
    var ores = checkoutputs(nlist);


    var recursive_type = { name: 'fn', args: [] };
    var recursive_notes = {};

    for (var x in nlist) {
        // Clear all type notations
        nlist[x].annote = {};

        if (nlist[x].kind == 'if') {
            // fill in the type information for if statements
            nlist[x].type = { name: 'fn',
                              args: [ { name: 'bool' },
                                      { name: 'variable', id: 0 },
                                      { name: 'variable', id: 0 },
                                      { name: 'variable', id: 0 } ] }
        } else if (nlist[x].kind == 'function') {
            nlist[x].type = defmap[nlist[x].name].type;
        } else if (nlist[x].kind == 'recursion') {
            nlist[x].type = recursive_type;
            nlist[x].annote = recursive_notes;
        } else if (typeof nlist[x].type == 'undefined') {
	    var inputs = nlist[x].in.map(function(i,j,k){ return { name:'variable', id: j } });
	    inputs.push({ name:'variable', id: inputs.length });
	    if (inputs.length > 1 && nlist[x].kind !== 'input')
		nlist[x].type = { name:'fn', args:inputs };
	    else
		nlist[x].type = inputs[0];
	}
        add_global_note(nlist[x].type, nlist[x].annote);
    }

    // Handle recursive type here
    for (var i in ires) {
        recursive_type.args.push({ name: 'variable', id: i });
        recursive_notes[i] = ires[i].annote[0];
    }
    if (ores.nodes.length == 1) {
        var i = recursive_type.args.length;
        recursive_type.args.push({ name: 'variable',
                                   id: i });
        recursive_notes[i] = ores.nodes[0].annote[0];
    }
    console.log('recursive info:', recursive_type, recursive_notes);

    var nmap = buildmap(nlist);
    var tsort = toposort(nlist);

    var errors = [ores.errors];

    if (!tsort.success)
	// If there are cycles, report them now
	errors.push(tsort.results);
    else {
	tsort = tsort.results;
	// Typecheck every node
	for (var x in tsort) {
	    errors.push(checknode(tsort[x]));
	}
    }
    
    if (main) {
	// Check that sources has exactly 1 element with type world for main
	if (ires.length != 1) {
	    errors.push([ { code: 3000 } ]);
	} else if (!unify(ires[0].type, ires[0].annote,
			  mktype('world'), null)) {
	    errors.push([ { code: 3001, data: [ires[0]] } ]);
	}
	// Check that nodes has exactly 1 element with type world
	if (ores.nodes.length == 1 &&
	    !unify(ores.nodes[0].type, ores.nodes[0].annote,
		   { name: 'fn', args: [ mktype('world'),
					 mktype('void')] },
		   null)) {
	    errors.push([ { code: 3002, data: [ores.nodes[0]] } ]);
	}
    }

    errors = [].concat.apply([], errors);

    var fnargs = ires.map(getfinalouttype);
    if (ores.nodes.length > 0) {
	var temp = getfinaltype(ores.nodes[0]);
	fnargs.push(temp.args[0])
    }
    var fntype = { name: 'fn', args: fnargs};

    return { success: errors.length == 0, errors: errors, fntype: fntype };
}

exports.mktype = mktype;
exports.typecheck = typecheck;
exports.string_of_type = string_of_type;
