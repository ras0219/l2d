require=(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({"./builtins":[function(require,module,exports){
module.exports=require('DzQqsi');
},{}],"DzQqsi":[function(require,module,exports){
//////////////////////////////////////////////////////////////////////
// Builtins
function printfun(s) {
    console.log(s);
}

///////////////////////////////////
// Definition Map containing builtins
var defmap = {
    print: {
	kind: 'builtin',
	type: {
	    name: 'fn', args: [
		{ name: 'string' },
		{ name: 'world' },
		{ name: 'world' } ]
	},
	body: function (st, world) {
	    printfun(st);
	    return world;
	}
    },
    fst: {
	// Experimental use of type variables
	kind: 'builtin',
	type: {
	    name: 'fn',
	    args: [
		{ name: 'tuple',
		  args: [
		      { name: 'variable', id: 0 },
		      { name: 'variable', id: 1 }
		  ]
		},
		{ name: 'variable', id: 0 }
	    ]
	},
	body: function (t) {
	    return t[0];
	}
    },
    snd: {
	// Experimental use of type variables
	kind: 'builtin',
	type: {
	    name: 'fn',
	    args: [
		{ name: 'tuple',
		  args: [
		      { name: 'variable', id: 0 },
		      { name: 'variable', id: 1 }
		  ]
		},
		{ name: 'variable', id: 1 }
	    ]
	},
	body: function (t) {
	    return t[1];
	}
    },
    pair: {
	// Experimental use of type variables
	kind: 'builtin',
	type: {
	    name: 'fn',
	    args: [
		{ name: 'variable', id: 0 },
		{ name: 'variable', id: 1 },
		{ name: 'tuple',
		  args: [
		      { name: 'variable', id: 0 },
		      { name: 'variable', id: 1 }
		  ]
		}
	    ]
	},
	body: function (a, b) {
	    return [a, b];
	}
    }	
};

function save_func(name, nodelist, tcheckres) {
    if (typeof tcheckres === 'undefined'
	|| typeof nodelist === 'undefined'
	|| tcheckres.success === false) {
	// If we didn't typecheck or have bad inputs,
	// don't do anything.
	return;
    }

    defmap[name] = {
	kind: 'function',
	type: tcheckres.fntype,
	body: nodelist
    }
}

exports.defmap = defmap;
exports.save_func = save_func;

},{}],"./arith":[function(require,module,exports){
module.exports=require('7Wax2k');
},{}],"7Wax2k":[function(require,module,exports){
function isOp(ch) {
    return ch === '+' ||
        ch === '-' ||
        ch === '*' ||
        ch === '/';
}

function isAlpha(ch) {
    var co = ch.charCodeAt(0);
    
    return (co > 64 && co < 91) ||
        (co > 96 && co < 123) ||
        ch == '_';
}

function isDigit(ch) {
    var co = ch.charCodeAt(0);
    return co > 47 && co < 58;
}

function tokenize(eqn) {
    var tokens = [];
    var curtok = "";
    var curtype = 'none';

    function clear() {
        if (curtype === 'number')
            tokens.push(parseInt(curtok));
        else if (curtype === 'letter')
            tokens.push(curtok);
        curtok = '';
        curtype = 'none';
    }

    function settype(t) {
        if (curtype !== t) {
            clear();
            curtype = t;
        }
    }

    for (var x = 0; x < eqn.length; ++x) {
        var ch = eqn.charAt(x);
        if(isAlpha(ch)) {
            // character is a letter
            settype('letter');
            curtok += ch;
        } else if(isDigit(ch)) {
            settype('number');
            curtok += ch;
        } else if(ch === ' ') {
            // end current token
            clear();
        } else if(ch === '(' ||
                  ch === ')' ||
                  isOp(ch)) {
            // push all symbol characters
            clear();
            tokens.push(ch);
        } else {
            // Invalid character
        }
    }
    clear();
    return tokens;
}

function parse(ts) {
    ts.unshift(null);

    function prim() {
        var t = ts[ts.length-1];
        if (typeof t === 'number' || isAlpha(t)) {
            ts.pop();
            return t;
        }
        if (t === ')') {
            ts.pop();
            var n = expr();
            if (ts[ts.length-1] !== '(')
                throw "expected open paren";
            ts.pop();
            return n;
        }
        throw "could not parse primary";
    }

    function term() {
        var rhs = prim();
        var t = ts[ts.length-1];
        if (t === '*' || t === '/') {
            ts.pop();
            var lhs = term();
            return { op: t, r: rhs, l: lhs };
        }
        return rhs;
    }

    function expr() {
        var rhs = term();
        var t = ts[ts.length-1];
        if (t === '+' || t === '-') {
            ts.pop();
            var lhs = expr();
            return { op: t, r: rhs, l: lhs };
        }
        return rhs;
    }

    var e = expr();
    if (ts.length > 1)
        throw "Expected end of input.";
    
    return e;
}


function findVars(ast) {
    var vset = {};
    var index = 0;
    (function recurse(ast) {
        if (typeof ast === 'number')
            return;
        if (typeof ast === 'string') {
            if (ast in vset)
                return;
            vset[ast] = { type: 'number',
                          index: index };
            index++;
            return;
        }
        recurse(ast.l);
        recurse(ast.r);
    })(ast);
    return vset;
}

function eval(a, v, r) {
    if (typeof a === 'number')
        return a;
    if (typeof a === 'string')
        return r[v[a].index];
    if (a.op === '+')
        return eval(a.l,v,r) + eval(a.r,v,r);
    if (a.op === '-')
        return eval(a.l,v,r) - eval(a.r,v,r);
    if (a.op === '*')
        return eval(a.l,v,r) * eval(a.r,v,r);
    if (a.op === '/')
        return eval(a.l,v,r) / eval(a.r,v,r);
}

// var ts = tokenize("100 / (100 + armor * (1 - pct_pen))");
// //console.log(JSON.stringify(ts, null, 2));
// var p = parse(ts);
// //console.log(JSON.stringify(p, null, 2));
// var v = findVars(p);
// console.log(JSON.stringify(v, null, 2));

// console.log(JSON.stringify(eval(p, v, [50, 0.40]), null, 2));

exports.tokenize = tokenize;
exports.parse = parse;
exports.findVars = findVars;
exports.eval = eval;

},{}],"./lang":[function(require,module,exports){
module.exports=require('YkN7kq');
},{}],"YkN7kq":[function(require,module,exports){
var nodelist = require('./nodelist');
var toposort = nodelist.toposort;
var buildmap = nodelist.buildmap;

var typesystem = require('./typesystem');
var mktype = typesystem.mktype;
var typecheck = typesystem.typecheck;

var defmap = require('./builtins').defmap;

function dispatch(defname, args) {
    var fn = defmap[defname];
    if (fn.kind == 'builtin') {
	return fn.body.apply(this, args);
    } else if (fn.kind == 'function') {
	return evaluate(fn.body, args);
    }
}

function evaluate(nlist, args) {
    var nmap = buildmap(nlist);

    var values = {};
    function evalNode(node) {
	if (typeof node === 'undefined' || node.id in values)
	    // Do not evaluate nonexistant nodes
	    // Do not evaluate twice
	    return;

	if (node.kind !== 'if') {
	    // For all non-if statements, perform eager evaluation of arguments
	    node.in.forEach(function (id) { evalNode(nmap[id]); });
	} else {
	    // Handle if statements here
	    evalNode(nmap[node.in[0]]);
	    if (values[node.in[0]] == true) {
		evalNode(nmap[node.in[1]]);
		values[node.id] = values[node.in[1]];
	    } else {
		evalNode(nmap[node.in[2]]);
		values[node.id] = values[node.in[2]];
	    }
	    return;
	}

	if (node.kind == 'input') {
	    if (node.ordinal in args) {
		values[node.id] = args[node.ordinal];
	    } else {
		values[node.id] = "BROKEN VALUE";
	    }
	} else if (node.kind == 'output') {
	    // End of program (start of evaluation)

	    // Dummy Value
	    values[node.id] = true;
	} else if (node.kind == 'constant') {
	    values[node.id] = node.value;
	} else if (node.kind == 'function') {
	    // Lookup argument values
	    argvals = node.in.map(function (v) { return values[v]; });
	    // Dispatch function
	    values[node.id] = dispatch(node.name, argvals);
	}
    }

    for (var x in nlist) {
	if (nlist[x].kind == 'output') {
	    evalNode(nlist[x]);
	}
    }
}

// var main = [
//     {
// 	id: 3,

// 	kind: 'output',
// 	//type: mktype('world'),

// 	in: [2],
// 	out: []
//     },
//     {
// 	id: 0,

// 	kind: 'input',
// 	label: 'world_in', // world_in is the entry point for main
// 	type: mktype('world'),
	
// 	in: [],
// 	out: [2]
//     },
//     {
// 	id: 1,

// 	kind: 'constant',
// 	type: mktype('string'), // constant :: String
// 	value: 'Hello, World!',
	
// 	in: [],
// 	out: [2]
//     },
//     {
// 	id: 4,
	
// 	kind: 'function',
// 	name: 'pair', // pair :: a -> b -> (a,b)
	
// 	in: [1, 1],
// 	out: [5]
//     },
//     {
// 	id: 5,
// 	kind: 'function',
// 	name: 'fst',
// 	in: [4],
// 	out: [2]
//     },
//     {
// 	id: 2,

// 	kind: 'function',
// 	name: 'print', // print :: String -> World -> World

// 	in: [5, 0],
// 	out: [3]
//     }
// ];

// var tcheckres = typecheck(main);

// var foo = function(x){return x;};
// if (JSON !== undefined && JSON.stringify !== undefined) {
//     foo = JSON.stringify;
// }

// //console.log(JSON.stringify(main, null, 2));
// console.log(foo(tcheckres, null, 2));

// if (tcheckres.success)
//     evaluate(main);
// else
//     console.log(foo(tcheckres.errors, null, 2));

exports.evaluate = evaluate;

},{"./typesystem":"BmUiE3","./builtins":"DzQqsi","./nodelist":1}],"./typesystem":[function(require,module,exports){
module.exports=require('BmUiE3');
},{}],"BmUiE3":[function(require,module,exports){
(function(){var nodelist = require('./nodelist');
var toposort = nodelist.toposort;
var buildmap = nodelist.buildmap;

var defmap = require('./builtins').defmap;

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
	return { errors: [ { message: 'There must be one output.' } ], nodes: nodes };
    }
    return { errors: [], nodes: nodes };
}

function gettype(node) {
    if (node.kind == 'function') {
	return defmap[node.name].type;
    } else {
        return node.type;
    }
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

// Type Unification
function unify(ty, ty_annote, tref, tref_annote) {
    // Begin new unification
    if (ty.name == 'variable' && !(ty.id in ty_annote))
	ty_annote[ty.id] = get_fresh_var();
    if (tref.name == 'variable' && !(tref.id in tref_annote))
	tref_annote[tref.id] = get_fresh_var();

    if (ty.name == 'variable')
	ty = deref_type(ty_annote[ty.id]);
    if (tref.name == 'variable')
	tref = deref_type(tref_annote[tref.id]);

    if (ty.name == 'global') {
        if (ty !== tref)
	    ty.ref = tref;
	return true;
    }

    if (tref.name == 'global') {
	tref.ref = ty;
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

    // Begin old unification
    // if (ty.name == 'variable' && tref.name == 'variable') {
    // 	// If both the checked type and the reference type are variable
    // 	// copy over the annotation
    // 	if (ty.id in ty_annote)
    // 	    throw "already unified.";
    // 	if (!(tref.id in tref_annote)) {
    // 	    tref_annote[tref.id] = { type: { name: 'global',
    // 					     id: GLOBAL_UNIQ_VAR }};
    // 	    GLOBAL_UNIQ_VAR++;
    // 	}
    // 	ty_annote[ty.id] = tref_annote[tref.id];
    // 	return true;
    // }
    // if (tref.name == 'variable') {
    // 	// If ty1 is not variable, force the ref to be our type
    // 	return unify(tref, tref_annote, ty, ty_annote);
    // }
    // if (ty.name == 'variable') {
    // 	// If the reference isn't variable but ty is,
    // 	// add an annotation
    // 	if (ty.id in ty_annote)
    // 	    // Need to check here if the types are equal.
    // 	    if (ty_annote[ty.id].type.name === 'global') {
    // 		// can replace at will
    // 		ty_annote[ty.id].type = finaltype(tref, tref_notes);
    // 	    } else {
		
    // 	    }
    // 	else
    // 	    ty_annote[ty.id] = { type: tref }
    // 	return true;
    // }
    // if (ty.name !== tref.name) return false;
    // if (typeof ty.id !== 'undefined' && ty.id !== tref.id) return false;
    // if (typeof ty.args == 'undefined') return true;
    // if (ty.args.length != tref.args.length) return false;
    // for (var x in ty.args) {
    // 	if (!unify(ty.args[x], ty_annote, tref.args[x], tref_annote)) return false;
    // }
    // return true;
}

// Checknode checks a single node (nodes must be checked in topological order)
function checknode(node) {
    console.log("checking node", node);
    var errors = [];
    var ty = gettype(node);
    // Clear all type notations
    node.annote = {};
    if (ty.name == 'fn') {
	if (node.in.length != ty.args.length - 1) {
	    errors.push({ message: 'Incorrect number of inputs.', data: node });
	    return errors;
	}
	for (var a in node.in) {
	    if (node.in[a] === null) {
		errors.push({ message: 'Input not connected.',
			      data: [ node,
				      a ]});
		continue;
	    }
	    var incty = outtype(nmap[node.in[a]]);
	    if (!unify(ty.args[a], node.annote, incty, nmap[node.in[a]].annote)) {
		errors.push({ message: 'Incompatible input types.',
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
	errors.push({ message: 'Too many inputs.', data: node });
	return errors;
    }

    if (node.out.length > 1 && outtype(node).name == 'world') {
	errors.push({ message: 'Splitting world is invalid.', data: node });
    }

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

    for (var x in nlist) {
        if (nlist[x].kind == 'if') {
            // fill in the type information for if statements
            nlist[x].type = { name: 'fn',
                              args: [ { name: 'bool' },
                                      { name: 'variable', id: 0 },
                                      { name: 'variable', id: 0 },
                                      { name: 'variable', id: 0 } ] }
        } else if (typeof nlist[x].type == 'undefined') {
	    var inputs = nlist[x].in.map(function(i,j,k){ return { name:'variable', id: j } });
	    inputs.push({ name:'variable', id: inputs.length });
	    if (inputs.length > 1 && nlist[x].kind !== 'input')
		nlist[x].type = { name:'fn', args:inputs };
	    else
		nlist[x].type = inputs[0];
	}
    }

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
	    errors.push([ { message: 'There must be one input to main.' } ]);
	} else if (!unify(ires[0].type, ires[0].annote,
			  mktype('world'), null)) {
	    errors.push([ { message: 'Input of main must be of type world',
			    data: ires[0] } ]);
	}
	// Check that nodes has exactly 1 element with type world
	if (ores.nodes.length == 1 &&
	    !unify(ores.nodes[0].type, ores.nodes[0].annote,
		   { name: 'fn', args: [ mktype('world'),
					 mktype('void')] },
		   null)) {
	    errors.push([ { message: "Output of main must be of type world.",
			    data: ores.nodes[0] } ]);
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

exports.mktype = mktype
exports.typecheck = typecheck

})()
},{"./builtins":"DzQqsi","./nodelist":1}],1:[function(require,module,exports){
// Builds a map out of a node list for easy lookups
function buildmap(nlist) {
    nmap = {}
    for (var k in nlist) {
	nmap[nlist[k].id] = nlist[k]
    }
    return nmap;
}

// Topologically sorts a node list
// Returns either
//   { success:true, results: sorted-node-list }
// or
//   { success:false, results: error-list }
function toposort(nlist) {
    // Sorted List
    var topolist = [];
    var errors = [];

    var nmap = buildmap(nlist);
    var marks = {};

    function visit(n) {
	if (typeof n == 'undefined')
	    return;
	if (marks[n.id] == 1) {
	    errors.push({ type: 'cycle', data: n});
	} else if (marks[n.id] == 2) {
	    // Already visited.
	} else {
	    marks[n.id] = 1;
	    for (var x in n.in) {
		visit(nmap[n.in[x]]);
	    }
	    marks[n.id] = 2;
	    topolist.push(n);
	}
    }

    // Visit every node
    for (var k in nlist) {
	visit(nlist[k]);
    }

    if (errors.length > 0) {
	return { success: false,
		 results: errors };
    }
    return { success: true,
	     results: topolist };
}

// Exports decls
exports.buildmap = buildmap;
exports.toposort = toposort;

},{}]},{},[])
;