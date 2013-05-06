document.onload = initialize();

function initialize()
{
    initializeStages();
}

function initializeStages()
{
    initializeMenuStage();
    initializeCanvasStage();
    initializeItemStage();
    initializeDefStage();
}

var canvasStage, canvasLayer, dragLayer, startLayer;

function initializeCanvasStage()
{
    canvasStage = new Kinetic.Stage({
                                        container: 'defcanvas',
                                        width: 900,
                                        height: 650,
                                    });

    canvasLayer = new Kinetic.Layer();

    // add the layer to the stage
    canvasStage.add(canvasLayer);

    dragLayer = new Kinetic.Layer();
    canvasStage.add(dragLayer);

	/*
    canvasStage.on('mouseover mousemove dragmove', function(evt) {
        var node = evt.targetNode;
        var mousePos = canvasStage.getMousePosition();
    });

    canvasStage.on('mousedown', function(evt) {
        var shape = evt.targetNode;

        startLayer = shape.getLayer();

        if( startLayer == canvasLayer )
        {
            shape.moveTo(dragLayer);
            startLayer.draw();
            // manually trigger drag and drop
            shape.startDrag();
        }
    });

    canvasStage.on('mouseup', function(evt) {
        var shape = evt.targetNode;
        shape.moveTo(startLayer);
        dragLayer.draw();
        startLayer.draw();
    });
	*/
	
    document.onkeypress = function(e) {
		console.log('key ' + e.keyCode + ' pressed.');
      	if ( e.keyCode === 100 ) {
			console.log('deleting a node.');
			removeActiveNode();
      	}
    };
}

function showDefinition( defid )
{
    var def = getDefinitionById( defid );
    canvasLayer.hide();
    canvasLayer = def.layer;
    canvasLayer.show();
    canvasStage.draw();
}

