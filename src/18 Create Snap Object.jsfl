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
	runScript( "Create Snap Object" );
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
	if( isString( EDAPSettings.createSnapObject.name ) == false ){
		displayMessage( commandname + " : There is no valid name for the symbol", 1 );
		return;
	}
	var currentDoc = fl.getDocumentDOM();
	var itemArray = currentDoc.library.items;
	var symbolExists = false;
	var objectMoved = false;
	var specialLayer = -1;
	
	//  Check for symbol
	for( var i=0; i<itemArray.length; i++ ){
		var theItem = itemArray[i];
		if( theItem.itemType !== "folder" ){
			var xname = theItem.name.substr( theItem.name.lastIndexOf("/") + 1 );
			if( xname == EDAPSettings.createSnapObject.name ){
				if( theItem.name != xname ){
					currentDoc.library.moveToFolder( "", theItem.name, true );
					objectMoved = true;
				}
				symbolExists = true;
				break;
			}
		}
	}
	// Check for layer
	var affectedLayers = currentDoc.getTimeline().layers;
	for( var i=0; i<affectedLayers.length; i++ ){
		var l = affectedLayers[i];
		if( l.layerType != "folder" ){
			if( l.name == EDAPSettings.createSnapObject.layerName ){
				specialLayer = i;
				break;
			}
		}
	}

	if( specialLayer == -1 ){
		createLayer( currentDoc );
	}
	
	if( symbolExists == false ){
		createSymbol( currentDoc );
	}
	else{
		prepareForPasteSymbol( currentDoc, specialLayer )
	}

	currentDoc.getTimeline().currentLayer = specialLayer;

	if( currentDoc.getTimeline().layers[ currentDoc.getTimeline().currentLayer ].locked == false ){
		currentDoc.clipPaste();
	}
	else{
		displayMessage( commandname + " : The '" + EDAPSettings.createSnapObject.layerName + "' layer is locked.", 2 );	
	}
	

	// Display message
	if( EDAPSettings.createSnapObject.showAlert == true ){
		var messageA = "The Symbol called &quot;" + EDAPSettings.createSnapObject.name + "&quot; was moved to the Library's root." + "\n" +
		"&quot;"+EDAPSettings.createSnapObject.name+"&quot; must be available in Library's root" + "\n" +
		"for the correct functioning of &quot;Smart Snap&quot; command." + "\n" +
		"Please, do not move, edit or rename it!";

		var messageB = "A layer called &quot;"+EDAPSettings.createSnapObject.layerName+"&quot; was created for convenience." + "\n" +
		"It is recommended to place all needed instances of" + "\n" +
		"&quot;"+EDAPSettings.createSnapObject.name+"&quot; onto this layer.";
		
		if( objectMoved == true && specialLayer > -1 ){
			displayOptionalMessageBox( commandname, messageA, "create_snap_object" );
		}
		else if( objectMoved == false && specialLayer == -1 ){
			displayOptionalMessageBox( commandname,  messageB, "create_snap_object" );
		}
		else if( objectMoved == true && specialLayer == -1 ){
			displayOptionalMessageBox( commandname, "1.  " + messageA + "\n" + "\n" + "2.  " + messageB, "create_snap_object" );
		}
	}	
}

function createLayer( doc ){
	doc.getTimeline().currentLayer = 0;
	doc.getTimeline().addNewLayer( EDAPSettings.createSnapObject.layerName );
	var xLayer = doc.getTimeline().layers[ doc.getTimeline().currentLayer ];
	xLayer.color = "#FF0000";
	xLayer.outline = true;	
}

function prepareForPasteSymbol( currentDoc ){
	var timeline = currentDoc.getTimeline();
	var layerMap = createObjectStateMap( timeline.layers, [ "locked" ] );
	var n = timeline.addNewLayer();
	timeline.setSelectedLayers( n, true );
	currentDoc.library.addItemToDocument({x:0, y:0}, EDAPSettings.createSnapObject.name );
	timeline.setLayerProperty( "locked", true, "others" );
	currentDoc.selectAll( true );
	currentDoc.clipCut();
	timeline.deleteLayer( n );
	restoreObjectStateFromMap( timeline.layers, layerMap );
}

function createSymbol( currentDoc ){
	var dom = fl.createDocument( "timeline" );
	var items = dom.library.items;
	var sourceName = EDAPSettings.createSnapObject.name + ".swf";
	var lnames = [ "Vertical", "Horizontal", "Circle" ];
	dom.importFile( fl.configURI + "WindowSWF/EDAPT Helper Objects/" + sourceName, true );
	dom.library.selectItem( sourceName, true, true );
	dom.library.renameItem( EDAPSettings.createSnapObject.name );
	
	dom.library.editItem();					
	dom.selectAll();						
	dom.align( "horizontal center", true ); 
	dom.align( "vertical center", true );	
	dom.breakApart();						
	dom.distributeToLayers();				
	dom.breakApart();						
	dom.setStrokeColor( "#FF000000" );
	var tml = fl.getDocumentDOM().getTimeline();	
	tml.deleteLayer( 0 );
	for( var i=0; i< tml.layers.length; i++ ){
		var xl = tml.layers[i];
		xl.name = lnames[i];
		xl.color = "#FF000000";
		xl.outline = true;
		xl.locked = true;
	}
	dom.exitEditMode();
	dom.library.addItemToDocument({x:0, y:0}, EDAPSettings.createSnapObject.name );
	dom.selectAll( true );
	dom.clipCut();
	dom.close( false );
}

function isString() {
	if ( typeof arguments[0] == "string" ) return true;
		if ( typeof arguments[0] == "object" ) {  
		var criterion =  arguments[0].constructor.toString().match(/string/i); 
		return (criterion != null);
	}
	return false;
}