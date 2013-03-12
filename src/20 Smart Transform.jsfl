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
	var myElements = doc.selection.slice();
	var myTimeline = doc.getTimeline();

	// Remove non-rig elements.
	var i = myElements.length;
	while( i-- ){
		if( ! Edapt.utils.getData( myElements[i], "SMR" ) ){
			myElements.splice( i, 1 );
		}
	}
	myElements.sort( sortOnParent );

	if( myElements.length == 1 ){
		var el = myElements[ 0 ];
		if( Edapt.utils.isElementSymbol( el ) ){
			var inf = Edapt.utils.getData( el, "SMR" );
			if( inf ){
				if( inf.parent == "" ){ 
					var children = [el];
					getMyChildren( el, children, myTimeline );
					setSelectionAndTransformPoint( doc, myTimeline, el, children, true );
				}
				else{
					var children = [el];
					getMyChildren( el, children, myTimeline );
					if( children.length > 1 ){
						setSelectionAndTransformPoint( doc, myTimeline, el, children, true );
					}
				}
			}
		}
		
	}
	else if( myElements.length > 1 ){
		var result = checkChain( myElements, myTimeline );
		switch( result ){
			case 1: //"two consequtive"
				setSelectionAndTransformPoint( doc, myTimeline, myElements[ myElements.length-1 ], null, false );
				break;
			case 2: //"chain - broken or not"
				setSelectionAndTransformPoint( doc, myTimeline, myElements[ myElements.length-1 ], null, false );
				break;
			case 3: //"multiple chains"
				Edapt.utils.displayMessage( commandname + ": " + "Multiple chains are selected.", 2 );
				break;
			default:
		}

	}
	else{
		Edapt.utils.displayMessage( commandname + ": " + "Please, select symbol(s) on the stage.", 1 );
		return;
	}
}
function checkChain( elements,atimeline ){
	var first = elements[0];
	var last = elements[ elements.length-1 ]
	inf1 = Edapt.utils.getData( first, "SMR" );
	inf2 = Edapt.utils.getData( last, "SMR" );
	if( inf1.parent == inf2.id ){
		return 1;
	}
	else{
		var parents = [];
		var parent = Edapt.utils.filterStageElements( getParent, atimeline, false, true, [], inf1 )[0];
		while( parent ){
			var rig = Edapt.utils.getData( parent, "SMR" );
			if( rig ){
				parent = Edapt.utils.filterStageElements( getParent, atimeline, false, true, [], rig )[0];
				if( parent ){
					if( parent == last ){
						return 2;
					}
				}
			}
		}
		return 3;
	}
	return 3;
}
function getParent( element, aTimeline, currentLayernum, cf, n, inf ){
	var data = Edapt.utils.getData( element, "SMR" );
	if( data ){
		if( ( data.rig == inf.rig && data.id == inf.parent ) ){
			return element;
		}
		return null;
	}
	return null;
}
function setSelectionAndTransformPoint( doc, atimeline, parent, children, changeSelection ){
	if( changeSelection ){
		var map = [];
		var cf = atimeline.currentFrame;
		for( var i=1; i<children.length; i++ ){ // The parent is at position 0
			var el = children[i];
			var ln = Edapt.utils.indexOf( atimeline.layers, el.layer );
			var en = Edapt.utils.indexOf( atimeline.layers[ln].frames[cf].elements, el );
			map.push( [ ln, en ] );
			if( atimeline.layers[ln].frames[cf].startFrame != cf ){
				atimeline.currentLayer = ln;
				atimeline.convertToKeyframes( cf );
			}
		}
		var newSel = [parent];
		for( j=0; j<map.length; j++ ){
			var item = map[j];
			newSel.push( atimeline.layers[item[0]].frames[cf].elements[item[1]] );
		}
		doc.selectNone();
		doc.selection = newSel;
		doc.scaleSelection( 1, 1 );	// Bug fix - forces the Flash to show/redraw the transformation handles.
	}
	doc.setTransformationPoint( { x:parent.matrix.tx, y:parent.matrix.ty } );
}
function getMyChildren( element, children, tml ){
	var retval = Edapt.utils.filterStageElements( isMyChild, tml, true, false, [ element ], Edapt.utils.getData( element, "SMR" ) ); // No keys created
	if( retval.length ){
		for( var i=0; i<retval.length; i++ ){
			getMyChildren( retval[i], children, tml );
		}
		for( var j=0; j<retval.length; j++ ){
			children.push( retval[j] );
		}
	}
}
function isMyChild( element, aTimeline, currentLayernum, cf, n, inf ){
	var data = Edapt.utils.getData( element, "SMR" );
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