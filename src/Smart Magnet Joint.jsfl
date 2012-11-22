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
	runScript( "Smart Magnet Joint" );
}catch( error ){
	fl.trace( error );
}

function runScript( commandname ){
	var doc = fl.getDocumentDOM(); 
	if( doc == null ){
		fl.trace( "No document open." );
		return;
	}
	fl.runScript( fl.configURI + "Javascript/EDAPT Common Functions.jsfl" );
	initialize();

	var doc = fl.getDocumentDOM();
	var originalSelection = doc.selection;
	var myElements = originalSelection.slice();
	var myTimeline = doc.getTimeline();
	var cnt = myElements.length;
	myElements.sort( sortOnParent );
	while( cnt -- ){
		var el = myElements[ cnt ];
		var isRig = false;
		if( isElementSymbol( el ) ){
			// For each element in the selection...
			if( el.hasPersistentData( "rigData" ) ){
				// Remember that the object is part of a rig
				// Create a collection of parent object matrices for the element.
				isRig = true;
				var inf = getRigData( el );
				var parents = filterStageElements( getParentMatrix, myTimeline, false, false, true, [ el ], inf );	
			}
			else{

				// Create a collection with matrices of possible target objects for the element.
				// Modify the objects, adding "distance" property, describing the distance between the element and the possible target object.
				var parents = filterStageElements( getMatrix, myTimeline, false, false, true, [el] );
				for( var i=0; i<parents.length; i++ ){
						var p = parents[i];
						var pt = { x:p.matrix.tx, y:p.matrix.ty };
						var pos = { x:el.matrix.tx, y:el.matrix.ty };	
						var dist = fl.Math.pointDistance( pt, pos );
						p.distance = dist;
				}
				// Sort the possible target objects on its distance. The colosest object becomes first in the collection.
				parents.sort( sortOnDistance );
			}
			
			if( parents.length > 0 ){
				// Get the first ( closest ) parent object
				// Create a collection of snap-objects within it.
				var myParent = parents[0];
				var snaps = filterStageElements( isSnapObject, myParent.element.libraryItem.timeline, true, false, true, [el] );
				// Modify the objects, adding "distance" property, describing the distance between the element and the possible snap-object.
				for( var i=0; i<snaps.length; i++ ){
					var obj  = { element:snaps[i] };
					var theX = snaps[i].matrix.tx * myParent.matrix.a + snaps[i].matrix.ty * myParent.matrix.c + myParent.matrix.tx;
					var theY = snaps[i].matrix.ty * myParent.matrix.d + snaps[i].matrix.tx * myParent.matrix.b + myParent.matrix.ty;
					var pos  = {x:theX, y:theY};
					var dist = fl.Math.pointDistance( pos, {x:el.matrix.tx, y:el.matrix.ty} );
					obj.position = pos;
					obj.distance = dist;
					snaps[i] = obj;
				}
				// Sort the possible snap-objects on its distance. The colosest object becomes first in the collection.
				snaps.sort( sortOnDistance );
				if( snaps.length > 0 ){
					/*	Here is our snap-object
						If the element is not a part of a rig
							if the distance is less than or equal to the threshold
								snap the element to the snap-object position.
						else
							snap the element to the snap-object position.
					*/
					var closest = snaps[0];
					if( ! isRig ){
						if( closest.distance <= EDAPSettings.smartSnap.distanceThreshold ){
							doc.selectNone();
							doc.selection = [ el ];
							doc.moveSelectionBy( { x: closest.position.x - el.matrix.tx, y: closest.position.y - el.matrix.ty } );	
						}
					}
					else{
						doc.selectNone();
						doc.selection = [ el ];
						doc.moveSelectionBy( { x: closest.position.x - el.matrix.tx, y: closest.position.y - el.matrix.ty } );
					}
				}
			}
			
		}
	}
	doc.selection = originalSelection;
}
function sortOnDistance( a, b ){
	return a.distance - b.distance;
}
function isSnapObject( element ){
	if( isElementSymbol( element ) ){
		return Boolean( element.libraryItem.getData( "weight" ) == 1 );
	}
	else{
		return false;
	}
}
function getMatrix( element ){
	if( ! getRigData( element ) && hasSnapObject( element ) ){
		return { element:element, matrix:element.matrix };
	}
	return null;
}
function hasSnapObject( element ){
	if( isElementSymbol( element ) ){
		var retval = filterStageElements( isSnapObject, element.libraryItem.timeline, true, true, false, [] );
		return Boolean( retval[ 0 ] );
	}
	return false;
}
function getParentMatrix( element, inf ){
	var data = getRigData( element );
	if( data ){
		if( ( data.rig == inf.rig && data.id == inf.parent ) ){
			return { element:element, matrix:element.matrix };
		}
		return null;
	}
	return null;
}
function sortOnParent( a, b ){
	// Sorts stage elements on its "parent" id.
	if( a.hasPersistentData( "rigData" ) && b.hasPersistentData( "rigData" ) ){
		var obj1 = getRigData( a );
		var obj2 = getRigData( b );
		return ( convertID( obj2.parent ) - convertID( obj1.parent ) );
	}
	return -1;
}
function convertID( id ){
	/*
	-1 = empty strings
	 0  = non-empty strings
	>0 = strings that can be parsed to numbers
	*/
	if( id.length == 0 ){ return -1; }
	var retval = Number( id );
	return isNaN( retval ) ? 0 : retval;
}