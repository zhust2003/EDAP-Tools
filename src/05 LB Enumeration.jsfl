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

try {
	runScript( "LB Enumeration" );
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
	var settings = displayPanel( "Enumeration" , xmlContent )
	
	
	if( settings.dismiss == "accept" ){
		// Get the use input and set the defaults when needed
		var pattern = settings.Pattern.indexOf( "<enum>" ) == -1 ? settings.Pattern + " <enum>":settings.Pattern;		
		var start = isNaN( parseInt( settings.StartValue ) ) ? 1 : parseInt( settings.StartValue );
		var step = isNaN( parseInt( settings.Step ) ) ? 1 : parseInt( settings.Step );
		var counter = start;
		var useFolderNames = Boolean( settings.UseFolderNames == "true" );
		var resetOnEachFolder = Boolean( settings.ResetOnEachFolder == "true" );
		var EntireLibrary = Boolean( settings.EntireLibrary == "true" );
		var padding = isNaN( parseInt( settings.ZeroPadding ) ) ? 1 : parseInt( settings.ZeroPadding );

		// Determine the items to work on.
		if( EntireLibrary ){
			var selItems = fl.getDocumentDOM().library.items;
		}
		else{
			var selItems = fl.getDocumentDOM().library.getSelectedItems();
		}
		
		/* Build an array with the names of the selected items.
		   We will sort this array to assure the consecutive positions
		   of the items in one folder.
		*/
		var selectedItemNames = new Array();
		for( var i=0; i<selItems.length; i++ ){
			if( selItems[i].itemType !== "folder" ){
				selectedItemNames.push( selItems[i].name );
			}
		}
		selectedItemNames.sort();
		// Store the last folder name
		var lastFolderName = "";

		for( var j=0; j<selectedItemNames.length; j++ ){
			theItem = selectedItemNames[ j ]; 										// full item name with folders, separated by backslashes )
			var fldrName = getFolderName( theItem );
			
			if( resetOnEachFolder == true ){
				if( fldrName !==  lastFolderName ){
					counter = start; 												// reset counter for each new folder
					lastFolderName = fldrName;
				}
			}

			// Here we decide what to use as a 'name'
			var parsedName;
			if( useFolderNames == true ){
				if( fldrName == "" ){
					var match = new RegExp( "<name>", "gi" );
					parsedName = pattern.replace( match, excludePath( theItem ) );

				}
				else{
					var tmp = filterTags( pattern );
					if( tmp == "<name><enum>" ){
						parsedName = fldrName + " <enum>";
					}
					else if( tmp == "<enum><name>" ){
						parsedName = "<enum> " + fldrName;
					}
					else{
						parsedName = fldrName + " <enum>";
					}
				}
			}
			else{
				var match = new RegExp( "<name>", "gi" );
				parsedName = pattern.replace( match, excludePath( theItem ) );

			}
	
			match = new RegExp( "<enum>", "gi" );
			parsedName = parsedName.replace( match, createNumber( counter, padding ) );
			var itmIndex = fl.getDocumentDOM().library.findItemIndex( theItem );	// Find by name the original item index ( within the entire library ).
			fl.getDocumentDOM().library.items[ itmIndex ].name = parsedName;		// RENAME
			counter = counter + step // increase counter
		}
		fl.runScript( fl.configURI + "Javascript/EDAPT Common Functions.jsfl" );
		initialize();
		var tail;
		if( counter == 1 ){ tail = "";}
		else{ tail = "s"; }
		displayMessage( commandname + " : " + counter + " symbol" + tail + " affected.", 2 );
	}	
}
function filterTags( apattern ){
   var parsed = apattern.match( /(<name>|<enum>)/gi );
   var output = "";
   for( var i=0; i<parsed.length; i++ ){
     var pt = parsed[i];
     if( output.lastIndexOf( parsed[i] ) == -1 ){
       output += parsed[i];
     }
   }
   return( output );
} 
function getFolderName( astring ){
	if( typeof astring  !== "string" ){ return ""; }
	var tmp = astring.split( "/" );
	if( tmp.length > 1 ){
		return tmp[ tmp.length - 2 ]; // the name of the folder
	}
	return ""; // the name of the object
}
function createNumber( n, totalDigits) {
    n = n.toString(); 
    var pd = ""; 
    if ( totalDigits > n.length ) { 
        for ( var i=0; i<(totalDigits-n.length); i++){ 
            pd += "0"; 
        } 
    } 
    return pd + n.toString(); 
}
function excludePath( str ){
	return str.substr( str.lastIndexOf("/") + 1 );
}
function createXML(){
	var ver = getProductVersion( "all" );
	var result =	
	'<dialog buttons="accept, cancel" title="Rename Library Items    ' + ver + '">' +
		'<vbox>' +
			'<label value="Use &lt;name&gt; and &lt;enum&gt; tags or combine them with free" />' +
			'<label value="text to create enumeration format. Example:" />' +
			'<label value="Assume that the original symbol name is &quot;walk&quot; and the symbol is" />' +
			'<label value="in the folder named &quot;Character&quot;." />' +
			'<spacer></spacer>' +
			'<label value="a)     &lt;name&gt; &lt;enum&gt; will produce &quot;walk 001&quot;" />' +
			'<label value="b)     &lt;enum&gt; will produce &quot;001&quot;" />' +
			'<label value="c)     FX_&lt;enum&gt; will produce &quot;FX_001&quot;" />' +
			'<label value="d)     &quot;UseFolderNames&quot; will produce &quot;Character 001&quot;" />' +
			'<separator></separator>' +
			'<spacer></spacer>' +
			'<spacer></spacer>' +
			'<spacer></spacer>' +
			'<textbox id="Pattern" size="55" value="&lt;name&gt; &lt;enum&gt;"/>' +
			
			'<grid>' +
				'<columns>' +
					'<column/>' +
					'<column/>' +
					'<column/>' +
					'<column/>' +
				'</columns>' +
				'<rows>' +
					'<row>' +
						'<spacer></spacer>' +
						'<checkbox id="UseFolderNames" label="Use Folder Names?" checked = "true" />' +
					'</row>' +
					'<row>' +
						'<spacer></spacer>' +
						'<checkbox id="ResetOnEachFolder" label="Reset Counter on Each Folder ?" checked = "true" />' +
					'</row>' +			
					'<row>' +
						'<label value="Start Value   " />' +
						'<textbox id="StartValue" size="5" value="1" />' +
						'<label value="             " />' +
					'</row>' +
					
					'<row>' +
						'<label value="Step             " />' +
						'<textbox id="Step" size="5" value="1" />' +
					'</row>' +
					
					'<row>' +
						'<label value="Zero Padding   " />' +
						'<textbox id="ZeroPadding" size="5" value="2"/>' +
						'<label value="             " />' +
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