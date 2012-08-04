try {
	var theKey = fl.tools.getKeyDown();
	runScript( "Create Snap Object", theKey );
}catch( error ){
	fl.trace( error );
}

function runScript( command, activeKey ){
	fl.runScript( fl.configURI + "Javascript/EDAPT Common Functions.jsfl" );
	initialize();
	switch( activeKey ) {
		case 49:
			insertSnapObjects( command, [1] );
			break;
		case 50:
			insertSnapObjects( command, [2] );
			break;
		case 51:
			insertSnapObjects( command, [3] );
			break;
		case 52:
			insertSnapObjects( command, [4] );
			break;
		case 53:
			insertSnapObjects( command, [5] );
			break;
		default:
			// Menu or default shortcut
			var settings = fl.getDocumentDOM().xmlPanel( fl.configURI + "XULControls/CreateSnapObject.xml" );
			if( settings.dismiss == "accept" ){
				objects = [];
				if( settings.one   == "true" ){ objects.push(1); }
				if( settings.two   == "true" ){ objects.push(2); }
				if( settings.three == "true" ){ objects.push(3); }
				if( settings.four  == "true" ){ objects.push(4); }
				if( settings.five  == "true" ){ objects.push(5); }
				insertSnapObjects( command, objects );
			}
			break;
	}
}

function insertSnapObjects( commandname, requested ){
	var currentDoc = fl.getDocumentDOM();
	var currentLib = currentDoc.library ;  
	var items = currentLib.items;
	var specialLayerNumber = -1;
	
	/* 1. Check whether we need to create objects. */
	
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
	
	/* 2. Check if there is a "special" layer. If it does not exist - create it. */
	
	// Check for the "special" layer existance.
	var affectedLayers = currentDoc.getTimeline().layers;
	for( var i=0; i<affectedLayers.length; i++ ){
		var l = affectedLayers[i];
		if( l.layerType != "folder" ){
			if( l.name == EDAPSettings.createSnapObject.layerName ){
				specialLayerNumber = i;
				break;
			}
		}
	}
	if( specialLayerNumber == -1 ){
		createSpecialLayer( currentDoc );
	}
	
	/* 3. Create the necessary list of symbols. */
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
				drawShape( weights[i] );
				tempDoc.exitEditMode();
				theSymbols.push( { weight:weights[i], item:mySymbol } );
			}
		}
		currentDoc.setCustomStroke( originalStroke );
		if( tempDoc ){
			tempLib = null;
			fl.closeDocument( tempDoc, false ); 
		}
	}

	/* 4. Copy the symbols, so we can paste them in the center of the visible part of the stage. */
	if( weights.length == 0 ){
		copySymbols( currentDoc, requested, theSymbols, true );
	}
	else{
		copySymbols( tempDoc, requested, theSymbols, false );
	}

	/* 5. Set the "special" layer as a current. */
	currentDoc.getTimeline().currentLayer = specialLayerNumber;

	/* 6. Paste the symbols in the centre of the visible area. */
	if( currentDoc.getTimeline().layers[ currentDoc.getTimeline().currentLayer ].locked == false ){
		currentDoc.clipPaste();
	}
	else{
		displayMessage( commandname + " : The '" + EDAPSettings.createSnapObject.layerName + "' layer is locked.", 2 );	
	}

	/* 7. Display messages */
	if( EDAPSettings.createSnapObject.showAlert == true ){
		var message = "A layer called &quot;" + EDAPSettings.createSnapObject.layerName + "&quot; was created for convenience." + "\n" +
		"It is recommended to place all needed instances of" + "\n" +
		"the snap objects onto this layer.";

		if( specialLayerNumber == -1 ){
			displayOptionalMessageBox( commandname,  message, "createSnapObject" );
		}
	}
}

function createSpecialLayer( doc ){
	doc.getTimeline().currentLayer = 0;
	doc.getTimeline().addNewLayer( EDAPSettings.createSnapObject.layerName );
	var xLayer = doc.getTimeline().layers[ doc.getTimeline().currentLayer ];
	xLayer.color = "#FF0000";
	xLayer.outline = true;	
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
	if( isCurrent ){ timeline.setLayerProperty( "locked", true, "others" ); };
	theDocument.selectAll( true );
	theDocument.clipCut();
	if( isCurrent ){
		timeline.deleteLayer( n );
		restoreObjectStateFromMap( timeline.layers, layerMap );
	}
}

// Drawing functions
function drawShape( w ){
	if( w == 1 || w == 2 ){
		createCircle( w, {x:0, y:0}, 6 );
	}
	else{
		var data = createShapeData( w );
		var path = polygonToPath( data );
		createCircle( 1, {x:0, y:0}, 6 );
		path.makeShape();
	}
	fl.getDocumentDOM().selectAll();
	fl.getDocumentDOM().setFillColor( null );
	fl.getDocumentDOM().setStrokeColor( "#00000001" );
	fl.getDocumentDOM().setStrokeStyle( "hairline" );
}

function createShapeData( w ){
	switch( w ){
		case 3:	return createPolygon( 3, {x:0, y:0}, 5 );
		case 4: return createPolygon( 4, {x:0, y:0}, 5 );
		case 5: return createStar( 5, {x:0, y:0}, 5.5, 2 );
	}
}

function createCircle( anumber, acenter, radius ){
	var l = acenter.x - radius;
	var t = acenter.y - radius;
	var r = acenter.x + radius;
	var b = acenter.y + radius;
	var f = radius * 0.4;
	if( anumber == 1 ){
		fl.getDocumentDOM().addNewOval( {left:l, top:t, right:r, bottom:b} );
	}
	else if( anumber == 2 ){
		fl.getDocumentDOM().addNewOval( {left:l, top:t, right:r, bottom:b} );
		fl.getDocumentDOM().addNewOval( {left:l+f, top:t+f, right:r-f, bottom:b-f} );
	}
	var lx = acenter.x;
	var ly = acenter.y;
	fl.getDocumentDOM().addNewLine({x:lx, y:-radius/4 + ly}, {x:lx, y:radius/4 + ly});
	fl.getDocumentDOM().addNewLine({x:-radius/4+lx, y:ly}, {x:radius/4+lx, y:ly});	
}

function createStar( arms, center, rOuter, rInner ){
    var out = new Array();
    var angle = Math.PI / arms;
    for ( var i = 0; i < 2 * arms; i++ ) {
        var r = (i & 1) == 0 ? rOuter : rInner;
		out.push( center.x + Math.cos(i * angle) * r );
		out.push( center.y + Math.sin(i * angle) * r );	
    }
	out.push( out[0] );
	out.push( out[1] );
    return out;
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