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
	runScript( "EDAPT Settings" );
}catch( error ){
	fl.trace( error );
}

function runScript( commandname ){
	if( fl.getDocumentDOM() == null ){
		fl.trace( "No document open." );
		return;
	}
	// Re-assure that the settings are initialized.
	fl.runScript( fl.configURI + "Javascript/EDAPT Common Functions.jsfl" );
	initialize();

	// Construct and invoke the dialogue with the proper default values.
	var forceOutline = EDAPSettings.forceOutline;
	var level1 = "false", level2 = "false", level3 = "false";

	switch( EDAPSettings.traceLevel ){
		case 0:
			level1 = "true";
			break;
		case 1:
			level2 = "true";
			break;
		case 2:
			level3 = "true";
			break;
		default:
			level2 = "true";
	}

	var xmlContent = createXML( forceOutline, level1, level2, level3 );
	
	var xmlFile = fl.configURI + "Commands/EDAPTsettingsGUI.xml";
	if ( FLfile.exists( fpath ) ) {
		FLfile.remove( xmlFile );	
	}
	FLfile.write( xmlFile, xmlContent );
	var settings = fl.getDocumentDOM().xmlPanel( xmlFile );

	if( settings.dismiss == "accept" ){
		var fpath = fl.configURI + "Javascript/EDAPTsettings.txt";
		// Assign new values
		for( var i=0; i<EDAPSettings.colorListLight.length; i++ ){
			var p1 = "light" + ( i + 1 );
			var p2 = "dark" + ( i + 1 );
			EDAPSettings.colorListLight[i] = validateHEX( settings[p1] )? settings[p1] : EDAPSettings.colorListLight[i];
			EDAPSettings.colorListDark[i] = validateHEX( settings[p2] )? settings[p2] : EDAPSettings.colorListDark[i];
		}
		EDAPSettings.distanceThreshold = settings.SmartSnapDistance;
		EDAPSettings.forceOutline = settings.forceOutline;
		EDAPSettings.traceLevel = parseInt( settings.traceLevel );
		
		if( settings.resetDialogs == "true" ){
			EDAPSettings.showCreateSnapObjectAlert = true;
			EDAPSettings.showSetSelectionPivotToParentRegPointAlert = true;
		}
		
		
		// Save settings
		fl.runScript( fl.configURI + "Javascript/EDAPT Common Functions.jsfl", "serialize", EDAPSettings, fpath );
	}
	FLfile.remove( xmlFile );
}

function validateHEX( colorcode ){
  var regColorcode = /^(#)([0-9a-fA-F]{3})([0-9a-fA-F]{3})?$/;
  if( regColorcode.test( colorcode ) == true ){
    return true;
  }
  return false;
} 

function createXML( forceOutline, level1, level2, level3 ){
return '<?xml version="1.0"?>' +
'<dialog title="Electric Dog Animation Power Tools - Settings" buttons="accept, cancel">' +
	'<vbox>' +
		// LAYER COLORS---------------------------
		'<label value="Layer Outline Colors" />' +
		'<grid>' +
			'<columns>' +
				'<column/>' +
				'<column/>' +
				'<column/>' +
				'<column/>' +
				'<column/>' +
				'<column/>' +
				'<column/>' +
			'</columns>' +
			'<rows>' +
				'<row>' +
					'<label value="             " />' +
					'<label value="Light:" />' +
					'<textbox id="light1" size="7" value="'+EDAPSettings.colorListLight[0]+'"/>' +
					'<textbox id="light2" size="7" value="'+EDAPSettings.colorListLight[1]+'"/>' +
					'<textbox id="light3" size="7" value="'+EDAPSettings.colorListLight[2]+'"/>' +
					'<textbox id="light4" size="7" value="'+EDAPSettings.colorListLight[3]+'"/>' +
					'<textbox id="light5" size="7" value="'+EDAPSettings.colorListLight[4]+'"/>' +
				'</row>' +
				'<row>' +
					'<label value="             " />' +
					'<label value="Dark:" />' +
					'<textbox id="dark1" size="7" value="'+EDAPSettings.colorListDark[0]+'"/>' +
					'<textbox id="dark2" size="7" value="'+EDAPSettings.colorListDark[1]+'"/>' +
					'<textbox id="dark3" size="7" value="'+EDAPSettings.colorListDark[2]+'"/>' +
					'<textbox id="dark4" size="7" value="'+EDAPSettings.colorListDark[3]+'"/>' +
					'<textbox id="dark5" size="7" value="'+EDAPSettings.colorListDark[4]+'"/>' +
				'</row>' +
			'</rows>' +
		'</grid>' + 
		'<hbox>' +
			'<label value="                    " />' +
			'<checkbox id="forceOutline" label="Force Outline when setting the Layer Color?" checked = "' + forceOutline + '" />' +
		'</hbox>' +
		// ------------------------------------------
		'<spacer>' +
		'</spacer>' +
		'<separator></separator>' +
		'<spacer></spacer>' +
		'<spacer></spacer>' +
		// SMART SNAP DISTANCE----------------------
		'<grid>' +
		'<columns>' +
			'<column/>' +
			'<column/>' +
			'<column/>' +
			'<column/>' +
		'</columns>' +
		'<rows>' +
			'<row>' +
				'<label value="Smart Snap Distance:     " />' +
				'<textbox id="SmartSnapDistance" size="5" value="' + EDAPSettings.distanceThreshold + '"/>' +
			'</row>' +
		'</rows>' +
		'</grid>' +
		// ------------------------------------------
		'<spacer></spacer>' +
		'<separator></separator>' +
		'<spacer></spacer>' +
		'<spacer></spacer>' +
		// OUTPUT SETTINGS---------------------------
		'<label value="Trace Level ( Display in Output Panel )" />' +
		'<grid>' +
			'<columns>' +
				'<column/>' +
				'<column/>' +
			'</columns>' +
			'<rows>' +
				'<row>' +
					'<label value="                      " />' +
					'<menulist id="traceLevel">' +
						'<menupop>' +
							'<menuitem label="None" value="0" selected="' + level1 + '" />' +
							'<menuitem label="Errors Only" value="1"  selected="' + level2 + '" />' +
							'<menuitem label="All" value="2"  selected="' + level3 + '" />' +
						'</menupop>' +
					'</menulist>' +
				'</row>' +
			'</rows>' +
		'</grid>' +
		// ------------------------------------------
		'<spacer></spacer>' +
		'<separator></separator>' +
		'<spacer></spacer>' +
		'<spacer></spacer>' +
		// RESET DIALOGUES---------------------------
		'<checkbox id="resetDialogs" label="Reset &quot;Don&#39;t show this message again&quot; option" checked="false"/>' +
		// ------------------------------------------
	'</vbox>' +
'</dialog>';
}