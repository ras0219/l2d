// correct the posiotions of the text boxes
function initConstantNode(node){
    node.typed = false;
    node.defined = false;
    node.type_field = new Kinetic.Text({
                    //x: node.x + node.d + node.d + node.w_io - 40,
                    x: node.x + 0.5*node.d,
                    //y: node.y + node.h - node.h_io + node.d - 30,
                    y: node.y + 0.5*node.d,
                    text: 'TYPE',
                    fontSize: 12,
                    fontFamily: 'Courier',
                    fill: 'black'
                });

    node.contents_field = new Kinetic.Text({
                    //x: node.x + node.d + node.d + node.w_io - 50,
                    x: node.x + 2*node.d + node.w_io,
                    //y: node.y + node.h - node.h_io + node.d - 30,
                    y: node.y + 0.5*node.d,// - 30,
                    text: 'CONTENTS',
                    fontSize: 12,
                    fontFamily: 'Courier',
                    fill: 'black'
                });

    node.defined_box = new Kinetic.Rect({
                    x: node.x + node.w - 5*node.d,
                    y: node.y + node.h - node.d,
                    width: node.d,
                    height: node.d,
                    fill: 'red',
                    draggable: false
                });

    node.type_field.on('dblclick', function(evt){
            var item = evt.targetNode;
            // working
            if( item.getShapeType() == 'Text' )
            {
                var type=prompt("Please enter a name for the definition",item.getText());
                node.type_field.setText(type);
                //this.setText(name);
                node.type_field.draw();
                node.visual.draw();
            }
            node.defined = false;
            node.defined_box.setFill('red');
            node.defined_box.draw();
            node.typed = true;
    });

    node.contents_field.on('dblclick', function(evt){
            if(node.typed){
                var item = evt.targetNode;
                // working
                if( item.getShapeType() == 'Text' )
                {
                    var type=prompt("Please enter a name for the definition",item.getText());
                    node.contents_field.setText(type);
                    //this.setText(name);
                    node.visual.draw();
                }
                node.defined = true;
                node.defined_box.setFill('green');
                node.defined_box.draw();
            }
    });

    node.visual.add(node.type_field);
    node.visual.add(node.contents_field);
    node.visual.add(node.defined_box)

    // Type Field
    // Contents Field
    // No inputs
    // Output - yes
    // double-click on Type -> set it
    // double-click on Contents -> set it
    // a small square - to show if the constant has been defined (once both fields have been set)
}

function initArithmeticNode(node){
    node.output_text.setY(node.y + node.d + 2.6*node.d + node.h_io);
    //node.output_text.setY();

    node.node_text.setY(node.y + node.d + 2.6*node.d + node.h_io);
    node.node_text.setText("Const");

    node.defined = false;
    node.typed = true;
    /*node.typed = false;
    node.type_field = new Kinetic.Text({
                    //x: node.x + node.d + node.d + node.w_io - 40,
                    x: node.x + 10,
                    //y: node.y + node.h - node.h_io + node.d - 30,
                    y: node.y - 30,
                    text: 'TYPE',
                    fontSize: 12,
                    fontFamily: 'Courier',
                    fill: 'black'
                });

    node.type_field.owner_node = node; */

    node.expression_field = new Kinetic.Text({         //all
                    x: node.x + node.d + node.d/2 + node.w_io,
                    //x: node.x + 3*node.d + 2*node.w_io,
                    y: node.y + node.d + 1.3*node.d + node.h_io,
                    text: '------',
                    fontSize: 12,
                    fontFamily: 'Courier',
                    fill: 'black'
                });

    node.expression_field.owner_node = node;

    node.defined_box = new Kinetic.Rect({
                    x: node.x + node.w - 5*node.d,
                    y: node.y + node.h - node.d,
                    width: node.d,
                    height: node.d,
                    fill: 'red',
                    draggable: false
                });

    //node.visual.add(node.type_field);
    node.visual.add(node.expression_field);
    node.visual.add(node.defined_box)


    /*node.type_field.on('dblclick', function(evt){
            var item = evt.targetNode;
            // working
            if( item.getShapeType() == 'Text' )
            {
                var type=prompt("Please enter a name for the definition",item.getText());
                node.type_field.setText(type);
                //this.setText(name);
                node.type_field.draw();
                node.visual.draw();
            }
            node.defined = false;
            node.defined_box.setFill('red');
            node.defined_box.draw();
            node.typed = true;
    });*/

    node.expression_field.on('dblclick', function(evt){
            if(node.typed){
                var item = evt.targetNode;
                // working
                if( item.getShapeType() == 'Text' )
                {
                    var input_text=prompt("Please enter an expression",item.getText());
                    this.setText(input_text);
                    var new_num_inputs = 0;
                    try{
                        // arith.{tokenize, parse, findVars, eval}
                        var tokens = arith.tokenize(input_text);
                        var parsed = arith.parse(tokens);
                        new_num_inputs = Object.keys(arith.findVars(parsed)).length;
                        
                    } catch(err) {
                        console.log("caught error from arith",err.message);
                        //txt="There was an error on this page.\n\n";
                        //txt+="Error description: " + err.message + "\n\n";
                        //txt+="Click OK to continue.\n\n";
                        //alert(txt);
                    }

                    //var new_num_inputs = parseExpression(input_text);
                    console.log(new_num_inputs, "  num new inputs");
                    redrawNode(this.owner_node, new_num_inputs);
                    if(new_num_inputs == 0){
                        this.setText("_");
                        node.defined = false;
                        node.defined_box.setFill('red');
                    } else {
                        node.defined = true;
                        node.defined_box.setFill('green');
                    }
                    node.defined_box.draw();
                    this.owner_node.visual.draw();
                }
            }
    });

    // Type Field (Boolean / Numeric)
    // Expression Field
    // Inputs - based on a parse of the Expression
    //        - type is based on Type Field
    // Output - type is based on Type Field
    // double-click on Type -> set it
    // double-click on Contents -> set it -> parse -> draw()
}

function initOutputNode(node){
    // Type Field - any(String)
    // 1 input only
    // 1 output only (output rect does not react)
    // only one Output Node per Definition
    // generate the output rectangle    //all

    node.output.setX(node.x + 2*node.d + node.w_io);
    //node.output_circle.setX(node.x + 2*node.d + node.w_io + (node.w_io - 10)/2 + node.d/2);
    node.output_text.setX(node.x + 2*node.d + node.d/2 + 2*node.w_io);

    node.node_text.setText("Output");
    node.node_text.setX(node.x + 2*node.d + 0.5*node.d + 3*node.w_io);
    node.node_text.setY(node.y + node.h - node.h_io - node.d/2);
}

function initInputNode(node){
    // Type Field - any(String)
    // 1 input only (input rect does not react / no edge)
    // 1 output only
    // no limit on how many in function definition    

    //node.ordinal = 0;
    node.typed = false;

    /*node.type_field = new Kinetic.Text({
                    //x: node.x + node.d + node.d + node.w_io - 40,
                    x: node.x + 10,
                    //y: node.y + node.h - node.h_io + node.d - 30,
                    y: node.y - 30,
                    text: 'TYPE',
                    fontSize: 12,
                    fontFamily: 'Courier',
                    fill: 'black'
                });*/

    node.output.setX(node.x + 2*node.d + node.w_io);
    node.output_circle.setX(node.x + 2*node.d + node.w_io + (node.w_io - 10)/2 + node.d/2);
    node.output_text.setX(node.x + 2*node.d + node.d/2 + 2*node.w_io);

    node.node_text.setText("Input");
    node.node_text.setX(node.x + 2*node.d + 0.5*node.d + 3*node.w_io);
    node.node_text.setY(node.y + node.h - node.h_io - node.d/2);
    
    
}
