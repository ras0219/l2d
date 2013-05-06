var defstage, defsLayer;
var savedGroup, predefinedGroup, specialGroup;

var specialDefinitions = [];
var predefinedDefinitions = [];
var savedDefinitions = [];

var defmap = require('./builtins').defmap;

function isTitleItem( item )
{
	if( item.attrs.item.isTitleItem == undefined )
		return false;
	else
		return true;
}

function isSpecialItem( item )
{
	if( item.attrs.item.isSpecialItem == undefined )
		return false;
	else 
		return true;
}

function createPlainLabelItem( name, group, color )
{
	if( color === undefined )
		color = 'orange';
	
	this.name = name;
	this.group = group;
	this.node = new Kinetic.Label({
            x: 0,
            y: 0,
            opacity: 0.75,
            text: {
                item: this,
                text: name,
                fontFamily: 'Calibri',
                fontSize: 18,
                padding: 5,
                fill: 'black',
                width: 150,
                align: 'center'
            },
            rect: {
                fill: color,
            },
            width: 150,
            height: 20,
        });
}

function createSpecialGroup()
{
	specialGroup = new Kinetic.Group();
	groupTitle = new createPlainLabelItem('Special Items', specialGroup);
	groupTitle.isTitleItem = true;

	// create input node item
	inputItem = new createPlainLabelItem('Input', specialGroup, '#aaf');
	inputItem.isSpecialItem = true;
	specialDefinitions.push( inputItem );
	
	// create output node item
	outputItem = new createPlainLabelItem('Output', specialGroup, '#aaf');
	outputItem.isSpecialItem = true;
	specialDefinitions.push( outputItem );	
	
	// create constant node item
	constantItem = new createPlainLabelItem('Constant', specialGroup, '#aaf');
	constantItem.isSpecialItem = true;
	specialDefinitions.push( constantItem );
	
	// create if/then/else node item
	ifItem = new createPlainLabelItem('If', specialGroup, '#aaf');
	ifItem.isSpecialItem = true;
	specialDefinitions.push( ifItem );
	
	// create arithmetic node item
	arithItem = new createPlainLabelItem('Arithmetic', specialGroup, '#aaf');
	arithItem.isSpecialItem = true;
	specialDefinitions.push( arithItem );
		
	specialGroup.add(groupTitle.node);
	
	specialGroup.add(inputItem.node);
	specialGroup.add(outputItem.node);
	specialGroup.add(constantItem.node);
	specialGroup.add(ifItem.node);
	specialGroup.add(arithItem.node);
	
	defsLayer.add(specialGroup);
}

function createPredefinedGroup()
{
	predefinedGroup = new Kinetic.Group();
	groupTitle = new createPlainLabelItem('Predefined Items', predefinedGroup);
	groupTitle.isTitleItem = true;

	printItem = new createPlainLabelItem('Print', predefinedGroup, '#aaf');
	predefinedDefinitions.push( printItem );
	
	pairItem = new createPlainLabelItem('Pair', predefinedGroup, '#aaf');
	predefinedDefinitions.push( pairItem );
	
	fstItem = new createPlainLabelItem('Fst', predefinedGroup, '#aaf');
	predefinedDefinitions.push( fstItem );
	
	sndItem = new createPlainLabelItem('Snd', predefinedGroup, '#aaf');
	predefinedDefinitions.push( sndItem );
	
	predefinedGroup.add(groupTitle.node);
	predefinedGroup.add(printItem.node);
	predefinedGroup.add(pairItem.node);
	predefinedGroup.add(fstItem.node);
	predefinedGroup.add(sndItem.node);

	defsLayer.add(predefinedGroup);	
}

function createSavedGroup()
{
	savedGroup = new Kinetic.Group();
	groupTitle = new createPlainLabelItem('Saved Items', savedGroup);
	groupTitle.isTitleItem = true;
	
	savedGroup.add(groupTitle.node);
	defsLayer.add(savedGroup);
}

function initializeDefStage()
{
	defstage = new Kinetic.Stage({
                                     container: 'defsbar',
                                     width: 150,
                                     height: 650,
                                 });

	defsLayer = new Kinetic.Layer();

	
	createSpecialGroup();
	createPredefinedGroup();
	createSavedGroup();
    updateVisibleDefItems();
	
	defstage.add(defsLayer);

	defstage.draw();

	defstage.on('dblclick', function(evt){
    	var item = evt.targetNode;
    	// working
    	if( item.getShapeType() == 'Text' )
    	{
			if( isTitleItem( item ) )
			{
				// it's a title item, do nothing
				console.log('clicked on a title item.');
			}
			else if( isSpecialItem( item ) )
			{
				var kind = item.attrs.item.name.toLowerCase();
				addSpecialItemToDefinition( kind );
				console.log('clicked on a special item.');
			} else {
			    var kind = item.attrs.item.name.toLowerCase();
			    addSpecialItemToDefinition( kind );
                            //addPredefinedItemToDefinition( item.attrs.defid );
                        }
    	}
	});
}

function removeDefItem( defid )
{
    var loc = -1;
    for(var i=0;i<savedDefinitions.length;i++)
    {
        if( savedDefinitions[i].defobj.id == defid )
        {
            loc = i;
            break;
        }
    }

    if( loc >= 0 )
    {
        var item = savedDefinitions[loc];
        item.node.remove();
        savedDefinitions.splice(loc, 1);
    }
}

function updateVisibleDefItems()
{
	var itemHeight = 30;
	var y = 0;
	
	for(var i=0;i<specialDefinitions.length;i++)
	{
		var item = specialDefinitions[i];
		item.node.setY( (i + 1) * itemHeight );
	}

	y = y + itemHeight * (specialDefinitions.length + 1);
	predefinedGroup.setY(y);
	for(var i=0;i<predefinedDefinitions.length;i++)
	{
		y = y + itemHeight;
		var item = predefinedDefinitions[i];
		item.node.setY( (i + 1) * itemHeight );
	}
	
	y = y + itemHeight * (predefinedDefinitions.length + 1);
	savedGroup.setY(y);
	for(var i=0;i<savedDefinitions.length;i++)
	{
		y = y + itemHeight;
		var item = savedDefinitions[i];
		item.node.setY( (i + 1) * itemHeight );
	}
}

function updateDefStage( newDef )
{
	// create a new item
    var dItem = new DefinitionLabelItem( newDef );
	savedDefinitions.push(dItem);
	savedGroup.add(dItem.node);

	//defsLayer.add( dItem.node );

    updateVisibleDefItems();

	defstage.draw();
}
