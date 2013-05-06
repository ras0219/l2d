var nodelist = require('./nodelist');
var toposort = nodelist.toposort;
var buildmap = nodelist.buildmap;

var evalarith = require('./arith').eval;

var typesystem = require('./typesystem');
var mktype = typesystem.mktype;
var typecheck = typesystem.typecheck;
var getfinaltype = typesystem.getfinaltype;

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
            if (getfinaltype(node).name == 'number')
                values[node.id] = parseInt(node.value);
            else if (getfinaltype(node).name == 'number')
                values[node.id] = (node.value == 'true' || node.value == 'True');
            else
	        values[node.id] = node.value;
	} else if (node.kind == 'function') {
	    // Lookup argument values
	    argvals = node.in.map(function (v) { return values[v]; });
	    // Dispatch function
	    values[node.id] = dispatch(node.name, argvals);
	} else if (node.kind == 'arithmetic') {
	    argvals = node.in.map(function (v) { return values[v]; });
            values[node.id] = evalarith(node.ast, node.check.vset, argvals);
        } else if (node.kind == 'recursion') {
	    argvals = node.in.map(function (v) { return values[v]; });
            values[node.id] = evaluate(nlist, argvals);
        }
    }

    for (var x in nlist) {
	if (nlist[x].kind == 'output') {
	    return evalNode(nlist[x]);
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
