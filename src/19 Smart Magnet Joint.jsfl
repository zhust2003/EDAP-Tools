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
    if( cnt == 1 ){
        if( Edapt.utils.isMagnetTarget( myElements[0] ) ){
            snapToCenterMarker( doc, myTimeline, myElements[0], commandname );
        }else{
            snapToMagnetTarget( doc, myElements, myTimeline, commandname );
        }
    }else{
        snapToMagnetTarget( doc, myElements, myTimeline, commandname );
    }
    doc.selection = originalSelection;
}
function snapToMagnetTarget( doc, myElements, myTimeline, commandname ){
    var cnt = myElements.length;
    myElements.sort( sortOnParent );
    while( cnt -- ){
        var el = myElements[ cnt ];
        var isRig = false;
        var tempFoundElements = [];
        var parents, snaps, theX, theY, pos, dist, closest, i, j, myElement;
        if( Edapt.utils.isElementSymbol( el ) ){
            // For each element in the selection...
            if( el.hasPersistentData( "rigData" ) ){
                isRig = true;
                var inf = Edapt.utils.getData( el, "SMR" );
                parents = Edapt.utils.filterStageElements( getParentMatrix, myTimeline, false, true, [ el ], inf );
                if( parents.length > 0 ){
                    var myParent = parents[0];
                    snaps = getSnapObjects( myParent.element );
                    tempFoundElements = [];
                    for( i=0; i<snaps.length; i++ ){
                        var mInfo = Edapt.utils.getData( snaps[i].element, "MT" );
                        if( mInfo ){
                            if( mInfo.id == inf.snapTo ){
                                var obj  = { element:snaps[i] };
                                theX = snaps[i].matrix.tx * myParent.matrix.a + snaps[i].matrix.ty * myParent.matrix.c + myParent.matrix.tx;
                                theY = snaps[i].matrix.ty * myParent.matrix.d + snaps[i].matrix.tx * myParent.matrix.b + myParent.matrix.ty;
                                pos  = {x:theX, y:theY};
                                obj.position = pos;
                                tempFoundElements.push( obj );
                            }
                        }
                    }
                    snaps = tempFoundElements.slice(0);
                }
            }
            else{
                parents = Edapt.utils.filterStageElements( getTargetMatrix, myTimeline, false, false, [ el ] );
                if( parents.length > 0 ){
                    snaps = [];
                    for( i=0; i<parents.length; i++ ){
                        myElement = parents[i];
                        for( j=0; j<myElement.snaps.length; j++ ){
                            theX = myElement.snaps[j].matrix.tx * myElement.element.matrix.a + myElement.snaps[j].matrix.ty *  myElement.element.matrix.c +  myElement.element.matrix.tx;
                            theY = myElement.snaps[j].matrix.ty * myElement.element.matrix.d + myElement.snaps[j].matrix.tx *  myElement.element.matrix.b +  myElement.element.matrix.ty;
                            pos  = {x:theX, y:theY};
                            dist = fl.Math.pointDistance( pos, {x:el.matrix.tx, y:el.matrix.ty} );
                            snaps.push( { position:pos, distance:dist, parent:myElement.element, element:myElement.snaps[j] } );
                        }
                    }
                    snaps.sort( sortOnDistance );
                }
            }
            if( snaps ){ // Bug fix - 20 Dec, 2012 ( 488-HPW-UNW9 )
                if( snaps.length > 0 ){
                    closest = snaps[0];
                    if( ! isRig ){
                        if( closest.distance <= Edapt.settings.smartMagnetJoint.distanceThreshold ){
                            doc.selectNone();
                            doc.selection = [ el ];
                            doc.moveSelectionBy( { x: closest.position.x - el.matrix.tx, y: closest.position.y - el.matrix.ty } );
                        }else{
                            Edapt.utils.displayMessage(
                                commandname + " : There is no Magnet Targets found within the " + Edapt.settings.smartMagnetJoint.distanceThreshold + " pixel(s) range.", 2 );
                            return;
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
}
function snapToCenterMarker( doc, myTimeline, el, commandname ){
    if( Edapt.utils.isMagnetTarget( el ) ){	// Feature request WH3-8BX-H9ZA ( 25 September, 2013 )
        /*
         This mod only works with single selection.
         Go out one level up, search all sites in the upper TIMELINE
         and prepare a collection of all found CM-objects.
         */
        var mustReturn = false;
        var tempFoundElements = [];
        var myContainerMatrix, closest, dist, i, j, myElement;
        if ( ! isRoot( doc, myTimeline ) ){
            doc.exitEditMode();
            myContainerMatrix = doc.selection[0].matrix ;
            mustReturn = true;
        }else{
            myContainerMatrix = doc.viewMatrix;
        }
        var centers = Edapt.utils.filterStageElements( getCenterMarkers, doc.getTimeline(), false, false, [ doc.selection[0] ] );
        if( mustReturn ){ doc.enterEditMode( "inPlace" ); }
        if( centers.length > 0 ){
            /*
             Before calculating and comparing distances, I must translate the coordinates of the selected object
             to those on found CM-object. For this purpose, I multiply the matrix of the selected object by
             the matrix of its container. Next, I multiply the matrix of each CM-object by the matrix of its own container.
             Then I sort by the resulting distances.
             */
            var mypos = {	"x":el.matrix.tx * myContainerMatrix.a + el.matrix.ty * myContainerMatrix.c + myContainerMatrix.tx,
                "y":el.matrix.ty * myContainerMatrix.d + el.matrix.tx * myContainerMatrix.b + myContainerMatrix.ty
            };
            for( i=0; i<centers.length; i++ ){
                var container = centers[ i ];
                for( j=0; j<container.length; j++ ){
                    myElement = container[ j ];
                    var cpos =  {	"x":myElement.matrix.tx * myElement.parentMatrix.a + myElement.matrix.ty * myElement.parentMatrix.c + myElement.parentMatrix.tx,
                        "y":myElement.matrix.ty * myElement.parentMatrix.d + myElement.matrix.tx * myElement.parentMatrix.b + myElement.parentMatrix.ty
                    };
                    dist = fl.Math.pointDistance( mypos, cpos );
                    tempFoundElements.push( { "position":cpos, "distance":dist, "parentMatrix":myElement.parentMatrix, "element":myElement.element } );
                }
            }
            centers = tempFoundElements.slice( 0 );
            centers.sort( sortOnDistance );
            if( centers ){
                if( centers.length > 0 ){
                    closest = centers[ 0 ];
                    if( closest.distance <= Edapt.settings.smartMagnetJoint.distanceThreshold ){
                        doc.selectNone();
                        doc.selection = [ el ];
                        var calculatedMatrix = fl.Math.concatMatrix(
                            { "a": 1, "b": 0, "c": 0, "d": 1, "tx":closest.position.x, "ty":closest.position.y },
                            fl.Math.invertMatrix( myContainerMatrix )
                        );
                        var diff = { "x":calculatedMatrix.tx - el.matrix.tx, "y":calculatedMatrix.ty - el.matrix.ty };
                        doc.moveSelectionBy( diff );
                    }else{
                        Edapt.utils.displayMessage(
                            commandname + " : There are no Center Markers found within the " + Edapt.settings.smartMagnetJoint.distanceThreshold + " pixel(s) range.", 2 );
                    }
                }else{
                    Edapt.utils.displayMessage(
                        commandname + " : There is no Center Marker found.", 2 );
                }
            }
        }
    }
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
        return Edapt.utils.filterStageElements( isSnapObject, element.libraryItem.timeline, false, false, [] );
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
function isRoot( doc, timeline ){
    return Boolean( doc.timelines[0] == timeline );
}
function getCenterMarkers( element, aTimeline, currentLayernum, cf, n ){
    if( Edapt.utils.isElementSymbol( element ) ){
        return Edapt.utils.filterStageElements( isCenterMarker, element.libraryItem.timeline, false, false, [element], element.matrix );
    }
    return [];
}
function isCenterMarker( element, aTimeline, currentLayernum, cf, n, pmatrix ){
    if( Edapt.utils.isCenterMarker( element ) ){
        return { element:element, matrix:element.matrix, parentMatrix:pmatrix };
    }else{
        return null;
    }
}