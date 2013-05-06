function redrawLine(edge){
    if(edge.connected){
        var xy_own = edge.owner_node.visual.getAbsolutePosition();
        var xy_out = edge.outside.visual.getAbsolutePosition();
        var x_own = xy_own.x;
        var y_own = xy_own.y;
        var x_out = xy_out.x;
        var y_out = xy_out.y;
        
        // distance between the two node.visuals
        var delta_x = x_out - x_own;
        var delta_y = y_out - y_own;

        // finding the outside local delta:
        // the distance from the [0,0] of the output circle
        // in the outside's local coordinates
        outside_delta_x = edge.outside.output_circle.getX();
        outside_delta_y = edge.outside.output_circle.getY();
                
        edge.line.setPoints([ edge.in_anchor.getX(), 
                              edge.in_anchor.getY(),
                              delta_x + outside_delta_x, 
                              delta_y + outside_delta_y ]);
        edge.out_anchor.setX(delta_x + outside_delta_x);
        edge.out_anchor.setY(delta_y + outside_delta_y);

    } else {
        edge.line.setPoints([ edge.in_anchor.getX(),  edge.in_anchor.getY(), 
                              edge.out_anchor.getX(), edge.out_anchor.getY()]);
    }
}


function Edge(x, y, w, h, node, id){
    this.id = id;
    this.owner_node = node;
    this.outside = null;    // node to which this edge connects
    
    var d = 50;

    this.in_x = x;
    this.in_y = y;

    this.out_x = x;
    this.out_y = y - 50;

    this.w = w;
    this.h = h;

    this.connected = false;
    this.error_detected = false;

    this.error_message = '';

    this.edge_group = new Kinetic.Group({
                    draggable: false
                });

    this.in_anchor = createInAnchor(this.in_x, 
                                    this.in_y, 
                                    this.w, 
                                    this);

    this.out_anchor = createOutAnchor(this.out_x, 
                                      this.out_y, 
                                      this.w, 
                                      this);

    this.line = createLine(this);
    
    this.line.on('mouseover', function() {
        if(this.owner_edge.error_detected){
            var mousePos = this.getStage().getMousePosition();
            console.log("mouse position",mousePos);
            var tooltip = this.owner_edge.owner_node.ownerdef.tooltip;
            tooltip.setPosition(mousePos.x,mousePos.y - 5);
            tooltip.getText().setText("Error: " + this.owner_edge.error_message);
            tooltip.show();
            this.owner_edge.owner_node.ownerdef.tooltipLayer.draw();
        }
      });

    this.line.on('mouseout', function(){
            this.owner_edge.owner_node.ownerdef.tooltip.hide();
            this.owner_edge.owner_node.ownerdef.tooltipLayer.draw();
        });

    this.edge_group.add(this.line);
    this.edge_group.add(this.in_anchor);
    this.edge_group.add(this.out_anchor);
}

// anchor at node's input
function createInAnchor(x, y, w, edge){
    var anchor = new Kinetic.Circle({
                    x: x + (w - 10)/2 + 5,
                    y: y + (w - 10)/2 + 5,
                    radius: (w - 10)/2,
                    fill: 'blue',
                    stroke: 'black',
                    strokeWidth: 1,
                    draggable: false
                });    

    anchor.on('dblclick', function() {
            if(edge.connected){
                edge.connected = false;
                edge.out_anchor.setX(edge.in_anchor.getX());
                edge.out_anchor.setY(edge.in_anchor.getY() - 50);
                edge.out_anchor.setVisible(true);
                
                // remove the node to which this edge is 
                // connected from the list of input nodes of this node
                removeInputNode(edge.owner_node, edge.outside, edge);

                // remove this node from the list of output nodes of 
                // the node to which this edge is connected
                removeOutputNode(edge.outside, edge.owner_node);

                redrawLine(edge);
                edge.owner_node.visual.draw();
                edge.outside = null;
            } else {
                // empty the global anchor_conn variable
                anchor_conn.pop();
            }
            this.draw();
    });
    return anchor; 
}

// anchor which connects to output
function createOutAnchor(x, y, w, edge){
    var anchor = new Kinetic.Circle({
                    x: x + (w - 10)/2 + 5,
                    y: y + (w - 10)/2 + 5,
                    radius: (w - 10)/2,
                    fill: 'blue',
                    stroke: 'black',
                    strokeWidth: 1,
                    draggable: true
                });

    anchor.on('dragmove', function() {
            // this.setStrokeWidth(4);
            redrawLine(edge);
            edge.owner_node.visual.draw();
    });

    
    anchor.on('mouseover', function() {
          document.body.style.cursor = 'pointer';
          this.setStrokeWidth(3);
          this.draw();
    });

    anchor.on('mouseout', function() {
            document.body.style.cursor = 'default';
            this.setStrokeWidth(1);
            edge.owner_node.visual.draw();
          
    }); 

    anchor.on('mouseup', function() {
            redrawLine(edge);
            edge.owner_node.visual.draw();
			console.log('drop anchor');
			
            if(anchor_conn.length == 0){
                anchor_conn.push(edge);
                console.log(anchor_conn, "anchor");
            } else {
                anchor_conn.pop();
                anchor_conn.push(edge);
                console.log(anchor_conn, "anchor");
            }
			var mousePos = canvasStage.getMousePosition();
			tryConnectNode( edge, mousePos);
    });

    // add out_anchor to global variable as candidate for connection
    anchor.on('dblclick', function() {
            if(anchor_conn.length == 0){
                anchor_conn.push(edge);
                console.log(anchor_conn, "anchor");
            } else {
                anchor_conn.pop();
                anchor_conn.push(edge);
                console.log(anchor_conn, "anchor");
            }
    });
    return anchor; 
}

function createLine(edge){
    var line = new Kinetic.Line({
                    points: [ edge.in_anchor.getX(), edge.in_anchor.getY(), 
                              edge.out_anchor.getX(), edge.out_anchor.getY()],
                    stroke: 'blue',
                    strokeWidth: 4,
                    lineCap: 'round',
                    lineJoin: 'round'
                });
    line.owner_edge = edge;

    // just a test function
    line.on('dblclick', function() {
            wrongLine(line);
            this.draw();
    });
    return line;
}

// need a function which switches the color of the line
function wrongLine(line){
    line.setStroke('red');
}

// returns the color of the line to the correct one
function correctLine(line){
    line.setStroke('blue');
}
