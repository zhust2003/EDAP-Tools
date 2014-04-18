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
	var preserveEasing = Edapt.settings.preserveEasing;
    var mode = 1;
    if( fl.tools.altIsDown ){ mode = 2; }
    switch( mode ){
        case 1: // Smart( extended flash standard )
            standard( doc, myTimeline, recursive, restore, preserveEasing, commandname );
            break;
        case 2: // Extreme
            extreme( doc, myTimeline, recursive, restore, preserveEasing, commandname );
            break;
        default:
            standard( doc, myTimeline, recursive, restore, preserveEasing, commandname );
    }
}
function standard( doc, atimeline, recursive, restore, preserveEasing, commandname ){
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
		if( ! preserveEasing ){
			atimeline.convertToKeyframes();
		}else{
			convertToKeyframes( atimeline );
		}
        if( elementsDataMap ){ setElementsInfoFromMap( atimeline, selFrames, elementsDataMap ); } // CC bug
        atimeline.setSelectedFrames( selFrames, true );// Force Flash to select the symbols on the Stage
		
    }else{
        var scheme = __prepareStandard( atimeline, selFrames, recursive );
        if( scheme.length > 0 ){
            atimeline.setSelectedFrames( scheme, true );
            elementsDataMap = ( Edapt.utils.getFlashVersion() >= 13 ) ? buildElementsInfoMap( atimeline, scheme ) : null; // CC bug
			if( ! preserveEasing ){
				atimeline.convertToKeyframes();
			}else{
				convertToKeyframes( atimeline );
			}
            if( elementsDataMap ){ setElementsInfoFromMap( atimeline, scheme, elementsDataMap ); } // CC bug
            atimeline.setSelectedFrames( scheme, true );// Force Flash to select the symbols on the Stage
        }
    }
    if( restore ){
        atimeline.currentLayer = cl;
    }
}
function extreme( doc, atimeline, recursive, restore, preserveEasing, commandname ){
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
	if( ! preserveEasing ){
		atimeline.convertToKeyframes();
	}else{
		convertToKeyframes( atimeline );
	}
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
                    var objectData = amap[ln][i];
                    for( var prop in objectData ){
                        if( objectData.hasOwnProperty(prop) ){
                            theFrame.elements[ i ].setPersistentData( prop, "string", objectData[ prop ] );
                        }
                    }
                }
            }
        }
    }
}
function buildLayerElementsInfoMap( tl, alayer, cf ){
    var original = cf;
    var reverseCheck = true;
	var xFrame;
    if( cf > alayer.frames.length-1 ){
        cf = alayer.frames.length-1;
        if( cf == alayer.frames[ cf ].startFrame ){
            return getElementsInfo( alayer.frames[ cf ] ) ;
        }
        reverseCheck = false;
    }
    var checkprev = true;
    while( checkprev ){
        cf = getLayerPrevKey( alayer, cf );
        checkprev = Boolean( ( alayer.frames[ cf ].elements.length == 0) && ( cf > 0 ) );
    }
    if( alayer.frames[ cf ].elements.length == 0 && reverseCheck ){
        cf = original;
        var checknext = true;
        while( checknext ){
            cf = getLayerNextKey( alayer, cf );
			xFrame = alayer.frames[ cf ];
			if( xFrame ){
				checknext = Boolean( ( xFrame.elements.length == 0) && ( cf < alayer.frames.length-1 ) );
			}else{
				checknext = Boolean( ( cf < alayer.frames.length-1 ) );
			}
        }
    }
	if( xFrame ){
		if( xFrame.elements.length > 0 ){
			return getElementsInfo( xFrame ) ;
		}else{
			return [];
		}
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


// EASING
function convertToKeyframes( atimeline ){
	var selFrames = atimeline.getSelectedFrames();
	var selModified = modifyFrameSelection( atimeline, selFrames );
	var keyIndices = {};
	for( var i=0; i < selFrames.length; i+=3 ){
		var li = selFrames[i];
		var st = selFrames[i+1];
		var en = selFrames[i+2];
		var myLayer = atimeline.layers[ li ];

		if( ! keyIndices.hasOwnProperty( li ) ){
			keyIndices[ li ] = [];
		}
		for( var j = st; j < en; j++ ){
			if( j < myLayer.frames.length ){
				var pk, prevKey, ease;
				var xCurve = { prevFrame:{}, currentFrame:{} };
				var nk = getLayerNextKey( myLayer, j );
				if ( keyIndices[ li ].length < 1 ){
					pk = getLayerPrevKey( myLayer, j );
					ease = getEaseFromFrame( myLayer.frames[ pk ] );
				}else{
					var tmp = getLayerPrevKey( myLayer, j );
					if( tmp >= keyIndices[ li ][ keyIndices[ li ].length - 1 ].end ){
						pk = tmp;
						ease = getEaseFromFrame( myLayer.frames[ pk ] );
					}else{
						pk = keyIndices[ li ][ keyIndices[ li ].length - 1 ].end;
						ease = keyIndices[ li ][ keyIndices[ li ].length - 1 ].curve.currentFrame;
					}
				}
				prevKey = myLayer.frames[ pk ];
				if( prevKey ){
					var totalDuration = nk - pk;
					var ratio = ( j - pk ) / totalDuration;
					for( var p in ease ){
						var originalSpline = new BezierSpline( ease[ p ] );
						var splitted = originalSpline.split( ratio );
						if( splitted ){
							xCurve.prevFrame[ p ] = getNormalized( splitted[0].getCurve() );
							xCurve.currentFrame[ p ] = getNormalized( splitted[1].getCurve() );
						}	
					}
					keyIndices[ li ].push( { start:pk, end:j, ratio:ratio, curve:xCurve, isKey:Boolean( j === myLayer.frames[j].startFrame ) } );
				}
			}
		}
	}
	var cnt = 0;
	for( var p in selModified ){
		var layerInfo = selModified[ p ];
		atimeline.setSelectedFrames( layerInfo.newsel, Boolean( cnt === 0 ) );			// block select
		cnt ++;
	}
	atimeline.convertToKeyframes();

	var needToClear = false;
	for( var p in selModified ){
		var layerInfo = selModified[ p ];
		if( ! isArraysEqual( layerInfo.sel, layerInfo.newsel ) ){
			fl.trace( "not Equal" );
			atimeline.setSelectedFrames( layerInfo.sel, false );		// exclude original selection
			needToClear = true;
			for( var j = 0; j < layerInfo.keys.length; j+=3 ){
				var keyDef = [ layerInfo.keys[j], layerInfo.keys[j+1], layerInfo.keys[j+2] ];
				var exclude = true;
					for( jj = 0; jj < layerInfo.sel.length; jj+=3 ){
						var selDef = [ layerInfo.sel[jj], layerInfo.sel[jj+1], layerInfo.sel[jj+2] ];
						if( isArraysEqual( keyDef, selDef ) ){
							exclude = false;
							break;
						}
					}
 				if( exclude ){
					fl.trace( keyDef );
					atimeline.setSelectedFrames( keyDef, false );		// exclude pre-existing keys, not included in the original selection
				}
			}
		 }
		
	}
	if( needToClear ) atimeline.clearKeyframes();
	
   	for( var l in keyIndices ){
		var myLayer = atimeline.layers[ l ];
		var layerInfo = keyIndices[ l ];
		for( var j = 0; j < layerInfo.length; j++ ){
			var myKey = layerInfo[ j ];
			if( ! myKey.isKey ){
				var prevFrame = myLayer.frames[ myKey.start ];
				var thisFrame = myLayer.frames[ myKey.end ];
				thisFrame.hasCustomEase = true;
				prevFrame.hasCustomEase = true;
				thisFrame.useSingleEaseCurve = prevFrame.useSingleEaseCurve;
				var prevInfo = myKey.curve.prevFrame;
				var currInfo = myKey.curve.currentFrame;
				for( var p in prevInfo ){
					thisFrame.setCustomEase( p, myKey.curve.currentFrame[ p ] );
					prevFrame.setCustomEase( p, myKey.curve.prevFrame[ p ] );
				}
			}
		}
	}
}
function modifyFrameSelection( atimeline, selFrames ){
	var map = {};
	var retval = {};
	for( var i=0; i < selFrames.length; i+=3 ){
		var li = selFrames[ i ];
		var st = selFrames[ i+1 ];
		var en = selFrames[ i+2 ];
		var myLayer = atimeline.layers[ li ];
		if( ! retval.hasOwnProperty( li ) ){
			retval[ li ] = { sel:[], newsel:[li, Number.MAX_VALUE, - Number.MAX_VALUE ], keys:[] };
		}
		retval[ li ].newsel[1] = Math.min( retval[ li ].newsel[1], st );
		retval[ li ].newsel[2] = Math.max( retval[ li ].newsel[2], en );
		retval[ li ].sel.push( li, st, en );
	}
	for( var p in retval ){
		var li = parseInt( p );
		var st = retval[ p ].newsel[1];
		var en = retval[ p ].newsel[2];
		var myLayer = atimeline.layers[ li ];
		for( var j = st; j < en; j++ ){
			var myFrame = myLayer.frames[ j ];
			if( myFrame ){
				if( j === myFrame.startFrame ){
					retval[ p ].keys.push( li, j, j+1 );
				}
			}
		}
	}	
	return retval;
}
function getEaseFromFrame( aframe ){
	var props = ( aframe.hasCustomEase ) ? ( aframe.useSingleEaseCurve ) ? [ "all" ] : [ "position", "rotation", "scale", "color", "filters" ] : [ "all" ];
	var retval = {};
	for( var i = 0; i < props.length; i++ ){
		var xprop = props[ i ];
		var ease = aframe.getCustomEase( xprop );
		if( ease.length === 0 ){
			ease = [	{"x":0,"y":0}, {"x":0.3333333333333333,"y":0.3333333333333333}, {"x":0.6666666666666666,"y":0.6666666666666666}, {"x":1,"y":1}	];
		}
		retval[ xprop ] = ease;
	}
	return retval;
}
function getLayerPrevKey( alayer, sf ){
	if( ! alayer ) return null;
    var fi = ( ( sf - 1 ) < 0 ) ? 0 : sf - 1;
    return alayer.frames[ fi ].startFrame;
}
function getLayerNextKey( alayer, sf ){
	if( ! alayer ) return null;
    var fr = alayer.frames[ sf ];
    return fr.startFrame + fr.duration;
}
function BezierSpline( apoints ){
	this.segments = [];
	this.init						= function( apoints ){
		var cnt = ( apoints ) ? apoints.length - 1 : -1;
		if( apoints ){
			for( var i = 0; i < cnt; i += 3 ){
				var seg = new Bezier( [ apoints[i], apoints[i+1], apoints[i+2], apoints[i+3] ] );
				this.segments.push( seg );
				seg.id = this.segments.length;
			}
		}

	};
	this.getSegment					= function( t ){
		var segment = Math.max( 1, Math.ceil( this.segments.length * t ) );
		return this.segments[ segment ];
	};
	this.solvePositionFromXValue	= function( xVal ){
		for( var i = 0; i < this.segments.length; i ++ ){
			var xCurve = this.segments[ i ];
			var xValue = xCurve.solvePositionFromXValue( xVal );
			if( xValue ){
				return { segment:i, position:xValue };
			}
		}
		return { segment:-1, position:-1 };
	};
	this.split						= function( t ){
		var spoint = this.solvePositionFromXValue( t );
		if( spoint.segment > -1 && spoint.position > -1 ){
			var splitted = this.segments[ spoint.segment ].split( spoint.position );
			var seg = spoint.segment;
			var pos = spoint.position;
			var a = new BezierSpline();
			var b = new BezierSpline();
			for( i = 0; i < seg; i++ ){
				a.segments.push( this.segments[ i ] );
			}
			a.segments.push( splitted[0] );
			b.segments.push( splitted[1] );
			seg ++;
			for( i = seg; i < this.segments.length; i++ ){
				b.segments.push( this.segments[ i ] );
			}
			return [ a, b ];
		}
		return null
	};
	this.getCurve					= function(){
		var retval = [];
		for( var i = 0; i < this.segments.length; i++ ){
			var segment = this.segments[ i ];
			var xpoints = segment.getCurve();
			var start = ( i === 0 ) ? 0 : 1;
			for( var j = start; j < xpoints.length; j ++ ){
				retval.push( xpoints[ j ] );
			}
		}
		return retval;
	};
	this.init( apoints );
}
function Bezier( apoints ) {
	this.id = -1;
	this.x0 = apoints[0].x; // X coordinate of the first point.
	this.y0 = apoints[0].y; // Y coordinate of the first point.
	this.x1 = apoints[1].x; // X coordinate of the first control point.
	this.y1 = apoints[1].y; // Y coordinate of the first control point.
	this.x2 = apoints[2].x; // X coordinate of the second control point.
	this.y2 = apoints[2].y; // Y coordinate of the second control point.
	this.x3 = apoints[3].x; // X coordinate of the end point.
	this.y3 = apoints[3].y; // Y coordinate of the end point.
	this.points = apoints;

	this.clone						= function(){
		return new Bezier( [ {   x:this.x0, y:this.y0 },
							   { x:this.x1, y:this.y1 },
							   { x:this.x2, y:this.y2 },
							   { x:this.x3, y:this.y3 } ] );
	};
	this.flip						= function(){
		var temp = this.x0;
		this.x0 = this.x3;
		this.x3 = temp;
		temp = this.y0;
		this.y0 = this.y3;
		this.y3 = temp;

		temp = this.x1;
		this.x1 = this.x2;
		this.x2 = temp;
		temp = this.y1;
		this.y1 = this.y2;
		this.y2 = temp;
		this.points = [ {x:this.x0, y:this.y0}, {x:this.x1, y:this.y1}, {x:this.x2, y:this.y2},{x:this.x3, y:this.y3} ];
	};
	this.getPoint					= function( t ) {
	  // Special case start and end
	  if ( t == 0 ) {
		return { x:this.x0, y:this.y0 };
	  } else if ( t == 1 ) {
		return { x:this.x3, y:this.y3 };
	  }

	  // Step one - from 4 points to 3
	  var ix0 = lerp( this.x0, this.x1, t );
	  var iy0 = lerp( this.y0, this.y1, t );

	  var ix1 = lerp( this.x1, this.x2, t );
	  var iy1 = lerp( this.y1, this.y2, t );

	  var ix2 = lerp( this.x2, this.x3, t );
	  var iy2 = lerp( this.y2, this.y3, t );

	  // Step two - from 3 points to 2
	  ix0 = lerp( ix0, ix1, t );
	  iy0 = lerp( iy0, iy1, t );

	  ix1 = lerp( ix1, ix2, t );
	  iy1 = lerp( iy1, iy2, t );

	  // Final step - last point
	  return { x:lerp( ix0, ix1, t ), y:lerp( iy0, iy1, t ) };
	};
	this.getCurve					= function(){
		return [{ x:this.x0, y:this.y0 },
				{ x:this.x1, y:this.y1 },
				{ x:this.x2, y:this.y2 },
				{ x:this.x3, y:this.y3 } ];
	};
	this.split						= function( t ){
		var a = this.clone();
		var b = this.clone();
		a.subdivideLeft( t );
		b.subdivideRight( t );
		return [ a, b ];
	};
	this.subdivideLeft				= function( t ){
	  if ( t == 1 ){
		return;
	  }
	  // Step one - from 4 points to 3
	  var ix0 = lerp( this.x0, this.x1, t );
	  var iy0 = lerp( this.y0, this.y1, t );

	  var ix1 = lerp( this.x1, this.x2, t );
	  var iy1 = lerp( this.y1, this.y2, t );

	  var ix2 = lerp( this.x2, this.x3, t );
	  var iy2 = lerp( this.y2, this.y3, t );

	  // Collect our new x1 and y1
	  this.x1 = ix0;
	  this.y1 = iy0;

	  // Step two - from 3 points to 2
	  ix0 = lerp( ix0, ix1, t );
	  iy0 = lerp( iy0, iy1, t );

	  ix1 = lerp(ix1, ix2, t);
	  iy1 = lerp(iy1, iy2, t);

	  // Collect our new x2 and y2
	  this.x2 = ix0;
	  this.y2 = iy0;

	  // Final step - last point
	  this.x3 = lerp( ix0, ix1, t );
	  this.y3 = lerp( iy0, iy1, t );
	  this.points = [ {x:this.x0, y:this.y0}, {x:this.x1, y:this.y1}, {x:this.x2, y:this.y2},{x:this.x3, y:this.y3} ];
	};
	this.subdivideRight				= function( t ){
	  this.flip();
	  this.subdivideLeft( 1 - t );
	  this.flip();
	};
	this.solvePositionFromXValue	= function( xVal ){
		// Desired precision on the computation.
		var epsilon = 1e-6;

		// Initial estimate of t using linear interpolation.
		var t = ( xVal - this.x0 ) / ( this.x3 - this.x0 );
		if ( t <= 0 ){
			return null; //0;
		} else if ( t >= 1 ){
			return null; //1;
		}

		// Try gradient descent to solve for t. If it works, it is very fast.
		var tMin = 0;
		var tMax = 1;
		for ( var i = 0; i < 8; i++ ){
			var value = this.getPoint( t ).x;
			var derivative = ( this.getPoint( t + epsilon ).x - value ) / epsilon;
			if ( Math.abs(value - xVal) < epsilon ){
				return t;
			} else if ( Math.abs(derivative) < epsilon){
				break;
			} else{
				if ( value < xVal ){
					tMin = t;
				} else{
					tMax = t;
				}
				t -= ( value - xVal ) / derivative;
			}
		}

		// If the gradient descent got stuck in a local minimum, e.g. because
		// the derivative was close to 0, use a Dichotomy refinement instead.
		// We limit the number of interations to 8.
		for ( var i = 0; Math.abs(value - xVal) > epsilon && i < 8; i++ ){
			if ( value < xVal ){
				tMin = t;
				t = (t + tMax) / 2;
			}else{
				tMax = t;
				t = (t + tMin) / 2;
			}
			value = this.getPoint( t ).x;
		}
		return t;
	};
	this.solveYValueFromXValue		= function( xVal ){
	  return this.getPoint(this.solvePositionFromXValue(xVal)).y;
	};
}
function map( value, start1, stop1, start2, stop2) {
    return start2 + ( stop2 - start2 ) * ( ( value - start1 ) / ( stop1 - start1 ) );
}
function lerp( a, b, x ){
  return a + x * ( b - a );
}
function getNormalized( arr ){
	var normalised = [];
	var p = arr[ 0 ];
	var mx = Number.MAX_VALUE;
	var my = mx;
	var MX = -Number.MAX_VALUE;
	var MY = MX;
	for ( var i = 0; i < arr.length; i++ ) {
	  p = arr[ i ];
	  if( p.x < mx ) { mx = p.x; }
	  if( p.y < my ) { my = p.y; }
	  if( p.x > MX ) { MX = p.x; }
	  if( p.y > MY ) { MY = p.y; }
	  normalised[ i ] = p;
	}
	for ( var i = 0; i < arr.length; i++) {
	  normalised[ i ].x = map( normalised[ i ].x, mx, MX, 0, 1 );
	  normalised[ i ].y = map( normalised[ i ].y, my, MY, 0, 1 );
	}
	return normalised;
}
function isArraysEqual( arr1, arr2 ){
	if( arr1.length != arr2.length ){ return false; }
	for( var i=0; i<arr1.length; i++ ){
		if( arr1[i] != arr2[i] ){
			return false;
		}
	}
	return true;
}