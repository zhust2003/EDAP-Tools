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
  
 version: 2.5.0
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
    myElements.sort( __sortOnParent );
    if( fl.tools.shiftIsDown ){
        __selectInverted( commandname, doc, myTimeline, myElements ); // Alternative - Shift + 1
    }
    else{
        __selectStraight( commandname, doc, myTimeline, myElements ); // Default - 1
    }
}

// HELPER METHODS
function __selectStraight( commandname, doc, myTimeline, myElements ){
    if( myElements.length == 1 ){
        var el = myElements[ 0 ];
        if( Edapt.utils.isElementSymbol( el ) ){
            var inf = Edapt.utils.getData( el, "SMR" );
            if( inf ){
                var children;
                if( inf.parent == "" ){
                    children = [el];
                    __getMyChildren( el, children, myTimeline );
                    __setSelectionAndTransformPoint( doc, myTimeline, el, children, true, false );
                }
                else{
                    children = [el];
                    __getMyChildren( el, children, myTimeline );
                    if( children.length > 1 ){
                        __setSelectionAndTransformPoint( doc, myTimeline, el, children, true, false );
                    }
                }
            }
        }

    }
    else if( myElements.length > 1 ){
        var result = __checkChain( myElements, myTimeline );
        switch( result ){
            case 1: //"two consequtive"
                __setSelectionAndTransformPoint( doc, myTimeline, myElements[ myElements.length-1 ], null, false, false );
                break;
            case 2: //"chain - broken or not"
                __setSelectionAndTransformPoint( doc, myTimeline, myElements[ myElements.length-1 ], null, false, false );
                break;
            case 3: //"multiple chains"
                Edapt.utils.displayMessage( commandname + ": " + "Multiple chains are selected.", 2 );
                break;
            default:
        }

    }
    else{
        Edapt.utils.displayMessage( commandname + ": " + "Please, select a Symbol which is already a part of a Smart Magnet Rig!", 2 );
    }
}
function __checkChain( elements,atimeline ){
    var first = elements[0];
    var last = elements[ elements.length-1 ];
    var inf1 = Edapt.utils.getData( first, "SMR" );
    var inf2 = Edapt.utils.getData( last, "SMR" );
    if( inf1.parent == inf2.id ){
        return 1;
    }
    else{
        var parent = Edapt.utils.filterStageElements( __getParent, atimeline, false, true, [], inf1 )[0];
        while( parent ){
            var rig = Edapt.utils.getData( parent, "SMR" );
            if( rig ){
                parent = Edapt.utils.filterStageElements( __getParent, atimeline, false, true, [], rig )[0];
                if( parent ){
                    if( parent == last ){
                        return 2;
                    }
                }
            }
        }
        return 3;
    }
}
function __getParent( element, aTimeline, currentLayernum, cf, n, inf ){
    var data = Edapt.utils.getData( element, "SMR" );
    if( data ){
        if( ( data.rig == inf.rig && data.id == inf.parent ) ){
            return element;
        }
        return null;
    }
    return null;
}
function __setSelectionAndTransformPoint( doc, atimeline, parent, children, changeSelection, inverted ){
    //Decide to process the parent or not.
    var startval = ( inverted ) ? 0 : 1;

    if( changeSelection ){
        var map = [];
        var cf = atimeline.currentFrame;
        for( var i = startval; i < children.length; i++ ){ // The parent is at position 0
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
        for( var j=0; j<map.length; j++ ){
            var item = map[j];
            newSel.push( atimeline.layers[item[0]].frames[cf].elements[item[1]] );
        }
        doc.selectNone();
        doc.selection = newSel;
        doc.scaleSelection( 1, 1 );	// Bug fix - forces the Flash to show/redraw the transformation handles.
    }
    doc.setTransformationPoint( { x:parent.matrix.tx, y:parent.matrix.ty } );
}
function __getMyChildren( element, children, tml ){
    var retval = Edapt.utils.filterStageElements( __isMyChild, tml, true, false, [ element ], Edapt.utils.getData( element, "SMR" ) ); // No keys created
    if( retval.length ){
        for( var i=0; i<retval.length; i++ ){
            __getMyChildren( retval[i], children, tml );
        }
        for( var j=0; j<retval.length; j++ ){
            children.push( retval[j] );
        }
    }
}
function __isMyChild( element, aTimeline, currentLayernum, cf, n, inf ){
    var data = Edapt.utils.getData( element, "SMR" );
    if( data ){
        return ( data.rig == inf.rig && data.parent == inf.id );
    }
    return false;
}
function __sortOnParent( a, b ){
    // Sorts stage elements on its "parent" id.
    if( a.hasPersistentData( "rigData" ) && b.hasPersistentData( "rigData" ) ){
        var obj1 = Edapt.utils.getData( a, "SMR" );
        var obj2 = Edapt.utils.getData( b, "SMR" );
        return ( __convertID( obj2.parent ) - __convertID( obj1.parent ) );
    }
    return -1;
}
function __convertID( id ){
    /*
     -1 = empty strings
     0  = non-empty strings
     >0 = strings that can be parsed to numbers
     */
    if( id.length == 0 ){ return -1; }
    var retval = Number( id );
    return isNaN( retval ) ? 0 : retval;
}

function __selectInverted( commandname, doc, myTimeline, myElements ){
    if( myElements.length == 1 ){
        var element = myElements[ 0 ];
        if( Edapt.utils.isElementSymbol( element ) ){
            var inf = Edapt.utils.getData( element, "SMR" );
            if( inf ){
                var children = [ element ];
                while( element ){
                    var temp = element;
                    element = __parent( myTimeline, element );
                    children.push( element );
                    if( __filter( element ) ){
                        children.pop();
                        break;
                    }
                    else if( ! __parent( myTimeline, element ) ){
                        element = __parent( myTimeline, temp );
                        break;
                    }
                }
                if( children.length > 1 ){
                    element = children.pop();
                    if( element ){
                        children.splice( 0, 0, element );
                        __setSelectionAndTransformPoint( doc, myTimeline, element, children, true, true );
                    }
                }
            }
        }
    }
    else if( myElements.length > 1 ){
        var result = __checkChain( myElements, myTimeline );
        switch( result ){
            case 1: //"two consequtive"
                __setSelectionAndTransformPoint( doc, myTimeline, myElements[ myElements.length-1 ], null, false, true );
                break;
            case 2: //"chain - broken or not"
                __setSelectionAndTransformPoint( doc, myTimeline, myElements[ myElements.length-1 ], null, false, true );
                break;
            case 3: //"multiple chains"
                Edapt.utils.displayMessage( commandname + ": " + "Multiple chains are selected.", 2 );
                break;
            default:
        }
    }
    else{
        Edapt.utils.displayMessage( commandname + ": " + "Please, select a Symbol which is already a part of a Smart Magnet Rig!", 2 );
    }
}
function __parent( atimeline, element ){
    if( ! element ){ return null; }
    var inf = Edapt.utils.getData( element, "SMR" );
    return Edapt.utils.filterStageElements( __getParent, atimeline, false, true, [], inf )[0];
}
function __filter( element ){
    return Boolean( __getSnapObjects( element ).length > 1 );
}
function __isSnapObject( element, aTimeline, currentLayernum, cf, n ){
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
function __getSnapObjects( element ){
    if( Edapt.utils.isElementSymbol( element ) ){
        return Edapt.utils.filterStageElements( __isSnapObject, element.libraryItem.timeline, false, false, [] );
    }
    return [];
}