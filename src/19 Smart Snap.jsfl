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
	runScript( "Smart Snap" );
}catch( error ){
	fl.trace( error );
}

function runScript( commandname ){
	if( fl.getDocumentDOM() == null ){
		fl.trace( "No document open." );
		return;
	}

	fl.runScript( fl.configURI + "Javascript/EDAPT Common Functions.jsfl" );
	initialize();

	var myTimeline = fl.getDocumentDOM().getTimeline();
	var currentframe = myTimeline.currentFrame;
	var layers = myTimeline.layers;
	var sel = fl.getDocumentDOM().selection;
	for ( var s=0; s< sel.length; s++ ){
		var selectedElement =  sel[s];
		var possibleSnapObjects = new Array();
		for ( var i = 0; i < layers.length; i++) {
			var elts = layers[i].frames[ currentframe].elements;
			for (var j = 0; j < elts.length; j++) {
				var elt = elts[j];
				if( ! isInArray( sel, elt ) ){
					if( elt.instanceType == "symbol" ){
						elt.libraryItem.timeline.currentFrame =  elt.firstFrame; // bugfix  2011/08/31
						checkInsideElement( selectedElement, elt.libraryItem.timeline, possibleSnapObjects, elt.matrix );
					}
				}
			}
		}
		if( possibleSnapObjects.length > 0 ){
			possibleSnapObjects.sort( sortOnDistance )
			var closest = possibleSnapObjects[0];
			fl.getDocumentDOM().selectNone();
			fl.getDocumentDOM().selection = [ selectedElement ];
			flash.getDocumentDOM().moveSelectionBy( { 
				x: closest.position.x - selectedElement.matrix.tx, 
				y: closest.position.y - selectedElement.matrix.ty } );
		}
		else{
			displayMessage( commandname + " : There is no snap object found in the "+ EDAPSettings.distanceThreshold + " pixel(s) area.", 2 );
		}
	}
	fl.getDocumentDOM().selection = sel;
}

function checkInsideElement( aTarget, tml, alist, mt ){
	var layers = tml.layers;
	var currentframe = tml.currentFrame;
	for ( var i = 0; i < layers.length; i++) {
		var elts = layers[i].frames[ currentframe].elements;
		for ( var j = 0; j < elts.length; j++) { 
			var elt = elts[j];
			if( elt.instanceType == "symbol" ){
				if( elt.libraryItem.name == EDAPSettings.createSnapObject.name ){
					var theX = elt.matrix.tx * mt.a + elt.matrix.ty * mt.c + mt.tx;
					var theY = elt.matrix.ty * mt.d + elt.matrix.tx * mt.b + mt.ty;
					var pos = { x:theX, y:theY };
					var dist = fl.Math.pointDistance( {x:aTarget.matrix.tx, y:aTarget.matrix.ty}, pos );
					if( dist <= EDAPSettings.smartSnap.distanceThreshold ){
						alist.push( { distance:dist, position:pos } );
					}
				}
			}
		}
	}
}

function sortOnDistance( a, b ){
	return ( a.distance - b.distance );
}

function isInArray( asel, ael ){
	for( var i=0; i<asel.length; i++ ){
		if( asel[i] == ael ){
			return true;
		}
	}
	return false;
}