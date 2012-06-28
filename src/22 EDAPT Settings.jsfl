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

	var xmlContent = createXML( level1, level2, level3 );
	
	var xmlFile = fl.configURI + "Commands/EDAPTsettingsGUI.xml";
	if ( FLfile.exists( fpath ) ) {
		FLfile.remove( xmlFile );	
	}
	FLfile.write( xmlFile, xmlContent );
	var settings = fl.getDocumentDOM().xmlPanel( xmlFile );

	if( settings.dismiss == "accept" ){
		var fpath = fl.configURI + "Javascript/EDAPTsettings.txt";
		// Assign new values
		for( var i=0; i < EDAPSettings.layerColors.light.colors.length; i++ ){
			var p1 = "light" + ( i + 1 );
			var p2 = "dark" + ( i + 1 );
			EDAPSettings.layerColors.light.colors[i] = validateHEX( settings[p1] )? settings[p1] : EDAPSettings.layerColors.light.colors;
			EDAPSettings.layerColors.dark.colors[i] = validateHEX( settings[p2] )? settings[p2] : EDAPSettings.layerColors.dark.colors[i];
		}
		EDAPSettings.smartSnap.distanceThreshold = settings.SmartSnapDistance;
		EDAPSettings.layerColors.forceOutline = ( settings.forceOutline === "true");
		EDAPSettings.traceLevel = parseInt( settings.traceLevel );
		
		if( settings.resetDialogs == "true" ){
			EDAPSettings.setSelectionPivotToParentRegPoint.showAlert = true;
			EDAPSettings.createSnapObject.showAlert = true;
		}

		
		// Save settings
		fl.runScript( fl.configURI + "Javascript/EDAPT Common Functions.jsfl", "serialize", EDAPSettings, fpath );
		
		// Check for command settings
		var checkBoxNames = ["comm1", "comm2", "comm3", "comm4", "comm5", "comm6", "comm7", "comm8", "comm9", "comm10", "comm11", "comm12", "comm13", "comm14", "comm15", "comm16", "comm17", "comm18", "comm19", "comm20", "comm21"];
		var states = settings.allBoxes.split( "," );
		var messageFlag = false;
		for( var i=0; i<checkBoxNames.length; i++ ){
			if( settings[ checkBoxNames[i] ] != states[i] ){
				messageFlag = true;
				break;
			}
		}
	}
	FLfile.remove( xmlFile );
	if( messageFlag ){
		alert( "Hiding or showing commands recquires Flash to be restarted. Do you want to restart now?" );
	}
}

function traceObj(obj){
	for ( var o in obj ){
		fl.trace( o + ":" + obj[o] );
	}
}


function validateHEX( colorcode ){
  var regColorcode = /^(#)([0-9a-fA-F]{3})([0-9a-fA-F]{3})?$/;
  if( regColorcode.test( colorcode ) == true ){
    return true;
  }
  return false;
} 

function createXML( level1, level2, level3 ){
	return '<?xml version="1.0"?>' +
	'<dialog title="Electric Dog Animation Power Tools - Settings" buttons="accept, cancel">' +
		'<vbox>' +
			// LAYER COLORS---------------------------
			'<label value="Layer Outline Colors" />' +
			'<spacer></spacer>' +
			'<spacer></spacer>' +
			'<spacer></spacer>' +
			'<spacer></spacer>' +
			
			'<grid>' +
				'<columns>' +
					'<column/>' +
					'<column/>' +
					'<column/>' +
					'<column/>' +
					'<column/>' +
					'<column/>' +
				'</columns>' +
					'<rows>' +
						'<row>' +
							'<label value="Light:          " />' +
							'<colorchip id="light1" />' +
							'<colorchip id="light2" />' +
							'<colorchip id="light3" />' +
							'<colorchip id="light4" />' +
							'<colorchip id="light5" />' +
						'</row>' +
						'<row>' +
							'<label value="Dark:          " />' +
							'<colorchip id="dark1" />' +
							'<colorchip id="dark2" />' +
							'<colorchip id="dark3" />' +
							'<colorchip id="dark4" />' +
							'<colorchip id="dark5" />' +
						'</row>' +
				'</rows>' +
			'</grid>' +
			
			'<grid>' +
				'<columns>' +
					'<column/>' +
					'<column/>' +
					'<column/>' +
				'</columns>' +
				'<rows>' +
					'<row>' +
					'<checkbox id="forceOutline" label="Force Outline when setting the Layer Color?" checked = "' + EDAPSettings.layerColors.forceOutline + '" />' +
					'<label value="                                                                   " />' +
					'<button label="Reset to default colors" oncommand = "resetToDefaultColours()"/>' +						
				'</row>'+	
				'</rows>' +
			'</grid>' +
			
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
			'</columns>' +
			'<rows>' +
				'<row>' +
					'<label value="Smart Snap Distance:     " />' +
					'<textbox id="SmartSnapDistance" size="5" value="' + EDAPSettings.smartSnap.distanceThreshold + '"/>' +
					'<label value="          Lorem ipsum dolor sit amet. Est cu tantas elaboraret, sed ubique postea cu, conceptam pertinacia eum ea." />' +
				'</row>' +
			'</rows>' +
			'</grid>' +
			// ------------------------------------------
			'<spacer></spacer>' +
			'<separator></separator>' +
			'<spacer></spacer>' +
			'<spacer></spacer>' +
			// OUTPUT SETTINGS---------------------------
			
			'<grid>' +
				'<columns>' +
					'<column/>' +
					'<column/>' +
				'</columns>' +
				'<rows>' +
					'<row>' +
						'<label value="Trace Level ( Display in Output Panel )          " />' +
						'<menulist id="traceLevel" oncreate = "setDefaultColors()" >' +
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
			// SHOW/HIDE COMMANDS---------------------------
			'<spacer></spacer>' +
			'<label value="Покажи следните команди в менюто &quot;Commands&quot;. Hiding or showing commands recquires Flash to be restarted." />' +
			'<spacer></spacer>' +
			'<spacer></spacer>' +
			'<spacer></spacer>' +
			'<spacer></spacer>' +
			'<grid>' +
				'<columns>' +
					'<column/>' +
					'<column/>' +
					'<column/>' +
				'</columns>' +
				'<rows>' +
					'<row>' +
						'<checkbox id="comm1" label="01 Convert To Symbol Preserving Layers" checked="false" onchange = "clickCheckBox()"/>' +
						'<checkbox id="comm8" label="08 Layer Outlines Toggle" checked="false" />' +
						'<checkbox id="comm15" label="15 Set Selection Pivot To Parent Reg Point" checked="false" />' +
					'</row>' +
					
					'<row>' +
						'<checkbox id="comm2" label="02 LB Find And Replace" checked="false" />' +
						'<checkbox id="comm9" label="09 Layer Guide Toggle" checked="false" />' +
						'<checkbox id="comm16" label="16 Swap Multiple Symbols" checked="false" />' +
					'</row>' +
					
					'<row>' +
						'<checkbox id="comm3" label="03 LB Prefix Suffix" checked="false" />' +
						'<checkbox id="comm10" label="10 Layer Color Dark" checked="false" />' +
						'<checkbox id="comm17" label="17 Sync Symbols to Timeline" checked="false" />' +
					'</row>' +
					
					'<row>' +
						'<checkbox id="comm4" label="04 LB Trim Characters" checked="false" />' +
						'<checkbox id="comm11" label="11 Layer Color Light" checked="false" />' +
						'<checkbox id="comm18" label="18 Create Snap Object" checked="false" />' +	
					'</row>' +
					
					'<row>' +
						'<checkbox id="comm5" label="05 LB Enumeration" checked="false" />' +
						'<checkbox id="comm12" label="12 Set Reg Point To Transform Point" checked="false" />' +
						'<checkbox id="comm19" label="19 Smart Snap" checked="false" />' +
					'</row>' +
					
					'<row>' +
						'<checkbox id="comm6" label="06 Next Frame In Symbol" checked="false" />' +
						'<checkbox id="comm13" label="13 Enter Symbol At Current Frame" checked="false" />' +
						'<checkbox id="comm20" label="20 EDAPT Help" checked="false" />' +
					'</row>' +
					
					'<row>' +
						'<checkbox id="comm7" label="07 Prev Frame In Symbol" checked="false" />' +
						'<checkbox id="comm14" label="14 Record Parent Reg Point" checked="false" />' +
						'<checkbox id="comm21" label="21 EDAPT Shortcuts Map" checked="false" />' +
					'</row>' +
					
					'<row>' +
						'<label value="" />' +
						'<button id="checkall" label="Check/Uncheck All" oncreate = "getCommandBoxes()" oncommand = "setCommandBoxes()"/>' +
						'<label value="" />' +
						
					'</row>' +
				'</rows>' +
			'</grid>' +
			// ------------------------------------------
			'<spacer></spacer>' +
			'<separator></separator>' +
			'<spacer></spacer>' +
			'<spacer></spacer>' +
			// RESET DIALOGUES---------------------------
			'<checkbox id="resetDialogs" label="Reset &quot;Don&#39;t show this message again&quot; option" checked="false" />' +
			'<property id="allBoxes" value="false" ></property>' +
			// ------------------------------------------
			'<script>' +
				'var checkBoxNames = ["comm1", "comm2", "comm3", "comm4", "comm5", "comm6", "comm7", "comm8", "comm9", "comm10", "comm11", "comm12", "comm13", "comm14", "comm15", "comm16", "comm17", "comm18", "comm19", "comm20", "comm21"];' +
				'var boxState = false;' +
				'function setCommandBoxes(){' +
					'boxState = ! boxState;'+
					'setAllCommandBoxes( checkBoxNames, boxState );' +
				'}' +
				
				'function getCommandBoxes(){'+
					'var allBoxes = getAllCommandBoxes( checkBoxNames );'+
					'fl.xmlui.set( "allBoxes", allBoxes );'+
				'}' +
				
				'function setDefaultColors(){'+ 
					'fl.xmlui.set( "light1", "'+EDAPSettings.layerColors.light.colors[0]+'" );'+
					'fl.xmlui.set( "light2", "'+EDAPSettings.layerColors.light.colors[1]+'" );'+
					'fl.xmlui.set( "light3", "'+EDAPSettings.layerColors.light.colors[2]+'" );'+
					'fl.xmlui.set( "light4", "'+EDAPSettings.layerColors.light.colors[3]+'" );'+
					'fl.xmlui.set( "light5", "'+EDAPSettings.layerColors.light.colors[4]+'" );'+
					
					'fl.xmlui.set( "dark1",  "'+EDAPSettings.layerColors.dark.colors[0] +'" );'+
					'fl.xmlui.set( "dark2",  "'+EDAPSettings.layerColors.dark.colors[1] +'" );'+
					'fl.xmlui.set( "dark3",  "'+EDAPSettings.layerColors.dark.colors[2] +'" );'+
					'fl.xmlui.set( "dark4",  "'+EDAPSettings.layerColors.dark.colors[3] +'" );'+
					'fl.xmlui.set( "dark5",  "'+EDAPSettings.layerColors.dark.colors[4] +'" );'+
				'}' +
				'function resetToDefaultColours(){' +
					'var lc = defineLightColors();' +
					'fl.xmlui.set( "light1", lc[0] );'+
					'fl.xmlui.set( "light2", lc[1] );'+
					'fl.xmlui.set( "light3", lc[2] );'+
					'fl.xmlui.set( "light4", lc[3] );'+
					'fl.xmlui.set( "light5", lc[4] );'+
					'var dc = defineDarkColors();' +
					'fl.xmlui.set( "dark1",  dc[0] );'+
					'fl.xmlui.set( "dark2",  dc[1] );'+
					'fl.xmlui.set( "dark3",  dc[2] );'+
					'fl.xmlui.set( "dark4",  dc[3] );'+
					'fl.xmlui.set( "dark5",  dc[4] );'+
				'}' +

			'</script>'+
		'</vbox>' +
	'</dialog>';
}