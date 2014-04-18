/*
Electric Dog Flash Animation Power Tools
Copyright (C) 2013  Vladin M. Mitov

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
	runScript( "Smart Transform Point CCW" );
}catch( error ){
	fl.trace( error );
}
function runScript( commandname ){
	var MT = fl.tools.altIsDown;
	if( MT ){
		//fl.runScript( fl.configURI + "Commands/Smart transform Point.edapt", 
		//"selectNextMagnetTarget", "ccw", commandname );
		selectNextMagnetTarget( "ccw", commandname );
	}else{
		//fl.runScript( fl.configURI + "Commands/Smart transform Point.edapt", 
		//"selectNextRegPoint", "ccw", commandname );
		selectNextRegPoint( "ccw", commandname );
	}
}

// REGISTRATION POINTS
function selectNextRegPoint( dest, commandname ){
	//fl.trace( "selectNextRegPoint" + dest.toUpperCase() );
	var doc = fl.getDocumentDOM();
    if( doc == null ){
        fl.trace( "No document open." );
        return;
    }
    var sel = doc.selection;
    if( sel.length > 1 ){
        if( ! Edapt.stpf ){
            Edapt.stpf = {};
            Edapt.stpf.index = -1;
            Edapt.stpf.objects = sel.slice( 0 );
            Edapt.stpf.sorted = prepareSelectionRegPoint( sel );
            jumpToNextRegPoint( doc, dest );
        }
        else{
            if( ! isArraysEqual( sel, Edapt.stpf.objects ) ){
                Edapt.stpf.objects = sel.slice( 0 );
                Edapt.stpf.sorted = prepareSelectionRegPoint( sel );
                Edapt.stpf.index = -1;
                jumpToNextRegPoint( doc, dest );
            }
            else{
                jumpToNextRegPoint( doc, dest );
            }
        }
    }
    else{
        Edapt.utils.displayMessage( commandname + " : This command works with multiple selection only", 2 );
    }	
}
function jumpToNextRegPoint( doc, dest ){
    if( dest == "cw" ){
		if( Edapt.stpf.index < Edapt.stpf.objects.length - 1 ){
			Edapt.stpf.index ++;
		}
		else{
			Edapt.stpf.index = 0;
		}
    }else if( dest == "ccw" ){
		if( Edapt.stpf.index > 0 ){
			Edapt.stpf.index --;
		}
		else{
			Edapt.stpf.index  = Edapt.stpf.objects.length - 1;
		}	
    }
    var currentObject = Edapt.stpf.sorted[ Edapt.stpf.index ];
    var newPos = { "x":currentObject.element.matrix.tx, "y":currentObject.element.matrix.ty };
    doc.getTransformationPoint(); // Force Flash to apply current transformation correctly
    doc.rotateSelection( 0 );	  // Force Flash to redraw the screen;
    doc.setTransformationPoint( newPos );
    var markPoint = toStage( doc, newPos );
    var marker = new Edapt.drawing.ScreenMarker( markPoint.x, markPoint.y, 250 );
    marker.draw( 14, 14 );
}
function prepareSelectionRegPoint( aSelection ){
    var retval = [];
    var left   = Infinity;
    var top    = Infinity;
    var right  = -Infinity;
    var bottom = -Infinity;
    var i;
    for( i = 0; i < aSelection.length; i++ ){
        left   = Math.min( aSelection[ i ].matrix.tx, left );
        right  = Math.max( aSelection[ i ].matrix.tx, right );
        top    = Math.min( aSelection[ i ].matrix.ty, top );
        bottom = Math.max( aSelection[ i ].matrix.ty, bottom );
    }
    var center = { "x": left + ( right - left ) / 2, "y": top + ( bottom - top ) / 2 };
    for( i = 0; i < aSelection.length; i++ ){
        var element = aSelection[ i ];
        var item = {};
        item.element = element;
        item.theta = Math.atan2( element.matrix.tx - center.x, element.matrix.ty - center.y );
        retval.push( item );
    }
    retval.sort( sortByClockwise );
    return retval;
}

// COMMON
function isArraysEqual( arr1, arr2 ){
    if( arr1.length != arr2.length ){ return false; }
    for( var i=0; i<arr1.length; i++ ){
        if( arr1[i] != arr2[i] ){
            return false;
        }
    }
    return true;
}
function toStage( doc, apoint ){
    if( ! doc ){ return null; }
    var mat = doc.viewMatrix;
    return { x:apoint.x * mat.a + apoint.y * mat.c + mat.tx, y:apoint.x * mat.b + apoint.y * mat.d + mat.ty };
}
function sortByClockwise( a, b ){
    return b.theta - a.theta;
}

// MAGNET TARGETS
function selectNextMagnetTarget( dest, commandname ){
	//fl.trace( "selectNextMagnetTarget" + dest.toUpperCase() );
	var doc = fl.getDocumentDOM();
    if( doc == null ){
        fl.trace( "No document open." );
        return;
    }
    var sel = doc.selection;
    if( sel.length > 1 ){
        if( ! Edapt.stpi ){
            Edapt.stpi = {};
            Edapt.stpi.index = -1;
            Edapt.stpi.objects = sel.slice( 0 );
            Edapt.stpi.sorted = prepareSelectionMagnetTarget( sel );
            if( Edapt.stpi.sorted.length > 0 ) jumpToNextMagnetTarget( doc, dest );
        }
        else{
            if( ! isArraysEqual( sel, Edapt.stpi.objects ) ){
                Edapt.stpi.objects = sel.slice( 0 );
                Edapt.stpi.sorted = prepareSelectionMagnetTarget( sel );
                Edapt.stpi.index = -1;
                if( Edapt.stpi.sorted.length > 0 ) jumpToNextMagnetTarget( doc, dest );
            }
            else{
                if( Edapt.stpi.sorted.length > 0 ) jumpToNextMagnetTarget( doc, dest );
            }
        }
    }
    else{
        Edapt.utils.displayMessage( commandname + " : This command works with multiple selection only", 2 );
    }
}
function jumpToNextMagnetTarget( doc, dest ){
    if( dest == "cw" ){
		if( Edapt.stpi.index < Edapt.stpi.sorted.length - 1 ){
			Edapt.stpi.index ++;
		}
		else{
			Edapt.stpi.index = 0;
		}	
    }else if( dest == "ccw" ){
		if( Edapt.stpi.index > 0 ){
			Edapt.stpi.index --;
		}
		else{
			Edapt.stpi.index  = Edapt.stpi.sorted.length - 1;
		}	
    }
    var currentObject = Edapt.stpi.sorted[ Edapt.stpi.index ];
	doc.getTransformationPoint(); // Force Flash to apply current transformation correctly
	doc.rotateSelection( 0 );	  // Force Flash to redraw the screen;
	var newPos = translatePositionToParent( currentObject.parent, currentObject.element );
	doc.setTransformationPoint( newPos );
	var markPoint = toStage( doc, newPos );
	var marker = new Edapt.drawing.ScreenMarker( markPoint.x, markPoint.y, 250 );
	marker.draw( 10, 10 );
}
function prepareSelectionMagnetTarget( aSelection ){
    var retval = [];
    var left   = Infinity;
    var top    = Infinity;
    var right  = -Infinity;
    var bottom = -Infinity;
    var i, j, snaps, element, newPos;
    for( i = 0; i < aSelection.length; i++ ){
        element = aSelection[ i ];
        snaps = getSnapObjects( element );
        for( j=0; j<snaps.length; j++ ){
            newPos = translatePositionToParent( element, snaps[ j ] );
            left   = Math.min( newPos.x, left );
            right  = Math.max( newPos.x, right );
            top    = Math.min( newPos.y, top );
            bottom = Math.max( newPos.y, bottom );
        }
    }
    var center = { "x": left + ( right - left ) / 2, "y": top + ( bottom - top ) / 2 };

    for( i = 0; i < aSelection.length; i++ ){
        element = aSelection[ i ];
        element.libraryItem.timeline.currentFrame = element.firstFrame;
        snaps = getSnapObjects( element );
        for( j=0; j<snaps.length; j++ ){
            newPos = translatePositionToParent( element, snaps[ j ] );
            var item = {};
            item.element = snaps[ j ];
            item.theta = Math.atan2( newPos.x - center.x, newPos.y - center.y );
            item.parent = element;
            retval.push( item );
        }
    }
    retval.sort( sortByClockwise );
    return retval;
}
function isSnapObject( element, aTimeline, currentLayernum, cf, n ){
    if( Edapt.utils.isMagnetTarget( element ) ){
        var remove = false;
        var layer = aTimeline.layers[ currentLayernum ];
        if( layer.frames[ cf ].startFrame != cf ){
            aTimeline.currentLayer = currentLayernum;
            aTimeline.convertToKeyframes( cf );
            remove = true;
        }
        var el = layer.frames[ cf ].elements[n];
        if( remove ){
            aTimeline.clearKeyframes( cf );
        }
        return el;
    }
    else{
        return null;
    }
}
function getSnapObjects( element ){
    if( Edapt.utils.isElementSymbol( element ) ){
        return Edapt.utils.filterStageElements( isSnapObject, element.libraryItem.timeline, false, false, [] );
    }
    return [];
}
function translatePositionToParent( parent, child ){
    var newX = child.matrix.tx * parent.matrix.a + child.matrix.ty *  parent.matrix.c +  parent.matrix.tx;
    var newY = child.matrix.ty * parent.matrix.d + child.matrix.tx *  parent.matrix.b +  parent.matrix.ty;
    return { "x":newX, "y":newY };
}