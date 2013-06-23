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
	runScript( "Konvert To Keyframes" );
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
	var mode = 1;
	if( fl.tools.altIsDown ){ mode = 2; }
	switch( mode ){
		case 1: // Smart( extended flash standard )
			standard( myTimeline, recursive, restore );
			break;
		case 2: // Extreme
			extreme( myTimeline, recursive, restore );
			break;
		default:
			standard( myTimeline, recursive, restore );
	}
}
function standard( atimeline, recursive, restore ){
	var cl = atimeline.currentLayer;
	var selFrames = atimeline.getSelectedFrames();
	var containsFolder = __isFolderSelected( atimeline, selFrames );
	if( ! containsFolder ){
		atimeline.convertToKeyframes(); // standard behaviour
		if( restore ){ 
			atimeline.currentLayer = cl;
		}
	}
	else{
		var scheme = __prepareStandard( atimeline, selFrames, recursive );
		atimeline.setSelectedFrames( scheme, true );
		atimeline.convertToKeyframes();
		if( restore ){ 
			atimeline.setSelectedFrames( selFrames, true );
			atimeline.currentLayer = cl;
		}
	}
}
function extreme( atimeline, recursive, restore ){
	var cl = atimeline.currentLayer;
	var selFrames = atimeline.getSelectedFrames();		// Get all selected frames in the timeline
	var scheme = __prepareExtreme( atimeline, selFrames, recursive );
	atimeline.setSelectedFrames( scheme, true );
	atimeline.convertToKeyframes();
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
	if( ranges.length ){
		var folder = __getParentFolderFromSelection( atimeline, ranges );
		var xfilter = function( alayer, folder ){ return false; };
		if( ! recursive ){
			xfilter = function( alayer, folder ){
				return Boolean( alayer.parentLayer == folder );
			};
		}
		else{
			xfilter = function( alayer, folder ){
				p = alayer;
				while( p.parentLayer ){
					p = p.parentLayer;
					if( p == folder ){
						break;
					}
				}
				return Boolean( p == folder );
			};
		}
		if( folder ){
			for( var i=0; i<atimeline.layers.length; i++ ){
				var alayer = atimeline.layers[i];
				if( alayer.layerType != "folder" ){
					if( xfilter.call( this, alayer, folder ) ){
						for( var j=0; j<ranges.length; j++ ){
							retval.push( i );
							retval.push( ranges[j].start );
							retval.push( ranges[j].end );
						}
					}
				}
			}
		}
		else{
			for( var i=0; i<atimeline.layers.length; i++ ){
				for( var j=0; j<ranges.length; j++ ){
					retval.push( i );
					retval.push( ranges[j].start );
					retval.push( ranges[j].end );
				}
			}
		}
	}
	else{
		cf = atimeline.currentFrame;
		for( var i=0; i<atimeline.layers.length; i++ ){
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
	var xfilter = function( alayer, folder ){ return false; };
	if( ! recursive ){
		xfilter = function( alayer, folder ){
			return Boolean( alayer.parentLayer == folder );
		};
	}
	else{
		xfilter = function( alayer, folder ){
			p = alayer;
			while( p.parentLayer ){
				p = p.parentLayer;
				if( p == folder ){
					break;
				}
			}
			return Boolean( p == folder );
		};
	}
	for( var i=0; i<atimeline.layers.length; i++ ){
		var alayer = atimeline.layers[i];
		if( alayer.layerType != "folder" ){
			if( xfilter.call( this, alayer, folder ) ){
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
	for ( n=0; n<selFrames.length; n += 3 ){
		var ln = selFrames[ n ];
		if( ln == layernum ){
			sel = {};
			sel.layer = layernum;
			sel.start = selFrames[ n + 1 ];
			sel.end = selFrames[ n + 2 ];
			retval.push( sel );
		}
	}
	return retval;
}