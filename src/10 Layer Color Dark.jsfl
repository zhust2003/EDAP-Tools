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
	runScript( "Layer Color Dark" );
}catch( error ){
	fl.trace( error );
}

function runScript( commandname ){
	if( fl.getDocumentDOM() == null ){
		fl.trace( "No document open." );
		return;
	}
	var theColor = getNextColorFromList();
	var counter = 0;
	
	var affectedLayers = Edapt.utils.getLayers();
	for( var i=0; i < affectedLayers.length; i ++ ){
		var currentLayer = affectedLayers[i];
		currentLayer.color = theColor;
		if( Edapt.settings.layerColors.forceOutline == true ){
			currentLayer.outline = true;
		}
		counter ++ ;
	}
	var tail;
	if( counter == 1 ){ tail = "";}
	else{ tail = "s"; }
	Edapt.utils.displayMessage( commandname + " : " + counter + " layer" + tail + " affected.", 2 );
}

function getNextColorFromList(){
	if( Edapt.settings.layerColors.dark.index < Edapt.settings.layerColors.dark.colors.length - 1 ){
		Edapt.settings.layerColors.dark.index ++;
	}
	else{
		Edapt.settings.layerColors.dark.index = 0;
	}
	return Edapt.settings.layerColors.dark.colors[ Edapt.settings.layerColors.dark.index ];
}