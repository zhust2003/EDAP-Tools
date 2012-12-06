﻿/*
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

Q = "\"";

try {
	runScript( "LB Find And Replace" );
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
	var xmlContent = createXML();
	var settings = displayPanel( "FindAndReplace" , xmlContent )	

	if( settings.dismiss == "accept" ){
		// Get the user input
		var oldName = settings.Find;														
		var newName = settings.Replace;
		var sens = Boolean( settings.Sensitive === "true" );
		var global = Boolean( settings.FirstOnly === "false" );
		var EntireLibrary = Boolean( settings.EntireLibrary == "true" );

		// Determine the items to work on.
		if( EntireLibrary ){
			var selItems = fl.getDocumentDOM().library.items;
		}
		else{
			var selItems = fl.getDocumentDOM().library.getSelectedItems();
		}
		

		// Counter of the processed items
		var counter =  0;

		for( var s = 0; s < selItems.length; s ++ ){
			var theItem = selItems[s];
			if( theItem.itemType !== "folder" ){
				theItem.name = createNewName( theItem.name, oldName, newName, global, sens );
				counter ++;
			}
		}

		var tail;
		if( counter == 1 ){ tail = "";}
		else{ tail = "s"; }
		displayMessage( commandname + " : " + counter + " symbol" + tail + " affected.", 2 );
		
		// save settings
		EDAPSettings.FindAndReplace.find = oldName;
		EDAPSettings.FindAndReplace.replace = newName;
		EDAPSettings.FindAndReplace.caseSensitive = sens;
		EDAPSettings.FindAndReplace.firstOccurence = ! global;
		EDAPSettings.FindAndReplace.entireLibrary = EntireLibrary;
		serialize( EDAPSettings, fl.configURI + "Javascript/EDAPTsettings.txt" );		
	}
}
function createNewName( str, oldstr, newstr, g, s ){
    var itm = str.substr( str.lastIndexOf("/") + 1);
    if( g == true ){
        params = "g";
    }
    else{
        params = "";
    }
    if( s == false ){
        params = params + "i";
    }
    var match = new RegExp( oldstr, params );     
    var retval = itm.replace( match, newstr );
	return retval;    
}
function createXML(){
	var ver = getProductVersion( "all" );
	var result = 	
	'<dialog buttons="accept, cancel" title="Rename Library Items    ' + ver + '">' +
		'<vbox>' +
			'<grid>' +
				'<columns>' +
					'<column />' +
					'<column />' +
				'</columns>' +
				'<rows>' +
					'<row>' +
						'<label value="Find:" control="fString" />' +
						'<textbox id="Find" size="40" value="'+ EDAPSettings.FindAndReplace.find +'"/>' +
					'</row>' +
					'<row>' +
						'<label value="Replace:" />' +
						'<textbox id="Replace" size="40" value="'+ EDAPSettings.FindAndReplace.replace +'"/>' +
					'</row>' +	
				'</rows>' +
			'</grid>' +
			//checks
			'<hbox>' +
				'<checkbox id="Sensitive" label="Case Sensitive?" checked = "'+ EDAPSettings.FindAndReplace.caseSensitive +'" />' +
				'<checkbox id="FirstOnly" label="First Occurence Only?" checked = "'+ EDAPSettings.FindAndReplace.firstOccurence +'" />' +
			'</hbox>' +
		'<spacer></spacer>' +
		'<spacer></spacer>' +
		'<checkbox id="EntireLibrary" label="Work in Entire Library ( Ignore selection ) ?" checked = "'+ EDAPSettings.FindAndReplace.entireLibrary +'" />' +
		'<spacer></spacer>' +
		'<separator></separator>' +
		'<spacer></spacer>' +
		'</vbox>' +
	'</dialog>';
	return result;
}