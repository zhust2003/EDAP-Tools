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
    runScript( "EDAPT Help" );
}catch( error ){
    fl.trace( error );
}
function runScript( commandname ){
    if( fl.getDocumentDOM() == null ){
        fl.trace( "No document open." );
        return;
    }
    var xmlContent = createXML();
    Edapt.utils.displayPanel( "EdaptHelp" , xmlContent );
}
function createXML(){
    var ver = Edapt.settings.version;
    return '<dialog title="EDAPT Help  -  ' + ver + '">' +
        '<vbox>' +
        '<flash width="400" height="580" src="../XULControls/EDAPT Help.swf"/>' +
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
        '<button label="View Shortcuts Map" oncommand = "Edapt.utils.viewShortcutsMap();"/>' +
        '<label value="                                    " />' +
        '<button label="Close" oncommand = "fl.xmlui.cancel();"/>' +
        '</row>' +
        '</grid>'+
        '</dialog>';
}


