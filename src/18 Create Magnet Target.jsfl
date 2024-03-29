/*
 Electric Dog Flash Animation Power Tools
 Copyright (C) 2011-2013  Vladin M. Mitov

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see http://www.gnu.org/licenses/.
  
 version: 2.5.0
 */

try {
    runScript( "Create Magnet Target" );
}catch( error ){
    fl.trace( error );
}
function runScript( command ){
    if( fl.getDocumentDOM() == null ){
        fl.trace( "No document open." );
        return;
    }
    var a = fl.tools.altIsDown;
    var s = fl.tools.shiftIsDown;

    if( !a && !s ){
        insertSymbol( command, 2 );  // MagnetTarget from menu
        return;
    }
    if( s ){
        insertSymbol( command, 2 );  // MagnetTarget
        return;
    }
    if( a ){
        insertSymbol( command, 1 );  //CenterMarker
    }
}
function insertSymbol( commandname, atype ){
    var currentDoc = fl.getDocumentDOM();
    var myTimeline = currentDoc.getTimeline();
    var currentLib = currentDoc.library ;
    var items = currentLib.items;
    var specialLayerNumber = -1;

    /*
     1. Define some variables, depending of what we want to create.
     2. Check whether we need to create the symbol.
     3. Check if there is a "special" layer. If it does not exist - create it.
     4. Create the necessary symbol.
     5. Copy the symbol, so we can paste it in the centre of the visible part of the stage / reg-point of the symbol /.
     6. Set the "special" layer as a current.
     7. Paste the symbol in the centre of the visible area / reg-point of the symbol /.
     8. Display messages.
     */

    // 1. Define some variables, depending of what we want to create.
    var myTypeString, specialLayerName, myType, myItemName, layerMessage;
    if( atype == 1 ){
        myTypeString = "CenterMarker";
        specialLayerName = Edapt.settings.createMagnetTarget.markerLayerName;
        myType = "marker";
        myItemName = "Center Marker";
        layerMessage = "center markers";
    }else if( atype == 2 ){
        myTypeString = "MagnetTarget";
        specialLayerName = Edapt.settings.createMagnetTarget.targetLayerName;
        myType = "target";
        myItemName = "Magnet Target";
        layerMessage = "magnet targets"
    }

    // 2. Check whether we need to create the symbol.
    var theSymbols = [];
    var i;
    for( i=0; i<items.length; i++ ){
        var item = items[i];
        if( item.hasData( "signature" ) ){
            if( item.getData( "signature" ) == "EDAPT" && item.getData( "type" ) == myTypeString ){
                theSymbols.push( item );
            }
        }
    }
    var symbolExists = ( theSymbols.length > 0 );


    // 3. Check if there is a "special" layer. If it does not exist - create it.
    var affectedLayers = myTimeline.layers;
    var layerExists = false;
    for( i=0; i<affectedLayers.length; i++ ){
        var l = affectedLayers[i];
        if( l.layerType != "folder" ){
            if( l.name == specialLayerName ){
                specialLayerNumber = i;
                layerExists = true;
                break;
            }
        }
    }

    if( specialLayerNumber == -1 ){
        var xlayer = createSpecialLayer( currentDoc, myType );
        specialLayerNumber = Edapt.utils.indexOf( myTimeline.layers, xlayer );
    }

    // 4. Create the necessary symbol.
    var originalStroke = currentDoc.getCustomStroke( "toolbar" );
    if( ! symbolExists ){
        var tempDoc = fl.createDocument( "timeline" );
        var tempLib = tempDoc.library;
        var myStroke = createStroke();
        tempDoc.setCustomStroke( myStroke );
        var success = tempLib.addNewItem( "graphic", myItemName );
        if( success ){
            var mySymbol = tempLib.getSelectedItems()[0];
            mySymbol.addData( "type", "string", myTypeString );
            mySymbol.addData( "signature", "string", "EDAPT" );
            myTimeline.currentLayer = specialLayerNumber;
            var layerMap = Edapt.utils.createObjectStateMap( myTimeline.layers, [ "locked" ] );	// bugfix DRP-J5P-DM8L
            processLayers( myTimeline, lockLayers, [0] );										// bugfix DRP-J5P-DM8L
            tempLib.editItem();
            drawShape( tempDoc, myType );
            createInfo( tempDoc );
            tempDoc.exitEditMode();
            theSymbols.push( mySymbol );
        }

        // A workaround for stroke "noStroke" Flash bug.
        if( originalStroke.style == "noStroke" ){
            currentDoc.swapStrokeAndFill();
            var tempFill = currentDoc.getCustomFill( "toolbar" );
            tempFill.style = "noFill";
            currentDoc.setCustomFill( tempFill );
            currentDoc.swapStrokeAndFill();
        }else{
            currentDoc.setCustomStroke( originalStroke );
        }

    }


    // 5. Copy the symbol, so we can paste it in the centre of the visible part of the stage / regPoint of the symbol /.
    if( symbolExists ){
        copySymbols( currentDoc, theSymbols, true );
    }else{
        copySymbols( tempDoc, theSymbols, false );
    }
    if( tempDoc ){
        tempLib = null;
        fl.closeDocument( tempDoc, false );
    }

    // 6. Set the "special" layer as a current.
    myTimeline.currentLayer = specialLayerNumber;

    // 7. Paste the symbol in the centre of the visible area / regPoint of the symbol /.
    if( myTimeline.layers[ myTimeline.currentLayer ].locked == false ){
        currentDoc.clipPaste();
        if( atype == 1 ){
            currentDoc.distribute( "horizontal center", true );
            currentDoc.distribute( "vertical center", true );
        }
        if( ! symbolExists ){
            if( ! currentLib.itemExists( Edapt.settings.createMagnetTarget.folderName ) ){
                currentLib.newFolder( Edapt.settings.createMagnetTarget.folderName );
            }
            var theItem = getItemByData( currentLib, myTypeString );
            if( theItem ){
                currentLib.moveToFolder( Edapt.settings.createMagnetTarget.folderName, theItem.name, true );
            }
        }
    }else{
        Edapt.utils.displayMessage( commandname + " : The '" + specialLayerName + "' layer is locked.", 2 );
    }
    if( layerMap ){
        Edapt.utils.restoreObjectStateFromMap( myTimeline.layers, layerMap );	// bugfix DRP-J5P-DM8L
    }

    // Feature request - MG3-ZGA-667Q ( 04 November, 2013 )
    // Select the newly created magnet target object.
    if( atype == 2 ){
        currentDoc.selectAll();
        var lastAddedElement = currentDoc.selection[ 0 ];
        if( lastAddedElement ){
            currentDoc.selectNone();
            currentDoc.selection = [ lastAddedElement ];
			lastAddedElement.firstFrame = 0;
			lastAddedElement.loop = "single frame";
        }
    }

    // 8. Display messages.
    if( Edapt.settings.createMagnetTarget.showAlert == true ){
        var message = "A layer called &quot;" + specialLayerName + "&quot; was created for convenience." + "\n" +
            "It is recommended to place all needed instances of" + "\n" +
            "the "+ layerMessage +" onto this layer.";
        if( ! layerExists ){
			Edapt.utils.displayDialogue( commandname, message, "accept", null, "createMagnetTarget" );
        }
    }
}
function processLayers( timeline, func ){
    var args = [];
    for( var i=2; i<arguments.length; i++ ){
        args.push( arguments[ i ] );
    }
    for( var j=0; j<timeline.layers.length; j++ ){
        func.apply( this, [ timeline.layers[j], j, timeline ].concat( args ) )
    }
}
function lockLayers( alayer, aindex, atimeline, skipped ){
    if( ! Edapt.utils.include( skipped, aindex )){
        alayer.locked = true;
    }
}
function getItemByData( library, atype ){
    var itms = library.items;
    var i = itms.length;
    while( i -- ){
        var itm = itms[i];
        var data = itm.getData( "type" );
        if( data ){
            var sig = itm.getData( "signature" );
            if( sig ){
                if( data == atype && sig == "EDAPT" ){
                    return itm;
                }
            }
        }
    }
    return null;
}
function createSpecialLayer( doc, atype ){
    doc.getTimeline().currentLayer = 0;
    var myName, myColor, myType;
    if( atype == "target" ){
        myName = Edapt.settings.createMagnetTarget.targetLayerName;
        myColor = "#FF0000";
        myType = ( Edapt.settings.createMagnetTarget.visibleTargets ) ? "normal" : "guide";
    }else if ( atype == "marker" ){
        myName = Edapt.settings.createMagnetTarget.markerLayerName;
        myColor = "#0000FF";
        myType = ( Edapt.settings.createMagnetTarget.visibleMarkers ) ? "normal" : "guide";
    }
    doc.getTimeline().addNewLayer( myName );
    var xLayer = doc.getTimeline().layers[ doc.getTimeline().currentLayer ];
    xLayer.color = myColor;
    xLayer.outline = true;
    xLayer.layerType = myType;
    return xLayer;
}
function copySymbols( theDocument, theSymbols, isCurrent ){
    // There was a bug in this function - HWY-57Z-94U5 from 2013 Oct 04
    var timeline = theDocument.getTimeline();
    if( isCurrent ){
        var n = timeline.addNewLayer();
        timeline.setSelectedLayers( n, true );
        timeline.currentLayer = n;
    }
    for( var i=0; i<theSymbols.length; i++ ){
        var so = theSymbols[i];
        theDocument.library.addItemToDocument({x:0, y:0}, so.name );
    }
    theDocument.clipCut();
    if( isCurrent ){
        timeline.deleteLayer( n );
    }
}

// Drawing functions
function drawShape( theDocument, atype ){
    if( atype == "target" ){
        createCircle( theDocument, {x:0, y:0}, 6 );
    }else if( atype == "marker" ){
        createSquare( theDocument, {x:0, y:0}, 6 );
    }
    // Select, ungroup and make fill and stroke invisible.
    theDocument.selectAll();
    var needToUngroup = false;
    for( var i=0; i<theDocument.selection.length; i++ ){
        if( theDocument.selection[i].isGroup ){
            needToUngroup = true;
            break;
        }
    }
    if( needToUngroup ){
        theDocument.unGroup();
    }
    theDocument.setFillColor( null );
    theDocument.setStrokeColor( "#00000001" );
    theDocument.setStrokeStyle( "hairline" );
    theDocument.getTimeline().setLayerProperty( "locked", true );
}
function createCircle( theDocument, acenter, radius ){
    var l = acenter.x - radius;
    var t = acenter.y - radius;
    var r = acenter.x + radius;
    var b = acenter.y + radius;
    theDocument.addNewOval( {left:l, top:t, right:r, bottom:b} );
    theDocument.selectAll();
    if( isGroup( theDocument ) ){
        theDocument.unGroup();
    }
    var lx = acenter.x;
    var ly = acenter.y;
    theDocument.addNewLine({x:lx, y:-radius/4 + ly}, {x:lx, y:radius/4 + ly});
    theDocument.addNewLine({x:-radius/4+lx, y:ly}, {x:radius/4+lx, y:ly});

    theDocument.selectAll();
    theDocument.setFillColor( null );
    theDocument.setStrokeColor( "#00000001" );
    theDocument.setStrokeStyle( "hairline" );
}
function isGroup( doc ){
    if( doc.selection.length > 0 ){
        var el = doc.selection[0];
        return ( el.elementType == "shape") && ( el.isGroup || el.isDrawingObject );
    }
    return false;
}
function createSquare( theDocument, acenter, radius ){
    var lx = acenter.x;
    var ly = acenter.y;
    var data = createPolygon( 4, {x:0, y:0}, 6 );
    var path = polygonToPath( data );
    path.makeShape();
    theDocument.addNewLine( { x:lx, y:-radius/4 + ly }, { x:lx, y:radius/4 + ly } );
    theDocument.addNewLine( { x:-radius/4+lx, y:ly }, { x:radius/4+lx, y:ly } );
	
	theDocument.selectAll();     // Fix: Drawing object problem upon CM creation - June 7, 2014
	if( isGroup( theDocument ) ){
		theDocument.unGroup();
	}
	
    theDocument.selectAll();
    theDocument.setFillColor( null );
    theDocument.setStrokeColor( "#00000001" );
    theDocument.setStrokeStyle( "hairline" );
}
function createInfo( theDocument ){
    theDocument.getTimeline().setFrameProperty( "name",
        "   >> http://flash-powertools.com -- this invisible object comes from EDAP Tools - extensions for Flash character animation." );
    theDocument.getTimeline().setFrameProperty( "labelType", "comment" );
    theDocument.getTimeline().insertKeyframe( 99 );
}
function createPolygon( sides, center, radius ){
    var out = [];
    out.push( center.x +  radius * Math.cos(0) );
    out.push( center.y +  radius *  Math.sin(0) );
    for (var i = 1; i <= sides;i += 1) {
        out.push( center.x + radius * Math.cos(i * 2 * Math.PI / sides ) );
        out.push( center.y + radius * Math.sin(i * 2 * Math.PI / sides ) );
    }
    return out;
}
function polygonToPath( thePolygon ) {
    var path = fl.drawingLayer.newPath();
    path.addPoint( thePolygon[0],  thePolygon[1] );
    var index = 3;
    while ( index < thePolygon.length ){
        path.addPoint( thePolygon[index-1],  thePolygon[index] );
        index += 2;
    }
    return path;
}
function createStroke(){
    return { thickness:1,
        color:"#000000",
        breakAtCorners:false,
        strokeHinting:false,
        scaleType:"normal",
        joinType:"round",
        capType:"round",
        miterLimit:3,
        style:"solid",
        shapeFill:{ color:"#000000", style:"solid", matrix:{ a:1, b:0, c:0, d:1, tx:0, ty:0 } } };
}