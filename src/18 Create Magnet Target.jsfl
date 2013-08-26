/*
Electric Dog Flash Animation Power Tools
Copyright (C) 2011  Vladin M. Mitov

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
*/

try {
	runScript( "Create Magnet Target" );
}catch( error ){
	fl.trace( error );
}
function runScript( command ){
	var theKey = fl.tools.getKeyDown();
	var a = fl.tools.altIsDown;
	var s = fl.tools.shiftIsDown;
	if( !a && !s ){
		insertSymbol( command, 2 );  // MagnetTarget
		return;
	}
	if( s ){
		insertSymbol( command, 2 );  // MagnetTarget
		return;			
	}
	if( a ){
		insertSymbol( command, 1 );  //CenterMarker
		return;
	}	
}
function insertSymbol( commandname, atype ){
	var currentDoc = fl.getDocumentDOM();
	var myTimeline = currentDoc.getTimeline();
	var currentLib = currentDoc.library ;  
	var items = currentLib.items;
	var specialLayerNumber = -1;

	/*
		1. Define some variables, depening of what we want to create.
		2. Check whether we need to create the symbol.
		3. Check if there is a "special" layer. If it does not exist - create it.
		4. Create the necessary symbol.
		5. Copy the symbol, so we can paste it in the center of the visible part of the stage / regpoint of the symbol /.
		6. Set the "special" layer as a current.
		7. Paste the symbol in the centre of the visible area / regpoint of the symbol /.
		8. Display messages.
	*/
	
	// 1
	var myTypeString, specialLayerName, myType, myItemName, layerMessage;
	if( atype == 1 ){
		myTypeString = "CenterMarker";
		specialLayerName = Edapt.settings.createMagnetTarget.markerLayerName;
		myType = "marker";
		myItemName = "Center Marker";
		layerMessage = "center markers";
	}
	else if( atype == 2 ){
		myTypeString = "MagnetTarget";
		specialLayerName = Edapt.settings.createMagnetTarget.targetLayerName;
		myType = "target";
		myItemName = "Magnet Target";
		layerMessage = "magnet targets"
	}
	
	// 2
	var theSymbols = [];
	for( var i=0; i<items.length; i++ ){
		var item = items[i];
		if( item.hasData( "signature" ) ){
			if( item.getData( "signature" ) == "EDAPT" && item.getData( "type" ) == myTypeString ){
				theSymbols.push( item );
			}
		}
	}
	var symbolExists = ( theSymbols.length > 0 );

	// 3
	var affectedLayers = myTimeline.layers;
	var layerExists = false;
	for( var i=0; i<affectedLayers.length; i++ ){
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
	
	// 4
	var originalStroke = currentDoc.getCustomStroke( "toolbar" );
	if( ! symbolExists ){
		var tempDoc = fl.createDocument( "timeline" );
		var tempLib = tempDoc.library;
		var myStroke = createStroke();
		tempDoc.setCustomStroke( myStroke );
		// Create needed symbol
		var success = tempLib.addNewItem( "graphic", myItemName );
		if( success ){
			var mySymbol = tempLib.getSelectedItems()[0];
			mySymbol.addData( "type", "string", myTypeString );
			mySymbol.addData( "signature", "string", "EDAPT" );
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
		}
		else{
			currentDoc.setCustomStroke( originalStroke );
		}
	}

	// 5
	if( symbolExists ){
		copySymbols( currentDoc, theSymbols, true );
	}
	else{
		copySymbols( tempDoc, theSymbols, false );
	}
	if( tempDoc ){
		tempLib = null;
		fl.closeDocument( tempDoc, false ); 
	}

	// 6
	myTimeline.currentLayer = specialLayerNumber;

	// 7
	if( myTimeline.layers[ myTimeline.currentLayer ].locked == false ){
		currentDoc.clipPaste();
		if( atype == 1 ){
			currentDoc.distribute( "horizontal center", true );
			currentDoc.distribute( "vertical center", true );
		}
		if( ! symbolExists ){
			if( ! currentLib.itemExists( Edapt.settings.createMagnetTarget.folderName ) ){
				var create = currentLib.newFolder( Edapt.settings.createMagnetTarget.folderName );
			}
			var theItem = getItemByData( currentLib, myTypeString );
			if( theItem ){
				var moved = currentLib.moveToFolder( Edapt.settings.createMagnetTarget.folderName, theItem.name, true );	
			}
		}
	}
	else{
		Edapt.utils.displayMessage( commandname + " : The '" + specialLayerName + "' layer is locked.", 2 );	
	}

	// 8
	if( Edapt.settings.createMagnetTarget.showAlert == true ){
		var message = "A layer called &quot;" + specialLayerName + "&quot; was created for convenience." + "\n" +
		"It is recommended to place all needed instances of" + "\n" +
		"the "+ layerMessage +" onto this layer.";
		if( ! layerExists ){
			Edapt.utils.displayOptionalMessageBox( commandname,  message, "createMagnetTarget" );
		}
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
	}
	else if ( atype == "marker" ){
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
	var timeline = theDocument.getTimeline();
	if( isCurrent ){
		var layerMap = Edapt.utils.createObjectStateMap( timeline.layers, [ "locked" ] );
		var n = timeline.addNewLayer();
		timeline.setSelectedLayers( n, true );
		theDocument.getTimeline().currentLayer = n; 
	}
	for( var i=0; i<theSymbols.length; i++ ){
		var so = theSymbols[i];
		theDocument.library.addItemToDocument({x:0, y:0}, so.name );
	}
	if( isCurrent ){
		timeline.setLayerProperty( "locked", true, "others" );
	}
	theDocument.selectAll( true );
	theDocument.clipCut();
	if( isCurrent ){
		timeline.deleteLayer( n );
		Edapt.utils.restoreObjectStateFromMap( timeline.layers, layerMap );
	}
}

// Drawing functions
function drawShape( theDocument, atype ){
	if( atype == "target" ){
		createCircle( theDocument, {x:0, y:0}, 6 );
	}
	else if( atype == "marker" ){
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
	var f = radius * 0.4;
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
		var retval = ( el.elementType == "shape") && ( el.isGroup || el.isDrawingObject );
		return retval;
	}
	return false;
}
function createSquare( theDocument, acenter, radius ){
	var l = acenter.x - radius;
	var t = acenter.y - radius;
	var r = acenter.x + radius;
	var b = acenter.y + radius;
	var f = radius * 0.4;
	var lx = acenter.x;
	var ly = acenter.y;
	var data = createPolygon( 4, {x:0, y:0}, 6 );
	var path = polygonToPath( data );
	path.makeShape();
	theDocument.addNewLine( { x:lx, y:-radius/4 + ly }, { x:lx, y:radius/4 + ly } );
	theDocument.addNewLine( { x:-radius/4+lx, y:ly }, { x:radius/4+lx, y:ly } );
	theDocument.selectAll();
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
	var out = new Array();
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