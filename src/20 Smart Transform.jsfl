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
	runScript( "Smart Transform" );
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
	
	var myTimeline = doc.getTimeline();
	var mySelection = doc.selection.slice();
	var parents = [];
	var root = null;
	
	// Part one: Finding the parent(s) of the selected elements.
	var cnt = mySelection.length;
	
	if( mySelection.length > 0 ){
		while( cnt -- ){
			var el = mySelection[ cnt ];
			if( isElementSymbol( el ) ){
				var inf = getRigData( el );
				if( inf ){ //  The element is part of a rig.
					var inf = getRigData( el );
					var parentlist = filterStageElements( isMyParent, myTimeline, true, false, [ el ], inf ); // No keys created
					if( parentlist.length == 1 ){ 
						if( ! include( parents, parentlist[0] ) ){
							parents.push( parentlist[0] );
						}
					}
					else if( inf.parent == "" ){
						root = el;
					}
				}
			}
		}
	}
	else{
		fl.trace( "No stage selection." );
		return;
	}
	
	//  Part two: Decide what to do
	if( root ){
		var children = new Array();
		getMyChildren( root, children, myTimeline );
		children.push( root );
		setSelectionAndTransformPoint( doc, root, children );
		return;
	}

	else{
		if( mySelection.length == 1 ){
			if( parents.length == 1 ){
				var parent = mySelection[0];
				var children = [];
				getMyChildren( parent, children, myTimeline );
				if( children.length > 0 ){
					children.push( parent );
					setSelectionAndTransformPoint( doc, parent, children );
					return;
				}
				else{
					//fl.trace( "Last element" );
					return;
				}
			}
		}
		else{
			if( parents.length == 1 ){
				//fl.trace( "First level branches" );
				return;
			}
			else{
				var oneChain = false;
				for( p in parents ){
					if( include( mySelection, parents[ p ] ) ){
						oneChain = true;
						break;
					}
				}
				if( oneChain ){
					mySelection.sort( sortOnParent );
					var parent = mySelection[ mySelection.length-1 ];
					doc.setTransformationPoint( { x:parent.matrix.tx, y:parent.matrix.ty } );
					return;
				}
				else{
					//fl.trace( "Multiple chains" );
					return;
				}
			}
		}
	}
}
function setSelectionAndTransformPoint( doc, parent, children ){
	doc.selectNone();
	doc.selection = children;
	doc.scaleSelection( 1, 1 );	// Bug fix - forces the Flash to show/redraw the transformation handles.
	doc.setTransformationPoint( { x:parent.matrix.tx, y:parent.matrix.ty } );
}
function getMyChildren( element, children, tml ){
	var retval = filterStageElements( isMyChild, tml, true, false, [ element ], getRigData( element ) ); // No keys created
	if( retval.length ){
		for( var i=0; i<retval.length; i++ ){
			getMyChildren( retval[i], children, tml );
		}
		for( var j=0; j<retval.length; j++ ){
			children.push( retval[j] );
		}
	}
}
function isMyParent( element, aTimeline, currentLayernum, cf, n, inf ){
	var data = getRigData( element );
	if( data ){
		if( ( data.rig == inf.rig && data.id == inf.parent ) ){
			return true;
		}
		return false;
	}
	return false;
}
function isMyChild( element, aTimeline, currentLayernum, cf, n, inf ){
	var data = getRigData( element );
	if( data ){
		if( ( data.rig == inf.rig && data.parent == inf.id ) ){
			return true;
		}
		return false;
	}
	return false;
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