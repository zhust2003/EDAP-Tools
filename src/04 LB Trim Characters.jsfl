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
	runScript( "LB Trim Characters" );
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
	var settings = displayPanel( "TrimCharacters" , xmlContent )
	
	
	if( settings.dismiss == "accept" ){
		fl.runScript( fl.configURI + "Javascript/EDAPT Common Functions.jsfl" );
		initialize();
		// Get the user input
		var leftTrim = parseInt( settings.LeftTrim );														
		var rightTrim = parseInt( settings.RightTrim );
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
				theItem.name = trim( theItem.name, leftTrim, rightTrim );
				counter ++;
			}
		}
		var tail;
		if( counter == 1 ){ tail = "";}
		else{ tail = "s"; }
		displayMessage( commandname + " : " + counter + " object" + tail + " affected.", 2 );
	}
}
function trim( astring, leftNum, rightNum ){
	var itm = astring.substr( astring.lastIndexOf("/") + 1);
	return rightTrim( leftTrim( itm, leftNum ), rightNum );
}
function leftTrim( astring, n ){
    var l = 0;
    while( l < n ){
      l++;
    }
    return astring.substring( l, astring.length );
}
function rightTrim( astring, n ){
    var r = astring.length;
    var e = r - n;
    while( r > e ){
      r --;
    }
    return astring.substring( 0, r )   
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
						'<label value="Trim Characters"/>' +
					'</row>' +
					'<row>' +
						'<label value="Left:       " />' +
						'<textbox id="LeftTrim" size="5" value="1" />' +
					'</row>' +
					'<row>' +
						'<label value="Right:      " />' +
						'<textbox id="RightTrim" size="5" value="2"/>' +
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