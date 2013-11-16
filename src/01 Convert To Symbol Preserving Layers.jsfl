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
 
 version: 2.0.3
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
    // invoke the dialogue
    //var settings = fl.getDocumentDOM().xmlPanel( fl.configURI + "XULControls/ConvertToSymbolPreservingLayers.xml" );
    var xmlContent = createXML();
    var settings = Edapt.utils.displayPanel( "ConvertToSymbolPreservingLayers" , xmlContent );

    if( settings.dismiss == "accept" ){

        var selectedItems = fl.getDocumentDOM().selection;
        if( selectedItems.length > 0 ){
            var symbolName = settings.name; // Get the symbol name
            var symbolType = ( settings.SymbolType.toLowerCase().replace( /\s+$/,"" ) ) || "graphic"; // Get the symbol type
            var layerMap = Edapt.utils.createObjectStateMap(
                Edapt.utils.getLayers(),
                [ "name", "layerType", "color", "outline", "locked" ],
                function( a ){ return Boolean( a.layerType != undefined && a.layerType != "folder" && a.locked == false ); } );
            fl.getDocumentDOM().group();
            var newSymbol = fl.getDocumentDOM().convertToSymbol( symbolType, symbolName, settings.regpoint.replace( "centre","center" ) );
            if( newSymbol != null ){
                fl.getDocumentDOM().enterEditMode( "inPlace" );
                fl.getDocumentDOM().selectNone();
                fl.getDocumentDOM().selectAll();
                fl.getDocumentDOM().distributeToLayers();
                fl.getDocumentDOM().unGroup();									// bugfix 2011/02/28
                var tl = fl.getDocumentDOM().getTimeline();						// Access symbol's timeline
                tl.deleteLayer(0);												// Remove layer 1 - it is unnecessary
                Edapt.utils.restoreObjectStateFromMap( tl.layers, layerMap );	// Recreate layer properties from the previously stored map
                fl.getDocumentDOM().selectNone();
                fl.getDocumentDOM().exitEditMode();
            }

        }
        else{
            Edapt.utils.displayMessage( commandname + " : Please, select the elements you want to convert to symbol.", 1 );
        }

    }
}
function createXML(){
    var ver = Edapt.settings.version;
    return '<dialog buttons="accept, cancel" title="Convert to Symbol ( Preserving Layers )  -  ' + ver + '">' +
        '<content>' +
        '<grid>' +
        '<columns id="columns">' +
        '<column />' +
        '<column />' +
        '<column />' +
        '</columns>' +
        '<rows id="controls">' +
        '<row>' +
        '<label value="Name:" />' +
        '<textbox id="name" size="25" />' +
        '<label value="      " />' +
        '</row>' +
        '<spacer></spacer>' +
        '<spacer></spacer>' +
        '<spacer></spacer>' +
        '<row align="start">' +
        '<label value="Type:               " />' +
        '<radiogroup class="control" id="SymbolType" groupbox="true" >' +
        '<radio label="Graphic" selected="true"/>' +
        '<radio label="Movie Clip    " selected="false"/>' +
        '<radio label="Button" selected="false"/>' +
        '</radiogroup>' +
        '</row>' +

        '<spacer></spacer>' +
        '<spacer></spacer>' +
        '<spacer></spacer>' +

        '<row align="start">' +
        '<label value="Registration:               " />' +
        '<menulist id="regpoint" width="160">' +
        '<menupop>' +
        '<menuitem label="top left" selected="false"/>' +
        '<menuitem label="top centre" selected="false"/>' +
        '<menuitem label="top right" selected="false"/>' +
        '<menuitem label="center left" selected="false"/>' +
        '<menuitem label="centre" selected="true"/>' +
        '<menuitem label="centre right" selected="false"/>' +
        '<menuitem label="bottom left" selected="false"/>' +
        '<menuitem label="bottom centre" selected="false"/>' +
        '<menuitem label="bottom right" selected="false"/>' +
        '</menupop>' +
        '</menulist>' +
        '</row>' +
        '</rows>' +
        '</grid>' +
        '<spacer></spacer>' +
        '<spacer></spacer>' +
        '<spacer></spacer>' +
        '<separator></separator>' +
        '<spacer></spacer>' +
        '</content>' +
        '</dialog>';
}