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
	// Construct and invoke the dialogue with the proper default values.
	var level1 = "false", level2 = "false", level3 = "false";
	switch( Edapt.settings.traceLevel ){
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
	var xmlPanel = createSettingsPanel( level1, level2, level3 );
	var settings = Edapt.utils.displayPanel( "EDAPTSettings", xmlPanel );
	if( settings.dismiss == "accept" ){
		var fpath = fl.configURI + "Javascript/EDAPT." + Edapt.settings.version + "/settings.txt";
		// Assign new values
		for( var i=0; i < Edapt.settings.layerColors.light.colors.length; i++ ){
			var p1 = "light" + ( i + 1 );
			var p2 = "dark" + ( i + 1 );
			Edapt.settings.layerColors.light.colors[i] = validateHEX( settings[p1] )? settings[p1] : Edapt.settings.layerColors.light.colors;
			Edapt.settings.layerColors.dark.colors[i] = validateHEX( settings[p2] )? settings[p2] : Edapt.settings.layerColors.dark.colors[i];
		}
		Edapt.settings.layerColors.forceOutline = Boolean( settings.forceOutline === "true");
		Edapt.settings.smartMagnetJoint.distanceThreshold = parseInt( settings.SmartSnapDistance );
		Edapt.settings.createMagnetTarget.visibleTargets = Boolean( settings.visibleTargets === "true");
		Edapt.settings.createMagnetTarget.visibleMarkers = Boolean( settings.visibleMarkers === "true");
		
		Edapt.settings.ConvertToKeyframes.recursive = Boolean( settings.recursiveFolders === "true");
		Edapt.settings.ConvertToKeyframes.restore = Boolean( settings.restoreSelection === "true");
		
		Edapt.settings.traceLevel = parseInt( settings.traceLevel );
		if( settings.resetDialogs == "true" ){
			for ( var o in Edapt.settings ){
				if( Edapt.settings[o].hasOwnProperty( "showAlert" ) ) {
					Edapt.settings[o].showAlert = true;
				}
			}	
		}
		// Save settings
		Edapt.utils.serialize( Edapt.settings, fpath );
	}
}
function validateHEX( colorcode ){
  var regColorcode = /^(#)([0-9a-fA-F]{3})([0-9a-fA-F]{3})?$/;
  if( regColorcode.test( colorcode ) == true ){
    return true;
  }
  return false;
}
function createSettingsPanel( level1, level2, level3 ){
	var ver = Edapt.settings.version;
	return '<?xml version="1.0"?>' +
	'<dialog title="Electric Dog Animation Power Tools - Settings    ' + ver + '" >' +
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
					'<checkbox id="forceOutline" label="Force Outline when setting the Layer Color?" checked = "' + Edapt.settings.layerColors.forceOutline + '" />' +
					'<label value="                                                                   " />' +
					'<button label="Reset to default colors" oncreate="loadDefaultColors()" oncommand="resetToDefaultColours()"/>' +						
				'</row>'+	
				'</rows>' +
			'</grid>' +
			
			// ------------------------------------------
			'<spacer>' +
			'</spacer>' +
			'<separator></separator>' +
			'<spacer></spacer>' +
			'<spacer></spacer>' +
			
			// CONVERT TO KEYFRAMES----------------------
			'<vbox>' +
				'<label value="Convert To Keyframes Advanced" />' +
				'<spacer></spacer>' +
				'<spacer></spacer>' +
				'<spacer></spacer>' +
				'<grid>' +
				'<columns>' +
					'<column/>' +
				'</columns>' +
				'<rows>' +
					'<row>' +
						'<checkbox id="recursiveFolders" label="Recursive - Keyframes will be created in all layers of all nested subfolders." checked = "' + Edapt.settings.ConvertToKeyframes.recursive + '"/>' +
					'</row>' +
					'<row>' +
					'<checkbox id="restoreSelection" label="Restore selection and active layer in Extreme mode (Alt+F6) - Active Stage elements and Keyframes will be limited to the initial manual selection." checked = "' + Edapt.settings.ConvertToKeyframes.restore + '" />' +
					'</row>' +
				'</rows>' +
				'</grid>' +
			'</vbox>' +

			// ------------------------------------------
			'<spacer></spacer>' +
			'<separator></separator>' +
			'<spacer></spacer>' +
			'<spacer></spacer>' +

			
			// SMART MAGNET RANGE----------------------
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
					'<spacer></spacer>' +
					'<spacer></spacer>' +
					'<hbox>' +
		'<checkbox class="control" id="visibleTargets" label="Magnet Target(s) layer visible upon creation" checked = "' + Edapt.settings.createMagnetTarget.visibleTargets + '" />' +
		'<checkbox class="control" id="visibleMarkers" label="Center Marker layer visible upon creation" checked = "' + Edapt.settings.createMagnetTarget.visibleMarkers  + '" />' +
					'</hbox>' +
				'</row>' +
				'<row>' +
					'<label value="Smart Magnet Range:     " />' +
					'<textbox id="SmartSnapDistance" size="5" value="' + Edapt.settings.smartMagnetJoint.distanceThreshold + '"/>' +
					'<label value="      " />' +
					'<label value="This is the radius which defines the range in which &quot;19 Smart Magnet Joint&quot; will search for a Magnet Target in case when symbols were not linked using &quot;Smart Magnet Rig&quot; panel." width="450"/>' +
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
						'<menulist id="traceLevel" >' +
							'<menupop>' +
								'<menuitem label="None" value="0" selected="' + level1 + '" />' +
								'<menuitem label="Errors Only" value="1"  selected="' + level2 + '" />' +
								'<menuitem label="Errors and Messages" value="2"  selected="' + level3 + '" />' +
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
			'<checkbox id="resetDialogs" label="Reset &quot;Don&#39;t show this message again&quot; option" checked="false" />' +
			
			// ------------------------------------------
			'<spacer></spacer>' +
			'<separator></separator>' +
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
				'</columns>' +
				'<row>' +
					'<button label="Manage Commands..." oncommand = "Edapt.utils.createCommandsPanel();"/>' +
					'<label value="                                                    " />' +
					'<label value="                                                    " />' +
					'<hbox>' +
						'<button label="Save and Close" oncommand = "confirmSettingsDialogue();"/>' +		
						'<button label="Cancel" oncommand = "fl.xmlui.cancel();"/>' +
					'</hbox>' +
				'</row>' +
			'</grid>'+
			

			// ------------------------------------------
			'<script>' +
				'function loadDefaultColors(){'+ 
					'Edapt.utils.loadDefaultSettingsColors();' +
				'}' +
				'function resetToDefaultColours(){' +
					'Edapt.utils.resetToDefaultSettingsColors();' +
				'}' +
				'function confirmSettingsDialogue(){' +
					'var input = [];' +
					'input.push( { value:fl.xmlui.get( "SmartSnapDistance" ), validator:isValidDistance, message:"Smart Magnet Range can only be a whole number. Minimum value is 10." } );' +
					'var error = checkValue( input, 0 );' +
					'if( ! error ){' +
						'fl.xmlui.accept();' +
					'}' +
					'else{' +
						'alert( error.message );' +
					'}' +
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
				'function isValidDistance( data ){' +
					'if( isNumeric( data ) ){' +
						'if( ( data &gt; 0 ) || ( data == 0 )  ){' +
							'return true;' +
						'}' +
						'return false;' +
					'}' +
					'return false;' +
				'}' +
				'function isNumeric( data ){' +
					'var f = parseFloat( data );' +
					'return ( f == data );' +
				'}' +
			'</script>'+
		'</vbox>' +
	'</dialog>';
}