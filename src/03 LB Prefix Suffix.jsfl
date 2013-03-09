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
	// invoke the dialogue
	var xmlContent = createXML();
	var settings = Edapt.utils.displayPanel( "PrefixSuffix" , xmlContent )
	
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
		Edapt.utils.displayMessage( commandname + " : " + counter + " object" + tail + " affected.", 2 );
		
		// save settings
		Edapt.settings.PrefixSuffix.prefix = Prefix;
		Edapt.settings.PrefixSuffix.suffix = Suffix;
		Edapt.settings.PrefixSuffix.entireLibrary = EntireLibrary;
		Edapt.utils.serialize( Edapt.settings, fl.configURI + "Javascript/EDAPTsettings.txt" );
	}
}
function prefixSuffix( astring, pref, suff ){
	var itm = astring.substr( astring.lastIndexOf( "/" ) + 1 );
	return pref + itm + suff;
}
function createXML(){
	var ver = Edapt.utils.getProductVersion( "all" );
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
						'<textbox id="Prefix" size="40" value="'+ Edapt.settings.PrefixSuffix.prefix +'"/>' +
					'</row>' +
					'<row>' +
						'<label value="Suffix:      " />' +
						'<textbox id="Suffix" size="40" value="'+ Edapt.settings.PrefixSuffix.suffix +'"/>' +
					'</row>' +
				'</rows>' +
			'</grid>' +
		'<checkbox id="EntireLibrary" label="Work in Entire Library ( Ignore selection ) ?" checked = "'+ Edapt.settings.PrefixSuffix.entireLibrary +'" />' +
		'<spacer></spacer>' +
		'<separator></separator>' +
		'<spacer></spacer>' +
		'</vbox>' +
	'</dialog>';
	return result;
}