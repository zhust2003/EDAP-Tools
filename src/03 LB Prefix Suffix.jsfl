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
	runScript( "LB Prefix Suffix" );
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
	var settings = displayPanel( "PrefixSuffix" , xmlContent )
	
	if( settings.dismiss == "accept" ){
		// Get the user input
		var Prefix = settings.Prefix;
		var Suffix = settings.Suffix;
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
				theItem.name = prefixSuffix( theItem.name, Prefix, Suffix );
				counter ++;
			}
		}
		var tail;
		if( counter == 1 ){ tail = "";}
		else{ tail = "s"; }
		displayMessage( commandname + " : " + counter + " object" + tail + " affected.", 2 );
	}
}
function prefixSuffix( astring, pref, suff ){
	var itm = astring.substr( astring.lastIndexOf( "/" ) + 1 );
	return pref + itm + suff;
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
						'<spacer></spacer>' +
						'<label value="Prefix / Suffix"/>' +
					'</row>' +
					'<row>' +
						'<label value="Prefix:      " />' +
						'<textbox id="Prefix" size="40"/>' +
					'</row>' +
					'<row>' +
						'<label value="Suffix:      " />' +
						'<textbox id="Suffix" size="40"/>' +
					'</row>' +
				'</rows>' +
			'</grid>' +
		'<checkbox id="EntireLibrary" label="Work in Entire Library ( Ignore selection ) ?" checked = "false" />' +
		'<spacer></spacer>' +
		'<separator></separator>' +
		'<spacer></spacer>' +
		'</vbox>' +
	'</dialog>';
	return result;
}