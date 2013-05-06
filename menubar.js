var menustage, menuLayer;
var menuItems = [];

var MENU_BAR_TEXT_COLOR = '#347373';
var MENU_BAR_BUTTON_COLOR = '#FFFFFD';
var MENU_BAR_BUTTON_HILIGHT_COLOR = '#FFFF88';

var evaluate = require('./lang').evaluate;

function renderMenuItems()
{
	for (var i=0,len=menuItems.length; i<len; i++)
	{
		menuLayer.add( menuItems[i].node.rect );
		menuLayer.add( menuItems[i].node.text );
	}
}

function MenuItemNode(name, color, xPos, yPos, w, h)
{
	this.text = new Kinetic.Text({
        x: xPos,
        y: yPos,
        text: name,
        fontSize: 18,
        fontFamily: 'Calibri',
        fill: MENU_BAR_TEXT_COLOR,
        width: w,
        padding: 0,
        align: 'center'
    });

	this.rect = new Kinetic.Rect({
                                x: xPos,
                                y: yPos,
                                width: w,
                                height: h,
                                fill: color,
                                stroke: 'black',
                                strokeWidth: 1
                            });
}

function MenuItem(name, color, xPos, yPos, w, h)
{
	this.name = name;
	this.color = color;
	this.node = new MenuItemNode(name, color, xPos, yPos, w, h);
}

var menuItemNames = ['new', 'open', 'save', 'delete', 'run'];

function createMenuItems()
{
    var menuItemWidth = 60;
    var menuItemHeight = 20;
    for(var i=0;i<menuItemNames.length;i++)
    {
	var x = i * menuItemWidth;
	var item = new MenuItem(menuItemNames[i],
                                MENU_BAR_BUTTON_COLOR,
                                x, 0,
                                menuItemWidth, menuItemHeight);
	menuItems.push(item);
    }
}

function highlightMenuItem( name )
{
	for(var i=0;i<menuItems.length;i++)
	{
		var item = menuItems[i];
		if( item.name == name )
			item.node.rect.setFill(MENU_BAR_BUTTON_HILIGHT_COLOR);
	}
}

function deHighlightMenuItem( name )
{
	for(var i=0;i<menuItems.length;i++)
	{
		var item = menuItems[i];
		if( item.name == name )
			item.node.rect.setFill(MENU_BAR_BUTTON_COLOR);
	}
}

function handleCommand( name )
{
	if( name == 'new' )
		createDefinition();
	else if( name == 'open' )
		openDefinition();
	else if( name == 'save' )
		saveDefinition();
    else if( name == 'delete' )
        deleteDefinition();
    else if( name === 'run' ) {
	var nodes = transformDefinition(getCurrentDefinition());
	var tcheck = typecheck(nodes, true);
	console.log("typecheck results:", tcheck);
	if (tcheck.success) {
	    // TODO: run program
	    console.log("executing...");
	    evaluate(nodes, ["<main program input>"]);
	    console.log("Run successful.");
	}
    }
}

function initializeMenuStage()
{
	createMenuItems();

	menustage = new Kinetic.Stage({
                                      container: 'menubar',
                                      width: 900,
                                      height: 22,
                                  });

	menuLayer = new Kinetic.Layer();
	menustage.add(menuLayer);

	menustage.on('mouseover', function(evt) {
    	var node = evt.targetNode;
		if( node.getShapeType() == 'Text' )
    	{
    		var name = node.getText();
    		highlightMenuItem( name );
    	}

    	menuLayer.draw();
	});

	menustage.on('mouseout', function(evt) {
    	var node = evt.targetNode;
		if( node.getShapeType() == 'Text' )
    	{
    		var name = node.getText();
    		deHighlightMenuItem( name );
    	}

    	menuLayer.draw();
	});

	menustage.on('mousedown', function(evt) {
    	var node = evt.targetNode;
    	if( node.getShapeType() == 'Text' )
    	{
    		var name = node.getText();
    		handleCommand( name );
    	}
	});

	renderMenuItems();
	menustage.draw();
}
