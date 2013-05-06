function initFunctionNode(node){
    // inputs
}

// correct the posiotions of the text boxes
function initConstantNode(node){
    node.typed = false;
    node.defined = false;
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

    node.contents_field = new Kinetic.Text({
                    //x: node.x + node.d + node.d + node.w_io - 50,
                    x: node.x + 100,
                    //y: node.y + node.h - node.h_io + node.d - 30,
                    y: node.y,// - 30,
                    text: 'CONTENTS',
                    fontSize: 12,
                    fontFamily: 'Courier',
                    fill: 'black'
                });

    node.defined_box = new Kinetic.Rect({
                    x: node.x + node.w - 2*node.d,
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
    node.defined = false;
    node.typed = false;
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

    node.expression_field = new Kinetic.Text({
                    //x: node.x + node.d + node.d + node.w_io - 50,
                    x: node.x + 100,
                    //y: node.y + node.h - node.h_io + node.d - 30,
                    y: node.y - 30,
                    text: 'CONTENTS',
                    fontSize: 12,
                    fontFamily: 'Courier',
                    fill: 'black'
                });

    node.defined_box = new Kinetic.Rect({
                    x: node.x + node.w - 2*node.d,
                    y: node.y + node.h - node.d,
                    width: node.d,
                    height: node.d,
                    fill: 'red',
                    draggable: false
                });

    node.visual.add(node.type_field);
    node.visual.add(node.contents_field);
    node.visual.add(node.defined_box)


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

    node.expression_field.on('dblclick', function(evt){
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
                //parseExpression
                node.num_inputs = parseExpression(node.expression_field.getText());

                // recalculate node.width if necessary
                if(node.num_inputs > 4){
                    node.w = node.num_inputs * (node.d + node.w_io) + node.d;
                }

                // redraw visual with new input rects and edges
                // add input boxes, etc.
                node.defined_box.draw();
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

function initInputNode(node){
    node.ordinal = 0;
    node.typed = false;

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

    
    // Type Field - any(String)
    // 1 input only (input rect does not react / no edge)
    // 1 output only
    // no limit on how many in function definition
}

function initOutput(node){
    // Type Field - any(String)
    // 1 input only
    // 1 output only (output rect does not react)
    // only one Output Node per Definition
}
