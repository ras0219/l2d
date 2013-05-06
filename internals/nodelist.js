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
