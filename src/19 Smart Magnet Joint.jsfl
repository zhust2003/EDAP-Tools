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
	var originalSelection = doc.selection;
	var myElements = originalSelection.slice();
	var myTimeline = doc.getTimeline();
	var cnt = myElements.length;
	myElements.sort( sortOnParent );
	while( cnt -- ){
		var el = myElements[ cnt ];
		var isRig = false;
		if( Edapt.utils.isElementSymbol( el ) ){
			// For each element in the selection...
			var parents;
			var snaps;
			if( el.hasPersistentData( "rigData" ) ){
				isRig = true;
				var inf = Edapt.utils.getData( el, "SMR" );
				parents = Edapt.utils.filterStageElements( getParentMatrix, myTimeline, false, true, [ el ], inf );
				if( parents.length > 0 ){
					var myParent = parents[0];
					snaps = getSnapObjects( myParent.element );
					var t = [];
					for( var i=0; i<snaps.length; i++ ){
						var mInfo = Edapt.utils.getData( snaps[i].element, "MT" );
						if( mInfo ){
							if( mInfo.id == inf.snapTo ){
								var obj  = { element:snaps[i] };
								var theX = snaps[i].matrix.tx * myParent.matrix.a + snaps[i].matrix.ty * myParent.matrix.c + myParent.matrix.tx;
								var theY = snaps[i].matrix.ty * myParent.matrix.d + snaps[i].matrix.tx * myParent.matrix.b + myParent.matrix.ty;
								var pos  = {x:theX, y:theY};
								obj.position = pos;
								t.push( obj );
							}
						}
					}
					snaps = t.slice(0);
					
					
				}
			}
			else{
				parents = Edapt.utils.filterStageElements( getTargetMatrix, myTimeline, false, false, [ el ] );
				if( parents.length > 0 ){
					snaps = [];
					for( var i=0; i<parents.length; i++ ){
							var e = parents[i];
							for( var j=0; j<e.snaps.length; j++ ){
								var theX = e.snaps[j].matrix.tx * e.element.matrix.a + e.snaps[j].matrix.ty *  e.element.matrix.c +  e.element.matrix.tx;
								var theY = e.snaps[j].matrix.ty * e.element.matrix.d + e.snaps[j].matrix.tx *  e.element.matrix.b +  e.element.matrix.ty;
								var pos  = {x:theX, y:theY};
								var dist = fl.Math.pointDistance( pos, {x:el.matrix.tx, y:el.matrix.ty} );
								snaps.push( { position:pos, distance:dist, parent:e.element, element:e.snaps[j] } );
							}
					}
					snaps.sort( sortOnDistance );
				}
			}
			if( snaps ){ // Bug fix - 20 Dec, 2012 ( 488-HPW-UNW9 )
				if( snaps.length > 0 ){
					var closest = snaps[0];
					if( ! isRig ){
						if( closest.distance <= Edapt.settings.smartMagnetJoint.distanceThreshold ){
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
		var retval = { element:el, matrix:el.matrix };
		if( remove ){
			aTimeline.clearKeyframes( cf );
		}
		return retval;
		}
	else{
		return null;
	}
}
function getSnapObjects( element ){
	if( Edapt.utils.isElementSymbol( element ) ){
		var retval = Edapt.utils.filterStageElements( isSnapObject, element.libraryItem.timeline, false, false, [] );
		return retval;
	}
	return [];
}
function getTargetMatrix( element, aTimeline, currentLayernum, cf, n ){
	var remove = false;
	var layer = aTimeline.layers[ currentLayernum ];
	if( layer.frames[ cf ].startFrame != cf ){
		aTimeline.currentLayer = currentLayernum;
		aTimeline.convertToKeyframes( cf );
		remove = true;
	}
	var el = layer.frames[ cf ].elements[n];
	if( Edapt.utils.isElementSymbol( el ) ){
		el.libraryItem.timeline.currentFrame = el.firstFrame;  // Bug fix - 20 Dec, 2012 ( T7D-7AZ-NJXH )
		var snaps = getSnapObjects( el );
		var retval = { element:el, matrix:el.matrix, snaps:snaps };
		if( remove ){
			aTimeline.clearKeyframes( cf );
		}
		return retval;		
	}
	return null;
}
function getParentMatrix( element, aTimeline, currentLayernum, cf, n, inf ){
	var data = Edapt.utils.getData( element, "SMR" );
	var remove = false;
	if( data ){
		if( ( data.rig == inf.rig && data.id == inf.parent ) ){
			var layer = aTimeline.layers[ currentLayernum ];
			if( layer.frames[ cf ].startFrame != cf ){
				aTimeline.currentLayer = currentLayernum;
				aTimeline.convertToKeyframes( cf );
				remove = true;
			}
			var el = layer.frames[ cf ].elements[ n ];
			if( Edapt.utils.isElementSymbol( el ) ){
				el.libraryItem.timeline.currentFrame = el.firstFrame; // Bug fix - 20 Dec, 2012 ( T7D-7AZ-NJXH )
				var retval = { element:el, matrix:el.matrix };
				if( remove ){
					aTimeline.clearKeyframes( cf );
				}						
				return retval;
			}
			return null;
		}
		return null;
	}
	return null;

}
function sortOnParent( a, b ){
	// Sorts stage elements on its "parent" id.
	if( a.hasPersistentData( "rigData" ) && b.hasPersistentData( "rigData" ) ){
		var obj1 = Edapt.utils.getData( a, "SMR" );
		var obj2 = Edapt.utils.getData( b, "SMR" );
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