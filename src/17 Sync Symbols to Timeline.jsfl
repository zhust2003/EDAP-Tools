﻿/*Electric Dog Flash Animation Power ToolsCopyright (C) 2011  Vladin M. MitovThis program is free software: you can redistribute it and/or modifyit under the terms of the GNU General Public License as published bythe Free Software Foundation, either version 3 of the License, or(at your option) any later version.This program is distributed in the hope that it will be useful,but WITHOUT ANY WARRANTY; without even the implied warranty ofMERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See theGNU General Public License for more details.You should have received a copy of the GNU General Public Licensealong with this program.  If not, see http://www.gnu.org/licenses/.*/	try {	runScript( "Sync Symbols to Timeline" );}catch( error ){	fl.trace( error );}function runScript( commandname ){	if( fl.getDocumentDOM() == null ){		fl.trace( "No document open." );		return;	}	fl.runScript( fl.configURI + "Javascript/EDAPT Common Functions.jsfl" );	initialize();	var counter = 0;	var myTimeLine = fl.getDocumentDOM().getTimeline(); 	var selectedFrames = myTimeLine.getSelectedFrames();	for(var i=0; i<selectedFrames.length; i+=3 ){		if( myTimeLine.layers[i].layerType != "folder" ){			counter = processFrames( myTimeLine, selectedFrames[i], selectedFrames[i+1], selectedFrames[i+2] );		}	}	var tail;	if( counter == 1 ){ tail = "";}	else{ tail = "s"; }	displayMessage( commandname + " : " + counter + " frame" + tail + " processed.", 2 );}function processFrames( tml, layer, startFrame, endFrame ) {	var currentLayer = tml.layers[ layer ];	var cnt = 0;	for( var i = startFrame; i < endFrame; i++ ){		var currentFrame = currentLayer.frames[i];		if( currentFrame.startFrame == i ) {			for( var j = 0; j < currentFrame.elements.length; j++ ){				var el = currentFrame.elements[j];				if( isElementSymbol( el ) == true && ( el.symbolType == "graphic" || el.symbolType == "movieclip" ) ){					el.firstFrame = i;					cnt ++;				}				else{					continue;				}			}		} else {			i = currentFrame.startFrame + currentFrame.duration - 1;			continue;		}	}	return cnt;}