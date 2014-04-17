/*
 Electric Dog Flash Animation Power Tools
 Copyright (C) 2011-2013  Vladin M. Mitov

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
  
 version: 2.5.0
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
    // invoke the dialogue
    var xmlContent = createXML();
    var settings = Edapt.utils.displayPanel( "FindAndReplace" , xmlContent );

    if( settings.dismiss == "accept" ){
        // Get the user input
        var oldName = settings.Find;
        var newName = settings.Replace;
        var sens = Boolean( settings.Sensitive === "true" );
        var global = Boolean( settings.FirstOnly === "false" );
        var EntireLibrary = Boolean( settings.EntireLibrary == "true" );

        // Determine the items to work on.
        var selItems;
        if( EntireLibrary ){
            selItems = fl.getDocumentDOM().library.items;
        }
        else{
            selItems = fl.getDocumentDOM().library.getSelectedItems();
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
        var tail = ( counter == 1 ) ? "" : "s";
        Edapt.utils.displayMessage( commandname + " : " + counter + " symbol" + tail + " affected.", 2 );

        // save settings
        Edapt.settings.FindAndReplace.find = oldName;
        Edapt.settings.FindAndReplace.replace = newName;
        Edapt.settings.FindAndReplace.caseSensitive = sens;
        Edapt.settings.FindAndReplace.firstOccurence = ! global;
        Edapt.settings.FindAndReplace.entireLibrary = EntireLibrary;
        Edapt.utils.serialize( Edapt.settings, fl.configURI + "Javascript/EDAPT." + Edapt.settings.version + "/settings.txt" );
    }
}
function createNewName( str, oldstr, newstr, g, s ){
    var itm = str.substr( str.lastIndexOf("/") + 1);
    var params;
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
    return itm.replace( match, newstr );
}
function createXML(){
    var ver = Edapt.settings.version;
    return 	'<dialog buttons="accept, cancel" title="Rename Library Items  -  ' + ver + '">' +
        '<vbox>' +
        '<grid>' +
        '<columns>' +
        '<column />' +
        '<column />' +
        '</columns>' +
        '<rows>' +
        '<row>' +
        '<label value="Find:" control="fString" />' +
        '<textbox id="Find" size="40" value="'+ Edapt.settings.FindAndReplace.find +'"/>' +
        '</row>' +
        '<row>' +
        '<label value="Replace:" />' +
        '<textbox id="Replace" size="40" value="'+ Edapt.settings.FindAndReplace.replace +'"/>' +
        '</row>' +
        '</rows>' +
        '</grid>' +
        //checks
        '<hbox>' +
        '<checkbox id="Sensitive" label="Case Sensitive?" checked = "'+ Edapt.settings.FindAndReplace.caseSensitive +'" />' +
        '<checkbox id="FirstOnly" label="First Occurence Only?" checked = "'+ Edapt.settings.FindAndReplace.firstOccurence +'" />' +
        '</hbox>' +
        '<spacer></spacer>' +
        '<spacer></spacer>' +
        '<checkbox id="EntireLibrary" label="Work in Entire Library ( Ignore selection ) ?" checked = "'+ Edapt.settings.FindAndReplace.entireLibrary +'" />' +
        '<spacer></spacer>' +
        '<separator></separator>' +
        '<spacer></spacer>' +
        '</vbox>' +
        '</dialog>';
}