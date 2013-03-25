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
	var settings = Edapt.utils.displayPanel( "EdaptHelp" , xmlContent )	
}
function createXML(){
	var ver = Edapt.settings.version;
	var result = 
	'<dialog buttons="accept" title="EDAPT Help  -  ' + ver + '">' +
		'<vbox>' +
			'<flash width="360" height="480" src="../XULControls/EDAPT Help.swf"/>' +
		'<spacer></spacer>' +
		'<separator></separator>' +
		'<spacer></spacer>' +
		'</vbox>' +
	'</dialog>';
	return result;
}


