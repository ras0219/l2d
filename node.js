
// for final Node we need id, kind?, num_inputs, a list of input types, 
// a list of output, and name of definition
//function Node(id, kind, num_in, input_types, output_type, def_name){
function createNode(predefid, curdefid){
    //var num_inputs = Math.floor((Math.random()*5)+1);
    
    var curdef = getDefinitionById( curdefid );
    var predef = getDefinitionById( predefid );

    predef.referingNodes.push( this );
    curdef.memberNodes.push( this );

    this.name = predef.name;
    this.id = curdef.getNodeIndex();

    this.refdef = predef;
    this.ownerdef = curdef;
	this.ownerdef.activeNode = this.id;

    this.setName = function( name )
    {
		this.name = name;
        this.node_text.setText( name );
        this.ownerdef.layer.draw();
    };
	
    this.kind = predef.kind;
    this.num_inputs = predef.numArgs;   //num_in;
    this.input_types = [];          //input_types;
    this.output_type = "";          //output_types;
    this.node_name = predef.name;//"THIS NODE";   //def_name;

    this.error_detected = false;

    this.error_message = '';

    this.x = 75;     // starting x position for Nodes
    this.y = 75;     // starting y position for Nodes
    this.w_io = 30;  // width of input/outpur rects    
    this.h_io = 30;  // hight of input/outpur rects
    this.d = 10;     // sepration between input rects
    this.w = 4*(this.d + this.w_io) + this.d;  //170;   // width of the Node
    this.h = 2*(this.d + this.h_io);           //80;    // height of the Node

    // list of node IDs which provide input
    this.input_list = [];
    for(var i = 0; i < this.num_inputs; i++){
        this.input_list.push(null);
    }

    // list of node IDs to which output is provided
    this.output_list = [];

    // the list below is a direct reference to nodes which provide input to 
    // this node this is needed so that their coordinates can be accessed
    this.input_nodes = [];  // not used

    // the list below is a direct reference to nodes which take output from 
    // this node this is needed so that when this node is moved, the connecting
    // edges are updated dynamically
    this.output_nodes = [];

    // resize if too many inputs
    if(this.num_inputs > 4){
                this.w = this.num_inputs * (this.d + this.w_io) + this.d;
    }

    this.visual = createGroup(this);    //all

    if(this.kind == "constant"){
        this.h = this.h_io + 2*this.d;
    }

    if(this.kind == "input" || this.kind == "output"){
        this.h = this.h_io + 2*this.d;
        this.w = this.w - this.d;
    }

	this.visual.on('click', function(evt)
	{
		this.attrs.item.ownerdef.setActiveNode( this.attrs.item.id );
	});
	
    this.rect = new Kinetic.Rect({      //all
                    x: this.x,
                    y: this.y,
                    width: this.w,
                    height: this.h,
                    fill: '#ccf', //fill: 'blue',
                    stroke: 'black',
                    strokeWidth: 1
                });

    this.rect.owner_node = this;

    this.rect.on('mouseover', function(){
            if(this.owner_node.error_detected){
                var mousePos = this.getStage().getMousePosition();
                //console.log("mouse position",mousePos);
                var tooltip = this.owner_node.ownerdef.tooltip;
                tooltip.setPosition(mousePos.x,mousePos.y - 5);
                tooltip.getText().setText("Error: " + this.owner_node.error_message);
                tooltip.show();
                this.owner_node.ownerdef.tooltipLayer.draw();
            }
        });

    this.rect.on('mouseout',function(){
            this.owner_node.ownerdef.tooltip.hide();
            this.owner_node.ownerdef.tooltipLayer.draw();
        });

    // generate the output rectangle    //all
    this.output = new Kinetic.Rect({
                    //x: x + this.w/2 - w_io/2,
                    x: this.x + this.d,
                    y: this.y + this.h - this.h_io,
                    width: this.w_io,
                    height: this.h_io,
                    fill: '#88FF88',
                    stroke: 'black',
                    strokeWidth: 1,
                    draggable: false
                });

    // give it an owner node
    this.output.owner_node = this;

    if(this.kind != "output"){// || this.kind == "input"){
        // generate the output circle       //all but "output kind"
        this.output_circle = new Kinetic.Circle({
                        //x: x + this.w/2 - w_io/2  + (w_io - 10)/2 + 5,
                        x: this.x + this.d + (this.w_io - 10)/2 + 5,
                        y: this.y + this.h - this.h_io + (this.h_io - 10)/2 + 5,
                        radius: (this.w_io - 10)/2,
                        fill: '2266FF',
                    });
    
        this.output_circle.owner_node = this;       //all but "output kind"
    
        this.output_circle.on('dblclick', function(){   //all but "output kind"
                // when a double-click is registered over the output circle: check
                // to see if there's a candidate for an anchor, if so: add the 
                // output circle and make the connection between the two nodes
                if(output_conn.length == 0 && anchor_conn.length == 1  
                   && this.owner_node.id != anchor_conn[0].owner_node.id){
                    output_conn.push(this.owner_node);
    
                    // add the anchor's node to the list of nodes connected to 
                    // this node's output
                    this.owner_node.output_nodes.push(anchor_conn[0].owner_node);
    
                    // add the ID in a list of input IDs
                    this.owner_node.output_list.push(anchor_conn[0].owner_node.id);
    
                    // add this node to the list of input nodes 
                    // of the anchor's node
                    anchor_conn[0].owner_node.input_list[anchor_conn[0].id] 
                                                            = this.owner_node.id;
                    console.log('dblclick', anchor_conn[0].id);
    
                    // set the edge to connected = true
                    anchor_conn[0].outside = this.owner_node;
                    anchor_conn[0].connected = true;
    
                    anchor_conn[0].out_anchor.setVisible(false);
                    redrawLine(anchor_conn[0]);
                    anchor_conn[0].owner_node.visual.draw();
    
                    // free up the global variables for the next connection attempt
                    output_conn.pop();
                    anchor_conn.pop();
                }
        });
    
    }

    this.output.on('dblclick', function(){      //all but "output kind"
            if(this.kind != "output"){// || this.kind == "input"){
                // when a double-click is registered over the output rect: check
                // to see if there's a candidate for an anchor, if so: add the 
                // output rect and make the connection between the two nodes
                if(output_conn.length == 0 && anchor_conn.length == 1 
                   && this.owner_node.id != anchor_conn[0].owner_node.id){
                    output_conn.push(this.owner_node);
    
                    // add the anchor's node to the list of nodes connected to
                    // this node's output
                    this.owner_node.output_nodes.push(anchor_conn[0].owner_node);
    
                    // add the ID in a list of input IDs
                    this.owner_node.output_list.push(anchor_conn[0].owner_node.id);
    
                    // add this node to the list of input nodes 
                    // of the anchor's node
                    anchor_conn[0].owner_node.input_list[anchor_conn[0].id] 
                                                            = this.owner_node.id;
                    console.log('dblclick', anchor_conn[0].id);
    
                    // set the edge to connected = true
                    anchor_conn[0].outside = this.owner_node;
                    anchor_conn[0].connected = true;
    
                    anchor_conn[0].out_anchor.setVisible(false);
                    redrawLine(anchor_conn[0]);
                    anchor_conn[0].owner_node.visual.draw();
    
                    // free up the global variables for the next connection attempt
                    output_conn.pop();
                    anchor_conn.pop();
                }
            }
    });

    this.output_text = new Kinetic.Text({       //all
                    x: this.x + this.d + this.d/2 + this.w_io,
                    y: this.y + this.h - this.h_io + this.d/2,
                    text: '____',
                    fontSize: 12,
                    fontFamily: 'Courier',
                    fill: 'black'
                });

    this.node_text = new Kinetic.Text({         //all
                    //x: this.x + 3*this.d + 2*this.w_io,
                    x: this.x + 2*this.d + 2*this.w_io,
                    y: this.y + this.h - this.h_io + this.d/2,
                    text: this.node_name,
                    fontSize: 12,
                    fontFamily: 'Courier',
                    fill: 'black'
                });

    this.node_text.on('dblclick', function(evt){    // none ?
        var item = evt.targetNode;
        // working
        if( item.getShapeType() == 'Text' )
        {
            var name=prompt("Please enter a name for the definition",item.getText());
            this.node_name = name;
            this.setText(name);
            this.draw();           
        }
    });

    this.del = new Kinetic.Rect({       //all but output kind??
                    x: this.x + this.w - this.d,
                    y: this.y + this.h - this.d,
                    width: this.d,
                    height: this.d,
                    fill: 'black',
                    draggable: false
                });

    this.del_text = new Kinetic.Text({
                    x: this.x + this.w - this.d,
                    y: this.y + this.h - this.d,
                    text: 'X',   //'BOOL',
                    fontSize: 12,
                    fontFamily: 'Courier',
                    fill: 'white'
                })

    this.dis = new Kinetic.Rect({       //all but output kind??
                    x: this.x + this.w - 3*this.d,
                    y: this.y + this.h - this.d,
                    width: this.d,
                    height: this.d,
                    fill: 'blue',
                    draggable: false
                });

    this.del.owner_node = this;         //all but output kind??
    this.dis.owner_node = this;         //all but output kind??

    this.del.on("dblclick", function(){     //all but output kind??
            //console.log(this.owner_node.input_list);
            //console.log(this.owner_node.output_list);
            // this.owner_node.visual.setVisible(false);
            // this.owner_node.visual.draw();
            // this needs to call a function in the layer, which will delete 
            // this node and remove it from all other node's lists
            disconnectNode(this.owner_node);
            removeNode(this.owner_node.id);
    });

    this.del.on("mousedown", function(){    //all but output kind??
            console.log(this.owner_node.input_list);
            console.log(this.owner_node.output_list);
            //parseExpression("a*(b*c + a*b*3) - t");
            //parseExpression("abct");
            // this.owner_node.visual.setVisible(false);
            // this.owner_node.visual.draw();
            // this needs to call a function in the layer, which will delete 
            // this node and remove it from all other node's lists
    });

    this.dis.on("dblclick", function(){     //all but output kind??
            //console.log(this.owner_node.input_list);
            //console.log(this.owner_node.output_list);
            // this.owner_node.visual.setVisible(false);
            // this.owner_node.visual.draw();
            // this needs to call a function in the layer, which will delete 
            // this node and remove it from all other node's lists
            disconnectNode(this.owner_node);
    });

    this.visual.add(this.rect);
    this.visual.add(this.output);
    if(this.kind != "output"){
    	this.visual.add(this.output_circle);
    }
    this.visual.add(this.output_text);
    this.visual.add(this.node_text);
//    if(this.kind == "constant"){
//        this.visual.add(this.text_box);
//    }   
    this.visual.add(this.del);
    this.visual.add(this.dis);

    // loop for creating all input_rects
    this.input_rects = [];
    this.input_edges = []; 
    this.input_labels = [];  

    // set how many inputs will be created
    var inputs = 0;
    if(this.kind == "output" || this.kind == "input"){
        inputs = 1;
    } else if(this.kind == "arithmetic" || this.kind == "constant"){
        inputs = 0;
    } else {
        inputs = this.num_inputs;
    }

	if(this.kind === "if")
	{
		var IF_NODE_IN_COLORS = ['#FFFF88', '#88CCFF', '#88CCFF'];
	    for(var i = 0; i < inputs; i++){
	        // create a rect for each input
	        this.input_rects.push(new Kinetic.Rect({
	                        x: this.x + (i+1)*this.d + i*this.w_io,
	                        y: this.y,
	                        width: this.w_io,
	                        height: this.h_io,
	                        fill: IF_NODE_IN_COLORS[i],
	                        stroke: 'black',
	                        strokeWidth: 1
	                    }));

	        // create an edge for each input (unless we are creating an input node)
	        if(this.kind != "input"){
	            this.input_edges.push(new Edge(
	                            this.x + (i+1)*this.d + i*this.w_io,
	                            this.y,
	                            this.w_io,
	                            this.h_io,
	                            this,
	                            i
	                ));
	        }

	        // create a label for each input
	        this.input_labels.push(new Kinetic.Text({
	                        //x: x + d + d + w_io + i*30,
	                        x: this.x + (i+1)*this.d + i*this.w_io,
	                        y: this.y + this.h_io + this.d/2,
	                        text: '--__',   //'BOOL',
	                        fontSize: 12,
	                        fontFamily: 'Courier',
	                        fill: 'black'
	                    }));

	        this.visual.add(this.input_labels[i]);
	        this.visual.add(this.input_rects[i]);
	        if(this.kind != "input"){
	            this.visual.add(this.input_edges[i].edge_group);   
	        }
	    }
	}
	else
	{
	    for(var i = 0; i < inputs; i++){
	        // create a rect for each input
	        this.input_rects.push(new Kinetic.Rect({
	                        x: this.x + (i+1)*this.d + i*this.w_io,
	                        y: this.y,
	                        width: this.w_io,
	                        height: this.h_io,
	                        fill: '#FFFF88',
	                        stroke: 'black',
	                        strokeWidth: 1
	                    }));

	        // create an edge for each input (unless we are creating an input node)
	        if(this.kind != "input"){
	            this.input_edges.push(new Edge(
	                            this.x + (i+1)*this.d + i*this.w_io,
	                            this.y,
	                            this.w_io,
	                            this.h_io,
	                            this,
	                            i
	                ));
	        }

	        // create a label for each input
	        this.input_labels.push(new Kinetic.Text({
	                        //x: x + d + d + w_io + i*30,
	                        x: this.x + (i+1)*this.d + i*this.w_io,
	                        y: this.y + this.h_io + this.d/2,
	                        text: '--__',   //'BOOL',
	                        fontSize: 12,
	                        fontFamily: 'Courier',
	                        fill: 'black'
	                    }));

	        this.visual.add(this.input_labels[i]);
	        this.visual.add(this.input_rects[i]);
	        if(this.kind != "input"){
	            this.visual.add(this.input_edges[i].edge_group);   
	        }
	    }
	}

    if(this.kind == "arithmetic"){
        initArithmeticNode(this);
    }

    if(this.kind == "constant"){
        initConstantNode(this);
    }

    if(this.kind == "input"){
        initInputNode(this);
    }

    if(this.kind == "output"){
        initOutputNode(this);
    }
}
