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

		for( var i=0; i < EDAPSettings.commands.length; i++  ){
			var val = settings[ EDAPSettings.commands[i].id ];
			EDAPSettings.commands[i].state = ( val === "true");
		}

		// Save settings
		fl.runScript( fl.configURI + "Javascript/EDAPT Common Functions.jsfl", "serialize", EDAPSettings, fpath );
		
		// Check for command settings
		var states = settings.allBoxes.split( "," );
		var messageFlag = false;
		for( var i=0; i<EDAPSettings.commands.length; i++ ){
			if( settings[ EDAPSettings.commands[i].id ] != states[i] ){
				messageFlag = true;
				break;
			}
		}
		
	}
	FLfile.remove( xmlFile );
	
	if( messageFlag ){
		moveCommandFiles();
		var restartDialogue = fl.getDocumentDOM().xmlPanel( fl.configURI + "XULControls/Restart.xml" );
		if( restartDialogue.dismiss == "accept" ){
			if( restartDialogue.choice == "Restart Now" ){
				fl.quit();
			}
		}	
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
	cmd = EDAPSettings.commands;
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
						'<checkbox id="'+ cmd[0].id +'" label="'+ cmd[0].name +'" checked="'+ cmd[0].state +'"/>' +
						'<checkbox id="'+ cmd[7].id +'" label="'+ cmd[7].name +'" checked="'+ cmd[7].state +'" />' +
						'<checkbox id="'+ cmd[14].id +'" label="'+ cmd[14].name +'" checked="'+ cmd[14].state +'" />' +
					'</row>' +
					
					'<row>' +
						'<checkbox id="'+cmd[1].id+'" label="'+cmd[1].name+'" checked="'+cmd[1].state+'" />' +
						'<checkbox id="'+cmd[8].id+'" label="'+cmd[8].name+'" checked="'+cmd[8].state+'" />' +
						'<checkbox id="'+cmd[15].id+'" label="'+cmd[15].name+'" checked="'+cmd[15].state+'" />' +
					'</row>' +
					
					'<row>' +
						'<checkbox id="'+cmd[2].id+'" label="'+cmd[2].name+'" checked="'+cmd[2].state+'" />' +
						'<checkbox id="'+cmd[9].id+'" label="'+cmd[9].name+'" checked="'+cmd[9].state+'" />' +
						'<checkbox id="'+cmd[16].id+'" label="'+cmd[16].name+'" checked="'+cmd[16].state+'" />' +
					'</row>' +
					
					'<row>' +
						'<checkbox id="'+cmd[3].id+'" label="'+cmd[3].name+'" checked="'+cmd[3].state+'" />' +
						'<checkbox id="'+cmd[10].id+'" label="'+cmd[10].name+'" checked="'+cmd[10].state+'" />' +
						'<checkbox id="'+cmd[17].id+'" label="'+cmd[17].name+'" checked="'+cmd[17].state+'" />' +	
					'</row>' +
					
					'<row>' +
						'<checkbox id="'+cmd[4].id+'" label="'+cmd[4].name+'" checked="'+cmd[4].state+'" />' +
						'<checkbox id="'+cmd[11].id+'" label="'+cmd[11].name+'" checked="'+cmd[11].state+'" />' +
						'<checkbox id="'+cmd[18].id+'" label="'+cmd[18].name+'" checked="'+cmd[18].state+'" />' +
					'</row>' +
					
					'<row>' +
						'<checkbox id="'+cmd[5].id+'" label="'+cmd[5].name+'" checked="'+cmd[5].state+'" />' +
						'<checkbox id="'+cmd[12].id+'" label="'+cmd[12].name+'" checked="'+cmd[12].state+'" />' +
						'<checkbox id="'+cmd[19].id+'" label="'+cmd[19].name+'" checked="'+cmd[19].state+'" />' +
					'</row>' +
					
					'<row>' +
						'<checkbox id="'+cmd[6].id+'" label="'+cmd[6].name+'" checked="'+cmd[6].state+'" />' +
						'<checkbox id="'+cmd[13].id+'" label="'+cmd[13].name+'" checked="'+cmd[13].state+'" />' +
						'<checkbox id="'+cmd[20].id+'" label="'+cmd[20].name+'" checked="'+cmd[20].state+'" />' +
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
				'var boxState = false;' +
				'function setCommandBoxes(){' +
					'boxState = ! boxState;'+
					'setAllCommandBoxes( boxState );' +
				'}' +
				
				'function getCommandBoxes(){'+
					'var allBoxes = getAllCommandBoxes();'+
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