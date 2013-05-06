var typecheck = require('./typesystem').typecheck;
var save_func = require('./builtins').save_func;

var globalvars = new GlobalSpaceVars();
function GlobalSpaceVars()
{
    this.definitionIndex = 0;

    this.getDefinitionIndex=function () {
        var id = this.definitionIndex;
        this.definitionIndex++;
        return id;
    }
}

var anchor_conn = [];
var output_conn = [];

var definitions = [];

function SpecialDefinition(name, kind)
{
	this.name = name;
	this.id = globalvars.getDefinitionIndex();
	this.kind = kind;
	
	this.numArgs = 0;
	this.inTypes = [];
	this.outType = 'undefined';
	
	definitions.push( this );
	
    this.labelItems = [];
    this.referingNodes = [];    // all the nodes refering to this definition
    this.memberNodes = [];  // nodes that are part of this definition
	
	this.removeReferingNode = function ( nodeid, defid )
	{
        var newReferingNodes = [];

        for(var i=0;i<this.referingNodes.length;i++)
        {
            var n = this.referingNodes[i];
            if( n.ownerdef.id != defid )
                newReferingNodes.push( n );
        }

        this.referingNodes = newReferingNodes;
	}
}

function Definition(name, kind)
{
    this.name = name;
    this.id = globalvars.getDefinitionIndex();
	this.kind = kind;	// function, constant, arithmetic, input, output
	
	this.activeNode = -1;
	
	this.numArgs = 0;
	this.inTypes = [];
	this.hasOutNode = false;
	this.outType = 'undefined';
	
	definitions.push( this );
		
    this.nodeIndexCounter = 0;

    this.layer = new Kinetic.Layer();
    
    // add a tooltip layer for easier drawing of the tooltip
    this.tooltipLayer = new Kinetic.Layer();
    // add a tooltip object to the tooltip layer (1 per definition)
    this.tooltip = addToolTip(this.tooltipLayer);
    // list of edges and nodes with errors
    this.error_edge_list = [];
    this.error_node_list = [];

    /// always add the definition's layer to the main stage
	canvasStage.add(this.layer);
    canvasStage.add(this.tooltipLayer);
	this.saved = false;
	
    this.labelItems = [];
    this.referingNodes = [];    // all the nodes refering to this definition
    this.memberNodes = [];  // nodes that are part of this definition

	this.setActiveNode = function( nodeid )
	{
		this.activeNode = nodeid;
		
		/*
        for(var i=0;i<this.memberNodes.length;i++)
        {
            var n = this.memberNodes[i];
			
            if( n.id === nodeid )
				n.visual.setFill('red');
			else
				n.visual.setFill('black');
        }
		this.layer.draw();
		*/
	}
	
    this.getNodeIndex = function()
    {
        var id = this.nodeIndexCounter;
        this.nodeIndexCounter++;
        return id;
    }
	
	this.updateInputs = function()
	{
		this.numArgs = 0;
		this.inTypes = [];
		
        for(var i=0;i<this.memberNodes.length;i++)
        {
            var n = this.memberNodes[i];
            if( n.kind === 'input' )
			{
				this.numArgs++;
				this.inTypes.push( n.refdef.outType );
			}
        }
		
		// update for all nodes refering to this definition
        for(var i=0;i<this.referingNodes.length;i++)
        {
            var n = this.referingNodes[i];
			
			//n.disconnectAllInputs();
		    n.input_types = this.inTypes;
		    n.input_list = [];
        }
	}

    this.updateName = function( name ){
        this.name = name;
        for(var i=0;i<this.labelItems.length;i++)
            this.labelItems[i].setVisibleText( name );

        for(var i=0;i<this.referingNodes.length;i++)
        {
            this.referingNodes[i].setName( name );
        }
    };

	this.removeMemberNode = function ( nodeid )
	{
        var newMemberNodes = [];

        for(var i=0;i<this.memberNodes.length;i++)
        {
            var n = this.memberNodes[i];
            if( n.id != nodeid )
                newMemberNodes.push( n );
        }

        this.memberNodes = newMemberNodes;
	}
	
	this.removeReferingNode = function ( nodeid, defid )
	{
        var newReferingNodes = [];

        for(var i=0;i<this.referingNodes.length;i++)
        {
            var n = this.referingNodes[i];
            if( n.ownerdef.id != defid )
                newReferingNodes.push( n );
        }

        this.referingNodes = newReferingNodes;
	}

    this.removeMemberNodeByDefId = function ( defid )
    {
        var newMemberNodes = [];

        for(var i=0;i<this.memberNodes.length;i++)
        {
            var n = this.memberNodes[i];
            if( n.refdef.id != defid )
                newMemberNodes.push( n );
        }

        this.memberNodes = newMemberNodes;
    }
}

function removeDefinition( def )
{
    var loc;
    for(var i=0;i<definitions.length;i++)
    {
        if( definitions[i].id == def.id )
        {
            loc = i;
            break;
        }
    }

    definitions.splice(loc,1);
}

function DefinitionLabelItem( defobj )
{
    this.defobj = defobj;
    this.defobj.labelItems.push( this );

    this.setName = function( name )
    {
        defobj.updateName( name );
        this.setVisibleText( name );
    }

    this.setVisibleText = function( name )
    {
        this.node.attrs.text.setText( name );
    }

    this.node = new Kinetic.Label({
        x: 0,
        y: 0,
        opacity: 0.75,
        text: {
	    item: this,
            defid: defobj.id,
            text: defobj.name,
            fontFamily: 'Calibri',
            fontSize: 18,
            padding: 5,
            fill: 'black',
            width: 150,
            align: 'center'
        },
        rect: {
            fill: '#EEFFBB',
        },
        width: 150,
        height: 20,
    });
}

function getDefinitionById( defid )
{
    for(var i=0;i<definitions.length;i++)
    {
        if( definitions[i].id === defid )
            return definitions[i];
    }
}

function getCurrentDefinition()
{
    if( curEditItem >= 0 )
        return editingItems[curEditItem].defobj;
    else
        return undefined;
}

function setDefinitionName( defid, name )
{
    var def = getDefinitionById( defid );
    def.name = name;
}

function getNodeById( nodeid, defobj )
{
    for(var i=0;i<defobj.memberNodes.length;i++)
    {
        if( defobj.memberNodes[i].id === nodeid )
            return defobj.memberNodes[i];
    }
}

/// create a node in the specified definition canvas
/*
function createNode( predefid, curdefid )
{
    var curdef = getDefinitionById( curdefid );
    var predef = getDefinitionById( predefid );

    predef.referingNodes.push( this );
    curdef.memberNodes.push( this );

    this.name = predef.name;
    this.id = curdef.getNodeIndex();

    this.refdef = predef;
    this.ownerdef = curdef;
	this.ownerdef.activeNode = this.id;

    this.setVisibleText = function( name )
    {
        this.visual.setText( name );
        this.ownerdef.layer.draw();
    };
	
    this.kind = predef.kind;
    this.input_types = predef.inTypes;
    this.output_type = predef.outType;
    this.input_list = [];
    this.output_list = [];

    // currently this is just a dummy visual representation of the node
    // should replace this with an actual graphical node
    this.visual = new Kinetic.Text({
										  item : this,
                                          x: 10,
                                          y: 10,
                                          text: predef.name,
                                          fontSize: 24,
                                          fontFamily: 'Calibri',
                                          fill: 'red',
                                          width: 120,
                                          padding: 0,
                                          align: 'center'
                                      });
	
									  
    this.visual.on('click', function(evt)
	{
		this.attrs.item.ownerdef.setActiveNode( this.attrs.item.id );
	});

    // all other stuff to do with the nodeid
    // set the kind of the node
}*/

function removeNode( nodeid )
{
	console.log( 'removing node ' + nodeid );
    var curdef = getCurrentDefinition();
	
	// remove the node from current definition
	var curNode = getNodeById(nodeid, curdef);
	
    curNode.refdef.removeReferingNode( nodeid, curdef.id );
    curNode.ownerdef.removeMemberNode( nodeid );
	
	// depending on the type of the node, do something to the current definition
	if( curNode.kind === 'input' )
	{
		curdef.updateInputs();
	}
	else if( curNode.kind === 'output' )
	{
		curdef.hasOutNode = false;
	}
	
	curNode.visual.remove();
	
	curdef.layer.draw();
}

/// open a definition
function openDefinition()
{
    alert( 'open a definition' );
}

function createDefinition()
{
    var newDef = new Definition('untitled' + definitions.length, 'function');	
    updateItemStage( newDef );
    showDefinition( newDef.id );
}

function saveDefinition()
{
    var def = editingItems[curEditItem].defobj;

    var nlist = transformDefinition(def);
    var tcheck = typecheck(nlist, false);

    if (!tcheck.success) {
    	console.log("Typechecking failed:", tcheck);
        // here we handle displaying of errors and helpful tips
        displayErrors(tcheck, def);
        
    } else {
        console.log("Typechecking success:", tcheck);
    }

    save_func(def.name, nlist, tcheck);

    if( def.saved == false )
    {
        def.saved = true;
        updateDefStage(def);
    }
}

function deleteDefinition()
{
    var curdef = getCurrentDefinition();
    if( curdef != undefined )
    {
        // remove all labels
        removeEditItem(curdef.id);
        removeDefItem(curdef.id);

        updateVisibleEditItems();
        updateVisibleDefItems();

        // remove all references in other definitions
        for(var i=0;i<curdef.referingNodes.length;i++)
        {
            var n = curdef.referingNodes[i];
            n.ownerdef.removeMemberNodeByDefId( curdef.id );
			n.visual.remove();
        }

        // remove from the definition list
        removeDefinition( curdef );

        itemLayer.draw();
        defsLayer.draw();
        canvasLayer.draw();
    }
}

function transformDefinition(curdef)
{
	var nodeObjs = [];
	/// for each node in the definition, transform it and print it out
	for(var i=0;i<curdef.memberNodes.length;i++)
	{
		nodeObjs.push( transformNode(curdef.memberNodes[i]) );
	}
	
	console.log(nodeObjs);
	return nodeObjs;
}

function addSavedItemToDefinition( predef )
{
	console.log('adding a saved definition to current definition...');
	console.log('name : ' +  predef.name );
	
    // obtain current definition
    var curdef = getCurrentDefinition();

    var node = new createNode( predef.id, curdef.id );

    // add a new reference to defid to current definition
    canvasLayer.add( node.visual );
    canvasLayer.draw();
}

function addSpecialItemToDefinition( kind )
{
	console.log('adding a special definition to current definition...');
	console.log('kind : ' + kind);
	
    // obtain current definition
    var curdef = getCurrentDefinition();
	
	var spdef;
	
	// customize the definition based on its kind
	if( kind === 'constant' )
	{
		spdef = new SpecialDefinition(kind, kind);
	}
	else if( kind === 'arithmetic' )
	{
            // TODO: temporarily out of service
		spdef = new SpecialDefinition(kind, kind);
	}
	else if( kind === 'if' )
	{
	    spdef = new SpecialDefinition('If/Then/Else', kind);
            spdef.numArgs = 3;
            spdef.inTypes.push('bool');
	    spdef.inTypes.push('undefined');
	    spdef.inTypes.push('undefined');
	}
	else if( kind === 'input' )
	{
		spdef = new SpecialDefinition(kind + curdef.numArgs, kind);
		spdef.numArgs = 1;
		spdef.inTypes.push('undefined');
		// increment the number of inputs in the current definition
		curdef.numArgs++;
		curdef.inTypes[curdef.numArgs-1] = 'undefined';
	}
	else if( kind === 'output' )
	{
		// check if current definition already has an output node
		if( curdef.hasOutNode )
		{
			console.log('current definition already has an output node.');
			return;
		}
		else
		{
			spdef = new SpecialDefinition(kind, kind);
			spdef.numArgs = 1;
			spdef.inTypes.push('undefined');
			curdef.hasOutNode = true;
		}
	}
	else if( kind === 'recursion' )
	{
	    spdef = new SpecialDefinition('recursion', 'recursion');
        spdef.numArgs = curdef.numArgs;
		for(var i=0;i<spdef.numArgs.length;i++)
		{
			spdef.inTypes.push(curdef.inTypes[i]);
		}
	}
	else if( kind === 'print' ) 
	{
	    spdef = new SpecialDefinition('print', 'function');
            spdef.numArgs = 2;
            spdef.inTypes.push('string');
	    spdef.inTypes.push('world');
	} 
	else if( kind === 'pair' ) 
	{
	    spdef = new SpecialDefinition('pair', 'function');
            spdef.numArgs = 2;
            spdef.inTypes.push('a');
	    spdef.inTypes.push('b');
	} 
	else if( kind === 'fst' ) 
	{
	    spdef = new SpecialDefinition('fst', 'function');
        spdef.numArgs = 1;
	    spdef.inTypes.push('(a, b)');
	} 
	else if( kind === 'snd' ) 
	{
	    spdef = new SpecialDefinition('snd', 'function');
        spdef.numArgs = 1;
        spdef.inTypes.push('(a, b)');
    }
	
	var node = new createNode( spdef.id, curdef.id );
		
	canvasLayer.add( node.visual );
	canvasLayer.draw();
}

function removeActiveNode()
{
	var curDef = getCurrentDefinition();
	removeNode( curDef.activeNode )
}
