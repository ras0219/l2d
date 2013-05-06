function createGroup(node){
    var group = new Kinetic.Group({
					item: node,
                    draggable: true
                });

    group.on('dragmove', function(){
            for(var i = 0; i < node.input_edges.length; i++){
                redrawLine(node.input_edges[i]);
            }
            for(var i = 0; i < node.output_nodes.length; i++){
                var edges = node.output_nodes[i].input_edges;                    
                for(var j = 0; j < edges.length; j++){
                    redrawLine(edges[j]);
                }
            }                
            //group.moveToTop();
    });
    //group.on('mouseover',function(){
    //          group.moveToTop();         
    //});
    return group;
}

function removeInputNode(node, outside, edge){
    console.log(edge.id,"removeInputNode");
    node.input_list[edge.id] = null;
}

// removes only 1 edge with the specified output node
function removeOutputNode(outside_node, output_node){
    for(var i = 0; i < outside_node.output_nodes.length; i++){
        if(outside_node.output_nodes[i].id == output_node.id){
            outside_node.output_nodes.splice(i,1);
            outside_node.output_list.splice(i,1);
            break;
        }
    }
}

function disconnectNode(node){
    // disconnect all input nodes
    for(var i = 0; i < node.input_edges.length; i++){
        var input_edge = node.input_edges[i];
        if(input_edge.connected){
            input_edge.connected = false;
            input_edge.out_anchor.setY(input_edge.out_anchor.getY() + 30);
            input_edge.out_anchor.setVisible(true);
                   
            // remove the node to which this edge is 
            // connected from the list of input nodes of this node
            removeInputNode( input_edge.owner_node, 
                             input_edge.outside, 
                             input_edge);
    
            // remove this node from the list of output nodes of 
            // the node to which this edge is connected
            removeOutputNode(input_edge.outside, input_edge.owner_node);
            redrawLine(input_edge);
            node.visual.draw();
            input_edge.outside = null;
        }
    }
    // for each node in output_list go through their edges and disconnect all 
    // which have this node's id at their anchor (outside);
    // go through all nodes which are in the connected-to-output list
    for(var i = 0; i < node.output_nodes.length; i++){
        var output_node = node.output_nodes[i];
        // go through the edges of each connected node
        for(var j = 0; j < output_node.input_edges.length; j++){
            // check if edge is connected
            var temp_edge = output_node.input_edges[j];
            if(temp_edge.connected){
                // check if edge is connected to this node
                if(temp_edge.outside.id == node.id){
                    temp_edge.connected = false;
                    temp_edge.out_anchor.setY(temp_edge.out_anchor.getY() +30);
                    temp_edge.out_anchor.setVisible(true);
                   
                    // remove the node to which this edge is 
                    // connected from the list of input nodes of this node
                    removeInputNode( temp_edge.owner_node, 
                                     temp_edge.outside, 
                                     temp_edge);
    
                    // remove this node from the list of output nodes of 
                    // the node to which this edge is connected
                    //removeOutputNode(temp_edge.outside, temp_edge.owner_node);
                    redrawLine(temp_edge);
                    temp_edge.owner_node.visual.draw();
                    //temp_edge.owner_node.input_edges[i].outside = null;
                    temp_edge.outside = null; //??
                }
            }
        }
    }
    // empty output_nodes and output_list
    node.output_nodes = [];
    node.output_list = [];
    node.visual.setVisible(false);
    // removeNode(node.id);
}

// parses a string expression for number of unique variables
// returns a number
function parseExpression(str) {
    var base = "a".charCodeAt(0);
    var count = 0;
    var counter = [];
    for(var i = 0; i < 26; i++){
        counter.push(0);
    }
    
    for(var i = 0; i < str.length; i++){
        if(str.charAt(i) <= 'z' && str.charAt(i) >= 'a'){
            //console.log(str.charCodeAt(i) - base, str.charAt(i));
            if(counter[str.charCodeAt(i) - base] == 0){
                counter[str.charCodeAt(i) - base] = 1;
                count++;
            }
        }
    }
    //console.log(count, "count");
    return count;
}

function transformNode(node) {
    var foo = {};
    foo.id = node.id;
    foo.kind = node.kind;
    if (node.kind === 'function')
        foo.name = node.name;
    //foo.input_types = node.input_types;
    //foo.output_type = node.output_type;
    foo.in = node.input_list;
    foo.out = node.output_list;
    return foo;
}
