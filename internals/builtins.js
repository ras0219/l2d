//////////////////////////////////////////////////////////////////////
// Builtins
function printfun(s) {
    console.log(s);
}

///////////////////////////////////
// Definition Map containing builtins
var v0 = { name: 'variable', id: 0 };
var v1 = { name: 'variable', id: 1 };

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
		      v0,
		      v1
		  ]
		},
		v0
	    ]
	},
	body: function (t) { return t[0]; }
    },
    snd: {
	kind: 'builtin',
	type: {
	    name: 'fn',
	    args: [ { name: 'tuple', args: [ v0, v1 ] }, v1 ]
	},
	body: function (t) { return t[1]; }
    },
    pair: {
	kind: 'builtin',
	type: {
	    name: 'fn',
	    args: [ v0, v1, { name: 'tuple', args: [ v0, v1 ] } ]
	},
	body: function (a, b) { return [a, b]; }
    },
    stringofnumber: {
	kind: 'builtin',
	type: { name: 'fn', args: [
            { name: 'number' },
            { name: 'string' }
        ] },
	body: function (a) { return a + ''; }
    },
    stringofbool: {
	kind: 'builtin',
	type: { name: 'fn', args: [
            { name: 'bool' },
            { name: 'string' }
        ] },
	body: function (a) { return a + ''; }
    },
    single: {
	kind: 'builtin',
	type: { name: 'fn', args: [
            v0,
            { name: 'list', args: [v0] }
        ] },
	body: function (a) { return [1, a, [0]]; }
    },
    nil: {
	kind: 'builtin',
	type: { name: 'list', args: [v0] },
	body: function () { return [0]; }
    },
    head: {
	kind: 'builtin',
	type: { name: 'fn', args: [
            { name: 'list', args: [v0] },
            v0
        ] },
	body: function (a) {
            if (a[0] == 0)
                throw "Empty list.";
            return a[1];
        }
    },
    tail: {
	kind: 'builtin',
	type: { name: 'fn', args: [
            { name: 'list', args: [v0] },
            { name: 'list', args: [v0] }
        ] },
	body: function (a) {
            if (a[0] == 0)
                throw "Empty list.";
            return a[2];
        }
    },
    length: {
	kind: 'builtin',
	type: { name: 'fn', args: [
            { name: 'list', args: [v0] },
            { name: 'number' }
        ] },
	body: function (a) { return a[0]; }
    },
    append: {
	kind: 'builtin',
	type: { name: 'fn', args: [
            v0,
            { name: 'list', args: [v0] },
            { name: 'list', args: [v0] }
        ] },
	body: function (a, l) { return [l[0]+1, a, l]; }
    },
    concat: {
	kind: 'builtin',
	type: { name: 'fn', args: [
            { name: 'list', args: [v0] },
            { name: 'list', args: [v0] },
            { name: 'list', args: [v0] }
        ] },
	body: function r(l, m) {
            if (l[0] == 0)
                return m;
            var n = r(l[2], m);
            return [n[0]+1, l[1], n];
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
