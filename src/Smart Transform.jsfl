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
	
	var mySelection = doc.selection.slice();
	var parents = [];
	var root = null;
	
	// Part one: Finding the parent(s) of the selected elements.
	if( mySelection.length > 0 ){
		for( var i=0; i<mySelection.length; i++ ){
			var el = mySelection[i];
			if( isElementSymbol( el ) ){
				var inf = getRigData( el );
				if( inf ){ //  The element is part of a rig.
					var parentlist = filterStageElements( isMyParent, inf );
					if( parentlist.length == 1 ){ 
						if( ! isInArray( parents, parentlist[0] ) ){
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
		getMyChildren( root, children );
		children.push( root );
		//fl.trace( "A" );
		setSelectionAndTransformPoint( doc, root, children );
		return;
	}
	else{
		if( mySelection.length == 1 ){
			if( parents.length == 1 ){
				var parent = mySelection[0];
				var children = new Array();
				getMyChildren( parent, children );
				if( children.length > 0 ){
					children.push( parent );
					//fl.trace( "B" );
					setSelectionAndTransformPoint( doc, parent, children );
					return;
				}
				else{
					fl.trace( "Last element" );
					return;
				}
			}
		}
		else{
			if( parents.length == 1 ){
				fl.trace( "First level branches" );
				return;
			}
			else{
				var oneChain = false;
				for( p in parents ){
					if( isInArray( mySelection, parents[p] ) ){
						oneChain = true;
						break;
					}
				}
				if( oneChain ){
					mySelection.sort( sortOnParent );
					var parent = mySelection[ mySelection.length-1 ];
					//fl.trace( "C" );
					doc.setTransformationPoint( { x:parent.matrix.tx, y:parent.matrix.ty } );
					return;
				}
				else{
					fl.trace( "Multiple chains" );
					return;
				}
			}
		}
	}
}
function setSelectionAndTransformPoint( doc, parent, children ){
	doc.selectNone();
	doc.selection = children;
	doc.setTransformationPoint( { x:parent.matrix.tx, y:parent.matrix.ty } );
}

// HELPER FUNCTIONS
function getMyChildren( element, children ){
	var retval = filterStageElements( isMyChild, getRigData( element ) );
	if( retval.length ){
		for( var i=0; i<retval.length; i++ ){
			getMyChildren( retval[i], children );
		}
		for( var j=0; j<retval.length; j++ ){
			children.push( retval[j] );
		}
	}
}
function filterStageElements( afunction ){
	var args = [];
    for( var i=1; i<arguments.length; i++ ){
        args.push( arguments[ i ] );
    }
	var tml = fl.getDocumentDOM().getTimeline();
	var layers = tml.layers;
	var cf = tml.currentFrame;
	var i = 0;
	var retval = [];
	while ( i < layers.length ){
		var layer = layers [i];
		var frames = layer.frames;
		if( frames[ cf ] ){
			var elements = frames[ cf ].elements;
			var n = 0;
			while ( n < elements.length ){
				var el = elements[ n ];
				if( afunction.apply( this, [el].concat( args ) ) == true ){
					if( ! isInArray( retval, el ) ){
						retval.push( el );
					}
				}
				n ++;
			}
		}
		i ++;
	}
	return retval;
}
function isInArray( alist, el ){
	for( var i=0; i<alist.length; i++ ){
		if( alist[i] == el ){
			return true;
		}
	}
	return false;
}
function getRigData( element ){
	if( isElementSymbol( element ) ){
		if( element.hasPersistentData( "rigData" ) ){
			var data = element.getPersistentData( "rigData" );
			if( data != 0 ){
				data = JSON.parse( data );
				return data;
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
		var obj1 = JSON.parse( a.getPersistentData( "rigData" ) );
		var obj2 = JSON.parse( b.getPersistentData( "rigData" ) );
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

// FILTER FUNCTIONS :Boolean
function isMyParent( element, inf ){
	var data = getRigData( element );
	if( data ){
		if( ( data.rig == inf.rig && data.id == inf.parent ) ){
			return true;
		}
		return false;
	}
	return false;
}
function isMyChild( element, inf ){
	var data = getRigData( element );
	if( data ){
		if( ( data.rig == inf.rig && data.parent == inf.id ) ){
			return true;
		}
		return false;
	}
	return false;
}

// DEBUG
function dumpInfo( arr ){
	var i = arr.length;
	while( i-- ){
		fl.trace( arr[i].name );
	}
}