try {
	runScript( "Set Reg Point To Transform Point" );
}catch( error ){
	fl.trace( error );
}

function runScript( commandname ){
	fl.runScript( fl.configURI + "Javascript/EDAPT Common Functions.jsfl" );
	initialize();
	var selection = fl.getDocumentDOM().selection;
	if( selection.length == 0 ){
		displayMessage( commandname + ": " + "No selection", 1 );
		return;
	}
	else if( selection.length > 1 ){
		displayMessage( commandname + ": " + "Please, select  single symbol on the stage.", 1 );
		return;
	}
	
	if( isElementSymbol( selection[0] ) == false ){
		displayMessage( commandname + ": " + "Please, select  single symbol on the stage.", 1 );
		return;
	}

	var mtr = currentElement = selection[0].matrix;
	var transPoint = fl.getDocumentDOM().getTransformationPoint();
	var movements = calculateMovements( transPoint, mtr );
	fl.getDocumentDOM().enterEditMode( "inPlace" );
	var innerTimeline = fl.getDocumentDOM().getTimeline();                      // Store a reference to the symbol's timeline
	var innerLayers = innerTimeline.layers;
	var layerMap = createObjectStateMap( innerLayers, [ "locked" ] );  			// Store a layer "locking" map
	for( var i = 0; i < innerLayers.length; i ++ ){
		innerTimeline.setLayerProperty( "locked", false, "all" );               // Unlock all layers
		innerTimeline.setSelectedLayers( i, true );
		innerTimeline.setLayerProperty( "locked", true, "others" );             // Lock others
		var frameArray = innerLayers[i].frames;
		var n = frameArray.length;
		for ( var j = 0; j < n; j ++ ) {
			if ( j == frameArray[j].startFrame ) {
				innerTimeline.currentFrame = j;
				fl.getDocumentDOM().selectAll();
				if( fl.getDocumentDOM().selection.length > 0 ){
					fl.getDocumentDOM().moveSelectionBy( movements.content );
				}
				
			}
		}
	}
	restoreObjectStateFromMap( innerLayers, layerMap );                			// Restore layer states, using the previously created map.
	fl.getDocumentDOM().exitEditMode();
	fl.getDocumentDOM().moveSelectionBy( movements.symbol );
	fl.getDocumentDOM().setTransformationPoint( {x:0, y:0} );
	fl.getDocumentDOM().selection = selection;                                  // Restore selection.
}

function calculateMovements( transPoint, mtr ){
	var retval = { content:{}, symbol:{} };
	retval.content.x = -transPoint.x
	retval.content.y = -transPoint.y;
	var tempPoint = transformPoint( transPoint, mtr );
	retval.symbol.x  = ( tempPoint.x - mtr.tx );
	retval.symbol.y  = ( tempPoint.y - mtr.ty );
	return retval;
}

function transformPoint( pt, mt ){
	var theX = pt.x * mt.a + pt.y * mt.c + mt.tx;
	var theY = pt.y * mt.d + pt.x * mt.b + mt.ty;
	return { x:theX, y:theY };
}