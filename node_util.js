function redrawNode(node, new_num_inputs){
    console.log("IN redrawNode", node.num_inputs, new_num_inputs);
    // reducing the number of inputs
    if(node.num_inputs > new_num_inputs){
        console.log(" >>>>");
        var subtract = node.num_inputs - new_num_inputs;
        for(var i = node.num_inputs - 1; i >= new_num_inputs; i--){
            var edge = node.input_edges[i];
            if(edge.connected){
            
                //edge.out_anchor.setX(edge.in_anchor.getX());
                //edge.out_anchor.setY(edge.in_anchor.getY() - 50);
                //edge.out_anchor.setVisible(true);
                    
                // remove the node to which this edge is 
                // connected from the list of input nodes of this node
                removeInputNode(edge.owner_node, edge.outside, edge);
    
                // remove this node from the list of output nodes of 
                // the node to which this edge is connected
                removeOutputNode(edge.outside, edge.owner_node);
            }

            //redrawLine(edge);
            edge.connected = false;
            //node.visual.draw();
            edge.outside = null;
            
            var edge = node.input_edges.pop();
            edge.edge_group.setVisible(false);
            edge.edge_group.draw();
            edge.edge_group.destroy();
            node.input_labels[i].setVisible(false);
            node.input_labels[i].draw();    
            node.input_rects[i].setVisible(false);
            node.input_rects[i].draw();
            node.input_labels.pop().destroy();
            node.input_rects.pop().destroy();
            anchor_conn.pop();
        }

        node.num_inputs = new_num_inputs;
        if(node.num_inputs > 4){
            node.w = node.num_inputs * (node.d + node.w_io) + node.d;
            node.rect.setWidth(node.w);
        } else {
            node.rect.setWidth(170);
            node.w = 170;
        }
    
        node.del.setX(node.x + node.w - node.d);
        node.dis.setX(node.x + node.w - 3*node.d);
        node.defined_box.setX(node.x + node.w - 5*node.d);
        
        node.visual.draw();

    // increasing the number of inputs
    } else if(node.num_inputs < new_num_inputs){

        console.log(" <<<<<");
        var add = new_num_inputs - node.num_inputs;
        for(var i = 0; i < add; i++){
            node.input_rects.push(new Kinetic.Rect({
                        x: node.x +(node.num_inputs + i+1)*node.d +(node.num_inputs +i)*node.w_io,
                        y: node.y,
                        width: node.w_io,
                        height: node.h_io,
                        fill: 'yellow',
                        stroke: 'black',
                        strokeWidth: 1
                    }));


            node.input_edges.push(new Edge(
                        node.x + (node.num_inputs+ i+1)*node.d +(node.num_inputs +i)*node.w_io,
                        node.y,                   
                        node.w_io,                
                        node.h_io,                
                        node,
                        node.num_inputs+i
                    ));

            // create a label for each input
            node.input_labels.push(new Kinetic.Text({
                        //x: x + d + d + w_io + i*30,
                        x: node.x + (node.num_inputs+ i+1)*node.d +(node.num_inputs +i)*node.w_io,
                        y: node.y + node.h_io + node.d/2,
                        text: '____',   //'BOOL',
                        fontSize: 12,
                        fontFamily: 'Courier',
                        fill: 'black'
                    }));
            node.visual.add(node.input_rects[node.num_inputs + i]);
            node.visual.add(node.input_edges[node.num_inputs + i].edge_group);   
            node.visual.add(node.input_labels[node.num_inputs + i]);
        }
        node.num_inputs = new_num_inputs;
        if(node.num_inputs > 4){
            node.w = node.num_inputs * (node.d + node.w_io) + node.d;
            node.rect.setWidth(node.w);
        } else {
            node.rect.setWidth(170);
        }

        node.del.setX(node.x + node.w - node.d);
        node.dis.setX(node.x + node.w - 3*node.d);
        node.defined_box.setX(node.x + node.w - 5*node.d);

        node.visual.draw();

    // number of inputs stays the same
    } else {
        console.log(" ==== ");
        // no need to do anything
    }    
}

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
            input_edge.out_anchor.setX(input_edge.in_anchor.getX());
            input_edge.out_anchor.setY(input_edge.in_anchor.getY() - 50);
            //input_edge.out_anchor.setY(input_edge.out_anchor.getY() + 30);
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
                    temp_edge.out_anchor.setX(temp_edge.in_anchor.getX());
                    temp_edge.out_anchor.setY(temp_edge.in_anchor.getY() - 50);
                    //temp_edge.out_anchor.setY(temp_edge.out_anchor.getY() +30);
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
    //node.visual.setVisible(false);
    // removeNode(node.id);
}

// parses a string expression for number of unique variables
// returns a number
function parseExpression(str) {
    var base = "a".charCodeAt(0);
    var base_cap = "A".charCodeAt(0);
    var count = 0;
    var counter = [];
    for(var i = 0; i < 26; i++){
        counter.push(0);
    }
    var counter_cap = [];
        for(var i = 0; i < 26; i++){
        counter_cap.push(0);
    }

    for(var i = 0; i < str.length; i++){
        if(str.charAt(i) <= 'z' && str.charAt(i) >= 'a'){
            //console.log(str.charCodeAt(i) - base, str.charAt(i));
            if(counter[str.charCodeAt(i) - base] == 0){
                counter[str.charCodeAt(i) - base] = 1;
                count++;
            }
        } else if(str.charAt(i) <= 'Z' && str.charAt(i) >= 'A'){
            //console.log(str.charCodeAt(i) - base, str.charAt(i));
            if(counter_cap[str.charCodeAt(i) - base_cap] == 0){
                counter_cap[str.charCodeAt(i) - base_cap] = 1;
                count++;
            }
        }
    }
    //console.log(count, "count");
    console.log("in parse", str, "count:", count, str.length);
    return count;
}

var arith = require('./arith');
var typesystem = require('./typesystem'); 

function transformNode(node) {
    var foo = {};
    foo.id = node.id;
    foo.kind = node.kind;
    if (node.kind === 'function')
        foo.name = node.name;
    //foo.input_types = node.input_types;
    //foo.output_type = node.output_type;

    console.log("Transforming node", node);
    if (node.kind === 'constant')
        foo.value = node.contents_field.getText();
    if (node.kind === 'arithmetic')
        foo.value = node.expression_field.getText();

    foo.in = node.input_list;
    foo.out = node.output_list;
    return foo;
}
