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
	runScript( "Convert To Symbol Preserving Layers" );
}catch( error ){
	fl.trace( error );
}

function runScript( commandname ){
	if( fl.getDocumentDOM() == null ){
		fl.trace( "No document open." );
		return;
	}
	fl.runScript( fl.configURI + "Javascript/EDAPT Common Functions.jsfl" );
	initialize();
	// invoke the dialogue
	var settings = fl.getDocumentDOM().xmlPanel( fl.configURI + "XULControls/ConvertToSymbolPreservingLayers.xml" );
	if( settings.dismiss == "accept" ){
		var selectedItems = fl.getDocumentDOM().selection;
		if( selectedItems.length > 0 ){
			symbolName = settings.name; // Get the symbol name
			var symbolType = "graphic"; // Determine the symbol type ( default = "graphic" )
			switch( settings.SymbolType ){
				case "Movie Clip":
					symbolType = "movie clip";
					break;
				case "Graphic":
					symbolType = "graphic";
					break;
				case "Button":
					symbolType = "button";
					break;
			}
			var layerMap = createObjectStateMap( 
												fl.getDocumentDOM().getTimeline().layers, 
												[ "name", "layerType", "color", "outline", "locked" ],
												function( a ){ return Boolean( a.layerType != undefined && a.layerType != "folder" && a.locked == false ); } ); 
			fl.getDocumentDOM().group();
			var newSymbol = fl.getDocumentDOM().convertToSymbol( symbolType, symbolName, "center" );
			if( newSymbol != null ){
				fl.getDocumentDOM().enterEditMode( "inPlace" );
				fl.getDocumentDOM().selectNone();
				fl.getDocumentDOM().selectAll();
				fl.getDocumentDOM().distributeToLayers();
				fl.getDocumentDOM().unGroup();                      // bugfix 2011/02/28
				var tl = fl.getDocumentDOM().getTimeline();			// Access symbol's timeline
				tl.deleteLayer(0);									// Remove layer 1 - it is unnecessary									
				restoreObjectStateFromMap( tl.layers, layerMap );   // Recreate layer properties from the previously stored map
				fl.getDocumentDOM().selectNone();
				fl.getDocumentDOM().exitEditMode();
			}
			
		}
		else{
			displayMessage( commandname + " : Please, select the elements you want to convert to symbol.", 1 );
		}
		
	}
}