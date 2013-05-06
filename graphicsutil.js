function renderCircle(xPos, yPos, r, destLayer)
{
    var circle = new Kinetic.Circle({
                                        x: xPos,
                                        y: yPos,
                                        radius: r,
                                        fill: 'red',
                                        stroke: 'black',
                                        strokeWidth: 1
                                    });
    destLayer.add(circle);
}

function renderRectangle(xPos, yPos, w, h, destLayer)
{
    var rect = new Kinetic.Rect({
                                    x: xPos,
                                    y: yPos,
                                    width: w,
                                    height: h,
                                    fill: 'cyan',
                                    stroke: 'black',
                                    strokeWidth: 1
                                });
    destLayer.add(rect);
}

function renderRectangleWithColor(xPos, yPos, w, h, c, destLayer)
{
    var rect = new Kinetic.Rect({
                                    x: xPos,
                                    y: yPos,
                                    width: w,
                                    height: h,
                                    fill: c,
                                    stroke: 'black',
                                    strokeWidth: 1
                                });
    destLayer.add(rect);
}

function renderText(xPos, yPos, w, fs, content, destLayer)
{
    var t = new Kinetic.Text({
                                 x: xPos,
                                 y: yPos,
                                 text: content,
                                 fontSize: fs,
                                 fontFamily: 'Calibri',
                                 fill: '#555',
                                 width: w,
                                 padding: 0,
                                 align: 'center'
                             });

    destLayer.add(t);
}

function renderRectangleWithName(x, y, w, h, name, destLayer)
{
    renderRectangle(x, y, w, h, destLayer);
    renderText(x, y, w, 12, name, destLayer);
}

function renderRectangleWithNameAndColor(x, y, w, h, name, color, destLayer)
{
    renderRectangleWithColor(x, y, w, h, color, destLayer);
    renderText(x, y, w, 18, name, destLayer);
}
