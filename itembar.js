var itemstage, itemLayer;

var editingItems = [];
var curEditItem = -1;

function initializeItemStage()
{
    itemstage = new Kinetic.Stage({
                                      container: 'itembar',
                                      width: 150,
                                      height: 650,
                                  });

    itemLayer = new Kinetic.Layer();
    itemstage.add(itemLayer);
    itemstage.draw();

    itemstage.on('click', function(evt) {
        var item = evt.targetNode;
        // working
        if( item.getShapeType() === 'Text' )
        {
            setCurrentItem(item.getText());
            itemLayer.draw();
        }
        // clear any edges and nodes marked as having errors
        clearErrors(getCurrentDefinition());

    });

    itemstage.on('dblclick', function(evt){
        var item = evt.targetNode;
        // working
        if( item.getShapeType() === 'Text' )
        {
            var name=prompt("Please enter a name for the definition",item.getText());
            for(var i=0;i<editingItems.length;i++)
            {
                var eItem = editingItems[i];
                if( eItem.defobj.id === item.attrs.defid )
                {
                    eItem.setName(name);
                }
            }
            itemLayer.draw();
            defsLayer.draw();
        }
    });
}

function setCurrentItem( name )
{
    deHighlightCurrentItem();
    for(var i=0;i<editingItems.length;i++)
    {
        var eItem = editingItems[i];
        if( eItem.defobj.name == name )
        {
            curEditItem = i;
            showDefinition( eItem.defobj.id );
        }
    }
    highlightCurrentItem();
}

function deHighlightCurrentItem()
{
    if( curEditItem != -1 )
    {
        var eItem = editingItems[curEditItem];
        eItem.node.getRect().setFill('#EEFF88');
    }
}

function highlightCurrentItem()
{
    if( curEditItem != -1 )
    {
        var eItem = editingItems[curEditItem];
        eItem.node.getRect().setFill('#AAFFBB');
    }
}

function updateVisibleEditItems()
{
    var itemHeight = 30;
    var y = 0;

    for(var i=0;i<editingItems.length;i++)
    {
        var item = editingItems[i];
        item.node.setY( y );

        y = y + itemHeight;
    }
}

function removeEditItem( defid )
{
    var loc = -1;
    for(var i=0;i<editingItems.length;i++)
    {
        if( editingItems[i].defobj.id == defid )
        {
            loc = i;
            break;
        }
    }

    if( loc >= 0 )
    {
        var item = editingItems[loc];
        item.node.remove();
        editingItems.splice(loc, 1);
        curEditItem = loc - 1;
    }
}

function updateItemStage( newDef )
{
    var eItem = new DefinitionLabelItem( newDef );
    editingItems.push(eItem);
    itemLayer.add( eItem.node );

    updateVisibleEditItems();

    deHighlightCurrentItem();
    curEditItem = editingItems.length-1;
    highlightCurrentItem();

    itemLayer.draw();
}
