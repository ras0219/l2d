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

function displayErrors(tcheck, def){
    var errors = tcheck.errors;
    for(var i = 0; i < errors.length; i++){
        var error = errors[i];
        console.log(error);
        if(error.code == 1000){
            alert("The function definition needs an Output.");
        } else if(error.code == 1001){
            // node
            var node = findNode(error.data[0].id, def.memberNodes);
            console.log(error.data[0].id);
            
            // incorrect number of inputs
            // display tooltip at node
            
        } else if(error.code == 1002){
             // node
            var node = findNode(error.data[0].id, def.memberNodes);
            console.log("node id",error.data[0].id);

            // edge id
            var edge_id = error.data[1];
            console.log("edge_id",edge_id);

            // edge has error
            var edge = node.input_edges[edge_id];
            console.log("edge", edge);
            edge.error_detected = true;
            edge.error_message = 'Input not connected.';
            edge.line.setStroke('red');
            edge.in_anchor.setFill('red');
            edge.out_anchor.setFill('red');

        } else if(error.code == 2000){
            // node
            var node = findNode(error.data[0].id, def.memberNodes);
            console.log(error.data[0].id);

            // edge id
            var edge_id = error.data[1];
            console.log(edge_id);

            // edge has error
            var edge = node.input_edges[edge_id];
            edge.error_detected = true;
            edge.error_message = 'Incompatible input types. + Type 1 and Type 2';

        } else if(error.code == 3000){
            alert("The function definition needs an Input.");
        } else if(error.code == 3001){
            // node
            var node = findNode(error.data[0].id, def.memberNodes);
            console.log(error.data[0].id);
            node.error_detected = false;
            node.error_message = 'Input of main must be of type world.';
        } else if(error.code == 3002){
            // node
            var node = findNode(error.data[0].id, def.memberNodes);
            console.log(error.data[0].id);
            node.error_detected = false;
            node.error_message = 'Output of main must be of type world.';
        }
    }
}

function findNode(id, memberNodes){
    for(var i = 0; i < memberNodes.length; i++){
        if(memberNodes[i].id == id){
            return memberNodes[i];
        }
    }
    return null;
}
