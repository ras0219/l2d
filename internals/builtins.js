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
