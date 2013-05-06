


// type := { name: 'tuple', args: [<type>] }
//       | { name: 'int' }
//       | { name: 'string' }
//       | { name: 'bool' }
//
// mktype("((string, int), int)")
// -> {name: 'tuple', args: [{name: 'tuple', args: ['string', 'int']}, 'int']}

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


console.log(mktype("((string, int), int)"));
console.log(mktype("world"));
console.log(mktype("bool"));


var defmap = {
    print: {
	kind: 'function',
	type: ['string', 'world', 'world'],
	body: function (st, world) {
	    alert(st);
	    return world;
	}
    }
};

var main = [
    {
	id: 0,

	kind: 'input',
	label: 'world_in', // world_in :: World
	type: mktype('world'),
	
	in: [],
	out: [2]
    },
    {
	id: 1,

	kind: 'constant',
	type: 'string', // constant :: String
	text: 'Hello, World!\n',
	
	in: [],
	out: [2]
    },
    {
	id: 2,

	kind: 'function',
	name: 'print', // print :: String -> World -> World

	in: [1, 0],
	out: [3]
    },
    {
	id: 3,

	kind: 'output',

	in: [2],
	out: []
    }
];
