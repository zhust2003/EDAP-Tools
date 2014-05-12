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
    runScript( "Convert To Keyframes Advanced" );
}catch( error ){
    fl.trace( error );
}
function runScript( commandname ){
    var doc = fl.getDocumentDOM();
    if( doc == null ){
        fl.trace( "No document open." );
        return;
    }
    var myTimeline = doc.getTimeline();
    var recursive = Edapt.settings.ConvertToKeyframes.recursive;
    var restore = Edapt.settings.ConvertToKeyframes.restore;
	//var preserveEasing = Edapt.settings.preserveEasing;
    var mode = 1;
    if( fl.tools.altIsDown ){ mode = 2; }
    switch( mode ){
        case 1: // Smart( extended flash standard )
            standard( doc, myTimeline, recursive, restore, commandname );
            break;
        case 2: // Extreme
            extreme( doc, myTimeline, recursive, restore, commandname );
            break;
        default:
            standard( doc, myTimeline, recursive, restore, commandname );
    }
}
function standard( doc, atimeline, recursive, restore, commandname ){
    var cl = atimeline.currentLayer;
    var selFrames = atimeline.getSelectedFrames();
    var containsFolder = __isFolderSelected( atimeline, selFrames );

    /*  There is a bug in Flash CC - loses element's persistent data at new keyframe.
     So, before creating the new keyframe, we create a list with element's persistent data,
     and set the data back to elements in the newly created keyframe.
     */
    
	var elementsDataMap = null;
    if( ! containsFolder ){
        elementsDataMap = ( Edapt.utils.getFlashVersion() >= 13 ) ? buildElementsInfoMap( atimeline, selFrames ) : null; // CC bug
		Edapt.TweenSplitter.convertToKeyframes( atimeline );
		
        if( elementsDataMap ){ setElementsInfoFromMap( atimeline, selFrames, elementsDataMap ); } // CC bug
        atimeline.setSelectedFrames( selFrames, true );// Force Flash to select the symbols on the Stage
		
    }else{
        var scheme = __prepareStandard( atimeline, selFrames, recursive );
        if( scheme.length > 0 ){
            atimeline.setSelectedFrames( scheme, true );
            elementsDataMap = ( Edapt.utils.getFlashVersion() >= 13 ) ? buildElementsInfoMap( atimeline, scheme ) : null; // CC bug
			Edapt.TweenSplitter.convertToKeyframes( atimeline );
            if( elementsDataMap ){ setElementsInfoFromMap( atimeline, scheme, elementsDataMap ); } // CC bug
            atimeline.setSelectedFrames( scheme, true );// Force Flash to select the symbols on the Stage
        }
    }
    if( restore ){
        atimeline.currentLayer = cl;
    }
}
function extreme( doc, atimeline, recursive, restore, commandname ){
    var cl = atimeline.currentLayer;
    var selFrames = atimeline.getSelectedFrames(); // Get all selected frames in the timeline
    var scheme = __prepareExtreme( atimeline, selFrames, recursive );
    /*  There is a bug in Flash CC - loses element's persistent data at new keyframe.
     So, before creating the new keyframe, we create a list with element's persistent data,
     and set the data back to elements in the newly created keyframe.
     */
    var elementsDataMap;
    atimeline.setSelectedFrames( scheme, true );
    elementsDataMap = ( Edapt.utils.getFlashVersion() >= 13 ) ? buildElementsInfoMap( atimeline, scheme ) : null; // CC bug
	Edapt.TweenSplitter.convertToKeyframes( atimeline );
    if( elementsDataMap ){ setElementsInfoFromMap( atimeline, scheme, elementsDataMap ); } // CC bug
	if( restore ){
		atimeline.setSelectedFrames( selFrames, true );
		atimeline.currentLayer = cl;
	}
}

// HELPER METHODS
function __prepareExtreme( atimeline, selFrames, recursive ){
    var retval = [];
    var cln = atimeline.currentLayer;
    var ranges = __getLayerSelection( selFrames, cln );
    var i, j;
    if( ranges.length ){
        var folder = __getParentFolderFromSelection( atimeline, ranges );
        if( folder ){
            for( i=0; i<atimeline.layers.length; i++ ){
                var alayer = atimeline.layers[i];
                if( alayer.layerType != "folder" ){
                    var flag = ( recursive ) ? __recursiveFilter( alayer, folder ) : __singleFilter( alayer, folder );
                    if( flag ){
                        for( j=0; j<ranges.length; j++ ){
                            retval.push( i );
                            retval.push( ranges[j].start );
                            retval.push( ranges[j].end );
                        }
                    }
                }
            }
        }else{
            for( i=0; i<atimeline.layers.length; i++ ){
                for( j=0; j<ranges.length; j++ ){
                    retval.push( i );
                    retval.push( ranges[j].start );
                    retval.push( ranges[j].end );
                }
            }
        }
    }else{
        var cf = atimeline.currentFrame;
        for( i=0; i<atimeline.layers.length; i++ ){
            retval.push( i );
            retval.push( cf );
            retval.push( cf+1 );
        }
    }
    return retval;
}
function __prepareStandard( atimeline, selFrames, recursive ){
    var retval = [];
    var folder = __getSelectedFolderFromSelection( atimeline, selFrames );
    var ranges = __getLayerSelection( selFrames, Edapt.utils.indexOf( atimeline.layers, folder ) );
    for( var i=0; i<atimeline.layers.length; i++ ){
        var alayer = atimeline.layers[i];
        if( alayer.layerType != "folder" ){
            var flag = ( recursive ) ? __recursiveFilter( alayer, folder ) : __singleFilter( alayer, folder );
            if( flag ){
                for( var j=0; j<ranges.length; j++ ){
                    retval.push( i );
                    retval.push( ranges[j].start );
                    retval.push( ranges[j].end );
                }
            }
        }
    }
    return retval;
}
function __singleFilter( alayer, folder ){
    return Boolean( alayer.parentLayer == folder );
}
function __recursiveFilter( alayer, folder ){
    var p = alayer;
    while( p.parentLayer ){
        p = p.parentLayer;
        if( p == folder ){
            break;
        }
    }
    return Boolean( p == folder );
}
function __getParentFolderFromSelection( atimeline, ranges ){
    if( ranges.length == 0 ){ return null; }
    var ln = ranges[0].layer;
    return atimeline.layers[ ln ].parentLayer;
}
function __isFolderSelected( atimeline, selFrames ){
    return Boolean( __getSelectedFolderFromSelection( atimeline, selFrames ) != null );
}
function __getSelectedFolderFromSelection( atimeline, selFrames ){
    var retval = null;
    for( var l=0; l<selFrames.length; l+=3 ){
        if( atimeline.layers[selFrames[l]].layerType == "folder" ){
            retval = atimeline.layers[selFrames[l]];
            break;
        }
    }
    return retval;
}
function __getLayerSelection( selFrames, layernum ){
    var retval = [];
    for ( var n=0; n<selFrames.length; n += 3 ){
        var ln = selFrames[ n ];
        if( ln == layernum ){
            var sel = {};
            sel.layer = layernum;
            sel.start = selFrames[ n + 1 ];
            sel.end = selFrames[ n + 2 ];
            retval.push( sel );
        }
    }
    return retval;
}

// Flash CC bug fix
function buildElementsInfoMap( myTimeline, selFrames ){
	var retval = {};
	for( var l=0; l < selFrames.length; l += 3 ){ // For each layer in the selection...
		var ln = selFrames[ l ];
		var layer = myTimeline.layers[ ln ];
		if( layer.layerType != "folder" ){
			var cf = selFrames[ l+1 ];
			retval[ln] = buildLayerElementsInfoMap( myTimeline, layer, cf );
		}
	}
	return retval;
}
function setElementsInfoFromMap( myTimeline, selFrames, amap ){
	for( var l=0; l < selFrames.length; l += 3 ){
		var ln = selFrames[ l ];
		var layer = myTimeline.layers[ ln ];
		if( layer.layerType != "folder" ){
			var startFrame = selFrames[ l+1 ];
			var endFrame = selFrames[ l+2 ];
			for( var j = startFrame; j<endFrame; j++ ){
				var theFrame = layer.frames[ j ];
				for( var i = 0; i < theFrame.elements.length; i++ ){
					theFrame.elements[ i ].setPersistentData( "rigData", "string", amap[ln][i].rigData );
					theFrame.elements[ i ].setPersistentData( "SGC", "string", amap[ln][i].SGC );
				}
			}
		}
	}
}
function buildLayerElementsInfoMap( tl, alayer, cf ){
	var original = cf;
	var reverseCheck = true;
	if( cf > alayer.frames.length-1 ){ 
		cf = alayer.frames.length-1;
		if( cf == alayer.frames[ cf ].startFrame ){
			return getElementsInfo( alayer.frames[ cf ] ) ;
		}
		reverseCheck = false;
	}
	var checkprev = true;
	while( checkprev ){
		cf = Edapt.utils.getLayerPrevKey( alayer, cf );
		checkprev = Boolean( ( alayer.frames[ cf ].elements.length == 0) && ( cf > 0 ) );
	}
	if( alayer.frames[ cf ].elements.length == 0 && reverseCheck ){
		cf = original;
		var checknext = true;
		while( checknext ){
			cf = Edapt.utils.getLayerNextKey( alayer, cf );
			checknext = Boolean( ( alayer.frames[ cf ].elements.length == 0) && ( cf < alayer.frames.length-1 ) );
		}
	}
	if( alayer.frames[ cf ].elements.length > 0 ){
		return getElementsInfo( alayer.frames[ cf ] ) ;
	}else{
		return [];
	}	
}
function getElementsInfo( aframe ){
    var retval = [];
    var datanames = Edapt.settings.metadataNames;
    for( var i=0; i<aframe.elements.length; i++ ){
        var objectData = {};
        for( var prop in datanames ){
            if( datanames.hasOwnProperty(prop) ){
                var val = datanames[ prop ];
                if( aframe.elements[i].hasPersistentData( val ) ){
                    objectData[ val ] = aframe.elements[i].getPersistentData( val );
                }
            }
        }
        retval.push( objectData );
    }
    return retval;
}