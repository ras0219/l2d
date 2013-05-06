function addToolTip(layer){
    var tooltip = new Kinetic.Label({
        opacity: 0.75,
        visible: false,
        listening: false,
        text: {
          text: 'Hello foobar',
          fontFamily: 'Calibri',
          fontSize: 18,
          padding: 5,
          fill: 'white'
        },
        rect: {
          fill: 'black',
          pointerDirection: 'down',
          pointerWidth: 10,
          pointerHeight: 10,
          lineJoin: 'round',
          shadowColor: 'black',
          shadowBlur: 10,
          shadowOffset: 10,
          shadowOpacity: 0.2
        }
      });
    
    tooltip.hide();
    layer.add(tooltip);
    
    return tooltip;
}

function displayErrors(tcheck, def) {
    function globalError(msg){
        alert(msg);
    }

    function nodeError(node, msg){
        console.log(error.data[0].id);
        node.error_detected = true;
        node.error_message = msg;
        node.rect.setStroke('red');
        node.rect.setStrokeWidth(3);
        node.visual.draw();
    }

    function edgeError(node, edge, msg){
        console.log("edge", edge);
        edge.error_detected = true;
        edge.error_message = msg;
        edge.line.setStroke('red');
        edge.in_anchor.setFill('red');
        edge.out_anchor.setFill('red');
        edge.edge_group.draw();
    }

    var errors = tcheck.errors;
    for(var i = 0; i < errors.length; i++){
        var error = errors[i];
        console.log(error);
        if(error.code == 0){
            globalError(error.data[0]);
        } else if(error.code == 1){
            var node = findNode(error.data[0].id, def.memberNodes);
            def.error_node_list.push(node);
            nodeError(node, error.data[0].msg);

        } else if(error.code == 2){
            var node = findNode(error.data[0].id, def.memberNodes);
            var edge_id = error.data[1];
            var edge = node.input_edges[edge_id];
            def.error_edge_list.push(edge);
            edgeError(node,edge,error.data[2]);

        } else if(error.code == 1000){
            globalError("The function definition needs an Output.");

        } else if(error.code == 1001){
            var node = findNode(error.data[0].id, def.memberNodes);
            def.error_node_list.push(node);
            nodeError(node, 'Incorrect number of inputs');         
   
        } else if(error.code == 1002){
            var node = findNode(error.data[0].id, def.memberNodes);
            var edge_id = error.data[1];
            var edge = node.input_edges[edge_id];
            def.error_edge_list.push(edge);
            edgeError(node,edge,'Input not connected.');

        } else if(error.code == 2000){
            var node = findNode(error.data[0].id, def.memberNodes);
            var edge_id = error.data[1];
            var edge = node.input_edges[edge_id];
            def.error_edge_list.push(edge);
            edgeError(node, edge, 'Incompatible input types. Type 1: ' 
                                    + typesystem.string_of_type(error.data[2]) 
                                    + ' and Type 2: ' 
                                    + typesystem.string_of_type(error.data[3]));

        } else if(error.code == 3000){
            globalError("The function definition needs an Input.");

        } else if(error.code == 3001){
            var node = findNode(error.data[0].id, def.memberNodes);
            def.error_node_list.push(node);
            nodeError(node,'Input of main must be of type world.');

        } else if(error.code == 3002){
            var node = findNode(error.data[0].id, def.memberNodes);
            def.error_node_list.push(node);
            nodeError(node,'Output of main must be of type world.');
        } else if(error.code == 5000){
            var node = findNode(error.data[0].id, def.memberNodes);
            def.error_node_list.push(node);
            nodeError(node,'Cycle Detected');
        }
    }
}

function clearErrors(def){
    var node_list = def.error_node_list;
    var edge_list = def.error_edge_list;
    for(var i = 0; i < node_list.length; i++){
        node_list[i].error_detected = false;
        node_list[i].error_message = '';
        node_list[i].rect.setStrokeWidth(5);
        node_list[i].rect.setStroke('white');
        node_list[i].visual.draw();
        //node_list[i].rect.draw();
        node_list[i].rect.setStrokeWidth(1);
        node_list[i].rect.setStroke('black');
        //node_list[i].rect.draw();
        node_list[i].visual.draw();
    }

    for(var i = 0; i < edge_list.length; i++){
        edge_list[i].error_detected = false;
        edge_list[i].error_message = '';
        edge_list[i].line.setStroke('blue');
        edge_list[i].in_anchor.setFill('blue');
        edge_list[i].out_anchor.setFill('blue');
        edge_list[i].edge_group.draw();
    }

    node_list = [];
    edge_list = [];
}

function findNode(id, memberNodes){
    for(var i = 0; i < memberNodes.length; i++){
        if(memberNodes[i].id == id){
            return memberNodes[i];
        }
    }
    return null;
}
