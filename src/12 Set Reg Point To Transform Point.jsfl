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
  
 version: 3.0.0
 */

try {
    runScript( "Set Reg Point To Transform Point" );
}catch( error ){
    fl.trace( error );
}
function runScript( commandname ){
    var selection = fl.getDocumentDOM().selection;
    if( selection.length == 0 ){
        Edapt.utils.displayMessage( commandname + ": " + "No selection", 1 );
        return;
    }else if( selection.length > 1 ){
        Edapt.utils.displayMessage( commandname + ": " + "Please, select  single symbol on the stage.", 1 );
        return;
    }

    if( Edapt.utils.isElementSymbol( selection[0] ) == false ){
        Edapt.utils.displayMessage( commandname + ": " + "Please, select  single symbol on the stage.", 1 );
        return;
    }
    var mtr = selection[0].matrix;
    var transPoint = fl.getDocumentDOM().getTransformationPoint();
    var movements = calculateMovements( transPoint, mtr );
    fl.getDocumentDOM().enterEditMode( "inPlace" );
    var innerTimeline = fl.getDocumentDOM().getTimeline();										// Store a reference to the symbol's timeline
    var innerLayers = innerTimeline.layers;
    var layerMap = Edapt.utils.createObjectStateMap( innerLayers, [ "locked", "visible" ] );	// Store a layer "locking" map
	innerTimeline.setLayerProperty( "visible", true, "all" );									// Show all layers
	for( var i = 0; i < innerLayers.length; i ++ ){
        innerTimeline.setLayerProperty( "locked", false, "all" );								// Unlock all layers
        innerTimeline.setSelectedLayers( i, true );
        setMultipleLayerProperty( "locked", true, innerTimeline, [i] );							// Lock all other layers( skipping folders )
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
    Edapt.utils.restoreObjectStateFromMap( innerLayers, layerMap );								// Restore layer states, using the previously created map.
    fl.getDocumentDOM().exitEditMode();
    fl.getDocumentDOM().moveSelectionBy( movements.symbol );
    fl.getDocumentDOM().setTransformationPoint( {x:0, y:0} );
    fl.getDocumentDOM().selection = selection;													// Restore selection.
}
function setMultipleLayerProperty( prop, state, tml, exclude ){
    var cnt = tml.layers.length;
    while( cnt -- ){
        if( ! Edapt.utils.include( exclude, cnt ) ){
            if( tml.layers[ cnt ].layerType != "folder" ){
                tml.setSelectedLayers( cnt, true );
                tml.setLayerProperty( prop, state );
            }
        }
    }
}
function calculateMovements( transPoint, mtr ){
    var retval = { content:{}, symbol:{} };
    retval.content.x = -transPoint.x;
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