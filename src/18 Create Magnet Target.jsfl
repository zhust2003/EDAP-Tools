try {
	runScript( "Create Snap Object" );
}catch( error ){
	fl.trace( error );
}

function runScript( command ){
	fl.runScript( fl.configURI + "Javascript/EDAPT Common Functions.jsfl" );
	initialize();
	insertSnapObjects( command, [1] );
}

function insertSnapObjects( commandname, requested ){
	var currentDoc = fl.getDocumentDOM();
	var myTimeline = currentDoc.getTimeline();
	var currentLib = currentDoc.library ;  
	var items = currentLib.items;
	var specialLayerNumber = -1;

	// *** 1. Check whether we need to create objects. *** //

	// Check for existing symbols.
	var theSymbols = [];
	for( var i=0; i<items.length; i++ ){
		var item = items[i];
		if( item.hasData( "signature" ) && item.hasData( "weight" ) ){
			if( item.getData( "signature" ) == "EDAPT" ){
				theSymbols.push( { weight:item.getData( "weight" ), item:item } );
			}
		}
	}
	// Remove the alreday existing weights from the list of required weights.
	weights = requested.slice(0);
	for( var i=0; i<theSymbols.length; i++ ){
		var w = theSymbols[i].weight;
		if( include( weights, w ) ){
			var idx = indexOf( weights, w );
			if( idx != -1 ){
				weights.splice( idx, 1 );
			}
		}
	}

	// *** 2. Check if there is a "special" layer. If it does not exist - create it. *** //

	// Check for the "special" layer existance.
	var affectedLayers = myTimeline.layers;
	for( var i=0; i<affectedLayers.length; i++ ){
		var l = affectedLayers[i];
		if( l.layerType != "folder" ){
			if( l.name == EDAPSettings.createMagnetTarget.layerName ){
				specialLayerNumber = i;
				break;
			}
		}
	}
	
	if( specialLayerNumber == -1 ){
		var xlayer = createSpecialLayer( currentDoc );
		specialLayerNumber = indexOf( myTimeline.layers, xlayer );
	}
	
	fl.trace( "Special Layer: " + specialLayerNumber );
	
	// *** 3. Create the necessary list of symbols. *** //
	var originalStroke = currentDoc.getCustomStroke( "toolbar" );
	if( weights.length > 0 ){
		var tempDoc = fl.createDocument( "timeline" );
		var tempLib = tempDoc.library;
		var myStroke = createStroke();
		tempDoc.setCustomStroke( myStroke );

		// Create needed symbols.
		for( var i=0; i<weights.length; i++ ){
			var name =  "SnapObject" + weights[i].toString();
			var success = tempLib.addNewItem( "graphic", name );
			if( success ){
				var mySymbol = tempLib.getSelectedItems()[0];
				mySymbol.addData( "weight", "integer", weights[i] );
				mySymbol.addData( "signature", "string", "EDAPT" );
				tempLib.editItem();
				drawShape( tempDoc, weights[i] );
				tempDoc.exitEditMode();
				theSymbols.push( { weight:weights[i], item:mySymbol } );
			}
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

	// *** 4. Copy the symbols, so we can paste them in the center of the visible part of the stage. *** //
	if( weights.length == 0 ){
		copySymbols( currentDoc, requested, theSymbols, true );
	}
	else{
		copySymbols( tempDoc, requested, theSymbols, false );
	}

	if( tempDoc ){
		tempLib = null;
		fl.closeDocument( tempDoc, false ); 
	}

	// *** 5. Set the "special" layer as a current. *** //
	myTimeline.currentLayer = specialLayerNumber;

	// *** 6. Paste the symbols in the centre of the visible area. *** //
	if( myTimeline.layers[ myTimeline.currentLayer ].locked == false ){
		currentDoc.clipPaste();
	}
	else{
		displayMessage( commandname + " : The '" + EDAPSettings.createMagnetTarget.layerName + "' layer is locked.", 2 );	
	}

	// *** 7. Display messages. *** //
	if( EDAPSettings.createMagnetTarget.showAlert == true ){
		var message = "A layer called &quot;" + EDAPSettings.createMagnetTarget.layerName + "&quot; was created for convenience." + "\n" +
		"It is recommended to place all needed instances of" + "\n" +
		"the snap objects onto this layer.";
		if( specialLayerNumber == -1 ){
			displayOptionalMessageBox( commandname,  message, "createMagnetTarget" );
		}
	}
}
function createSpecialLayer( doc ){
	doc.getTimeline().currentLayer = 0;
	doc.getTimeline().addNewLayer( EDAPSettings.createMagnetTarget.layerName );
	var xLayer = doc.getTimeline().layers[ doc.getTimeline().currentLayer ];
	xLayer.color = "#FF0000";
	xLayer.outline = true;
	return xLayer;
}
function copySymbols( theDocument, weights, theSymbols, isCurrent ){
	var timeline = theDocument.getTimeline();
	if( isCurrent ){
		var layerMap = createObjectStateMap( timeline.layers, [ "locked" ] );
		var n = timeline.addNewLayer();
		timeline.setSelectedLayers( n, true );
		theDocument.getTimeline().currentLayer = n; 
	}
	for( var i=0; i<weights.length; i++ ){
		var w = weights[i];
		for( j=0; j<theSymbols.length; j++ ){
			var xObject = theSymbols[j];
			if( xObject.weight == w ){
				theDocument.library.addItemToDocument({x:0, y:0}, xObject.item.name );
				break;
			}
		}
	}
	if( isCurrent ){
		timeline.setLayerProperty( "locked", true, "others" );
	}
	theDocument.selectAll( true );
	theDocument.clipCut();
	if( isCurrent ){
		timeline.deleteLayer( n );
		restoreObjectStateFromMap( timeline.layers, layerMap );
	}
}

// Drawing functions
function drawShape( theDocument, w ){
	createCircle( theDocument, w, {x:0, y:0}, 6 );
	// Select, ungroup and make fill and stroke invisible.
	theDocument.selectAll();
	var needToUngroup = false;
	for( var i=0; i<theDocument.selection.length; i++ ){
		if( theDocument.selection[i].isGroup ){
			needToUngroup = true;
			break;
		}
	}
	if( needToUngroup ){ theDocument.unGroup(); }; 
	theDocument.setFillColor( null );
	theDocument.setStrokeColor( "#00000001" );
	theDocument.setStrokeStyle( "hairline" );
}
function createCircle( theDocument, anumber, acenter, radius ){
	var l = acenter.x - radius;
	var t = acenter.y - radius;
	var r = acenter.x + radius;
	var b = acenter.y + radius;
	var f = radius * 0.4;
	theDocument.addNewOval( {left:l, top:t, right:r, bottom:b} );
	var lx = acenter.x;
	var ly = acenter.y;
	theDocument.addNewLine({x:lx, y:-radius/4 + ly}, {x:lx, y:radius/4 + ly});
	theDocument.addNewLine({x:-radius/4+lx, y:ly}, {x:radius/4+lx, y:ly});

	theDocument.selectAll();
	theDocument.setFillColor( null );
	theDocument.setStrokeColor( "#00000001" );
	theDocument.setStrokeStyle( "hairline" );	
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