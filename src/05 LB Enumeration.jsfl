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
	runScript( "LB Enumeration" );
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
		var tail;
		if( counter == 1 ){ tail = "";}
		else{ tail = "s"; }
		displayMessage( commandname + " : " + counter + " symbol" + tail + " affected.", 2 );
		
		// save settings
		EDAPSettings.Enumeration.pattern = pattern;
		EDAPSettings.Enumeration.useFolderNames = useFolderNames;
		EDAPSettings.Enumeration.resetCounterOnEachFolder = resetOnEachFolder;
		EDAPSettings.Enumeration.start = start;
		EDAPSettings.Enumeration.step = step;
		EDAPSettings.Enumeration.leadingZeroes = padding;
		EDAPSettings.Enumeration.entireLibrary = EntireLibrary;
		serialize( EDAPSettings, fl.configURI + "Javascript/EDAPTsettings.txt" );
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
function decode( astring ){
	var match1 = new RegExp( "<", "gi" );
	parsed1 = astring.replace( match1, "&lt;" );
	var match2 = new RegExp( ">", "gi" );
	parsed2 = parsed1.replace( match2, "&gt;" );
	return parsed2;
}
function createXML(){
	var ptrn = decode( EDAPSettings.Enumeration.pattern );
	var ver = getProductVersion( "all" );
	var result =	
	'<dialog title="Rename Library Items    ' + ver + '">' +
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

			'<label value="Name:" />' +
			'<hbox>' +
				'<textbox id="Pattern" size="37" value="'+ ptrn +'"/>' +
				'<checkbox id="UseFolderNames" label="Use Folder Names?" checked = "'+ EDAPSettings.Enumeration.useFolderNames +'" />' +
			'</hbox>' +
			'<spacer></spacer>' +
			'<spacer></spacer>' +
			'<spacer></spacer>' +
			'<separator></separator>' +
			'<spacer></spacer>' +
			'<spacer></spacer>' +
			'<label value="Enumeration:" />' +
			'<spacer></spacer>' +
			
			'<grid>' +
				'<columns>' +
					'<column/>' +
					'<column/>' +
					'<column/>' +
				'</columns>' +
				'<rows>' +	
					'<row>' +
						'<hbox>' +
							'<label value="Start:                 " />' +
							'<textbox id="StartValue" size="5" value="'+ EDAPSettings.Enumeration.start +'" />' +
						'</hbox>' +
						'<hbox>' +
							'<label value="        Step:" />' +
							'<textbox id="Step" size="5" value="'+ EDAPSettings.Enumeration.step +'" />' +
						'</hbox>' +
						'<hbox>' +
							'<label value="   " />' +
							'<checkbox id="ResetOnEachFolder" label="Reset Counter on Each Folder ?" checked = "'+ EDAPSettings.Enumeration.resetCounterOnEachFolder +'" />' +
						'</hbox>' +
					'</row>' +
					
					'<row>' +
						'<hbox>' +
							'<label value="Leading Zeroes:" />' +
							'<textbox id="ZeroPadding" size="5" value="'+ EDAPSettings.Enumeration.leadingZeroes +'"/>' +
						'</hbox>' +
						'<label value="" />' +
						'<label value="" />' +
					'</row>' +
					
				'</rows>' +
			'</grid>' +
			
			'<spacer></spacer>' +
			'<spacer></spacer>' +
			'<spacer></spacer>' +
			
			'<radiogroup label="Preview" groupbox="true" >' +
				'<grid>' +
					'<columns>' +
						'<column/>' +
						'<column/>' +
						'<column/>' +
					'</columns>' +
					'<row>' +
						'<listbox id="preview" width="300" rows="6">' +
							'<listitem label="square" value="square" />' +
							'<listitem label="circle" value="circle" />' +
							'<listitem label="triangle" value="triangle" />' +
							'<listitem label="rectangle" value="rectangle" />' +
						'</listbox>' +
						'<label value="      " />' +
						'<button label="Generate" oncreate="createPreview();" oncommand = "createPreview();"/>' +
					'</row>' +
				'</grid>'+
			'</radiogroup>' +

			'<spacer></spacer>' +
			'<spacer></spacer>' +
			'<spacer></spacer>' +
			'<separator></separator>' +
			'<spacer></spacer>' +
			'<spacer></spacer>' +
			'<spacer></spacer>' +
			
			'<checkbox id="EntireLibrary" label="Work in Entire Library ( Ignore selection ) ?" checked = "'+ EDAPSettings.Enumeration.entireLibrary +'" />' +
			'<spacer></spacer>' +
			'<spacer></spacer>' +
			'<spacer></spacer>' +
			'<spacer></spacer>' +
			'<separator></separator>' +
			'<spacer></spacer>' +
		'</vbox>' +
		
		'<grid>' +
			'<columns>' +
				'<column/>' +
				'<column/>' +
				'<column/>' +
			'</columns>' +
			'<row>' +
				'<button label="Defaults" oncommand = "resetDialogue();"/>' +
				'<label value="                                               " />' +
				'<hbox>' +
					'<button label="Rename" oncommand = "confirmDialogue()"/>' +
					'<button label="Cancel" oncommand = "fl.xmlui.cancel();"/>' +
				'</hbox>' +
			'</row>' +
		'</grid>'+
	'<script>' +
	
		'function confirmDialogue(){' +
			'var input = [];' +
			'input.push( { value:fl.xmlui.get( "StartValue" ), validator:isNumber, message:"\'Start Value\' must be a whole number." } );' +
			'input.push( { value:fl.xmlui.get( "Step" ), validator:isPositiveNumber, message:"\'Step\' must be a whole, positive number." } );' +
			'input.push( { value:fl.xmlui.get( "ZeroPadding" ), validator:isPositiveNumber, message:"\'Leading Zeroes\' must be a whole, positive number." } );' +
			'var error = checkValue( input, 0 );' +	
			'if( ! error ){' +
				'fl.xmlui.accept();' +
			'}' +
			'else{' +
				'alert( error.message );' +
			'}' +
		'}' +

		'function isNumber( value ){' +
		  'var a = ( parseFloat( value ) == parseInt( value ) );' +
		  'var b = ! isNaN( value );' +
		  'return Boolean( ( a + b ) == 2 );' +
		'}' +
		
		'function isPositiveNumber( n ){' +
			'var a = isNumber( n );' +
			'var b = Boolean( n &gt; 0 );' +
			'return ( a+b ) == 2;'+
		'}' +
		
		'function resetDialogue(){' +
			'fl.xmlui.set( "Pattern", "&lt;name&gt; &lt;enum&gt;" );' +
			'fl.xmlui.set( "UseFolderNames", "true" );' +
			'fl.xmlui.set( "StartValue", "1" );' +
			'fl.xmlui.set( "Step", "1" );' +
			'fl.xmlui.set( "ZeroPadding", "2" );' +
			'fl.xmlui.set( "ResetOnEachFolder", "true" );' +
			'fl.xmlui.set( "EntireLibrary", "false" );' +
		'}' +
		'function checkValue( alist, n ){' +
		  'if( n &lt; alist.length ){' +
			'var checked = alist[ n ];' +
			'if( checked.validator( checked.value ) == false ){' +
			  'return { message:checked.message, value:checked.value};' +
			'}' +
			'n++;' +
			'return checkValue( alist, n );' +
		  '}' +
		'}' +
		
		'function createPreview(){' +
		  'var pattern = fl.xmlui.get("Pattern");' +
		  'var start = parseInt( fl.xmlui.get("StartValue") );' +
		  'var step = parseInt( fl.xmlui.get("Step") );' +
		  'var leading = parseInt( fl.xmlui.get("ZeroPadding") );' +
		  'var usefoldernames = Boolean( fl.xmlui.get("UseFolderNames") == "true" );' +
		  'var resetoneach = Boolean( fl.xmlui.get("ResetOnEachFolder") == "true" );' +
		  
		  'var fname;' +
		  'if( usefoldernames == true ){' +
			'fname = "FolderName";' +
		  '}' +
		  'else{' +
			'fname = "SymbolName";' +
		  '}' +
		  'var steps;' +
		  'if( resetoneach == true ){' +
			'steps = [start, start, start, start, start];' +
		  '}' +
		  'else{' +
			'steps = [ start, start+step, start+2*step, start+3*step, start+4*step];' +
		  '}' +

		  'var match = new RegExp( "&lt;name&gt;", "gi" );' +
		  'xname = pattern.replace( match, fname );' +

		  'match = new RegExp( "&lt;enum&gt;", "gi" );' +
		  'var p1 = xname.replace( match, createNumber( steps[0], leading ) );' +
		  'var p2 = xname.replace( match, createNumber( steps[1], leading ) );' +
		  'var p3 = xname.replace( match, createNumber( steps[2], leading ) );' +
		  'var p4 = xname.replace( match, createNumber( steps[3], leading ) );' +
		  'var p5 = xname.replace( match, createNumber( steps[4], leading ) );' +
		
			'var elements = [];' +
			'elements.push( {label:"SymbolName1 -- &gt; " + p1, value:"SymbolName1 -- &gt; " + p1} );' +
			'elements.push( {label:"SymbolName2 -- &gt; " + p2, value:"SymbolName2 -- &gt; " + p2} );' +
			'elements.push( {label:"SymbolName3 -- &gt; " + p3, value:"SymbolName3 -- &gt; " + p3} );' +
			'elements.push( {label:"SymbolName4 -- &gt; " + p4, value:"SymbolName4 -- &gt; " + p4} );' +
			'elements.push( {label:"SymbolName5 -- &gt; " + p5, value:"SymbolName5 -- &gt; " + p5} );' +
			'fl.xmlui.setControlItemElements( "preview", elements ); ' +

		'}' +

		'function createNumber( n, totalDigits) {' +
			'n = n.toString();' +
			'var pd = [""];' +
			'if ( totalDigits &gt; n.length ) {' +
			  'var diff = totalDigits-n.length;' +
			  'var i = 0;' +
			  'nextValue( i, diff, pd )' +
			'}' +
			'return pd[0] + n.toString();' +
		'}' +
		'function nextValue( i, diff, pd ){' +
			'if( i &lt; diff ){' +
				'pd[0] += "0";' +
				'i ++;' +
				'nextValue( i, diff, pd );' +
			'}' +
		'}' +
		'function initPreview(){' +
			'var elements = [];' +
			'elements.push( {label:"SymbolName1", value:"SymbolName1" } );' +
			'elements.push( {label:"SymbolName2", value:"SymbolName2" } );' +
			'elements.push( {label:"SymbolName3", value:"SymbolName3" } );' +
			'elements.push( {label:"SymbolName4", value:"SymbolName4" } );' +
			'elements.push( {label:"SymbolName5", value:"SymbolName5" } );' +
			'fl.xmlui.setControlItemElements( "preview", elements ); ' +
		'}' +
	'</script>' +
	'</dialog>';
	//fl.trace( result );
	return result;
}