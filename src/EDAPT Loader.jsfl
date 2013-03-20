/*
Electric Dog Flash Animation Power Tools
Copyright (C) 2013  Vladin M. Mitov

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
Edapt.utils = new Utils();
Edapt.utils.initialize();

function Utils() {
	this.initialize					= function(){
		var fpath = fl.configURI + "Javascript/EDAPTsettings.txt";
		if ( FLfile.exists( fpath ) ) {
			Edapt.settings = this.deserialize( fpath );
			if( ! Edapt.settings ){
				Edapt.settings = {};
				this.createSettings( Edapt.settings );
				this.serialize( Edapt.settings, fpath );
			}
			else{
				// reset some values
				Edapt.settings.recordParentRegPoint.currentElement = 0; 
				Edapt.settings.layerColors.light.index = -1;
				Edapt.settings.layerColors.dark.index = -1;
			}
		}
		else{
			Edapt.settings = {};
			this.createSettings( Edapt.settings );
			this.serialize( Edapt.settings, fpath );
		}
		Edapt.settings.version = this.getProductVersion();
	};
	this.createSettings				= function( context ){
		context.traceLevel = 1; // 0 = none, 1 = errors only, 2 = all

		// Find and Replace
		context.FindAndReplace = new Object();
		context.FindAndReplace.find = "";
		context.FindAndReplace.replace = "";
		context.FindAndReplace.caseSensitive = false;
		context.FindAndReplace.firstOccurence = false;
		context.FindAndReplace.entireLibrary = false;

		// Prefix Suffix
		context.PrefixSuffix = new Object();
		context.PrefixSuffix.prefix = "";
		context.PrefixSuffix.suffix = "";
		context.PrefixSuffix.entireLibrary = false;

		// Trim Characters
		context.TrimCharacters = new Object();
		context.TrimCharacters.left = 0;
		context.TrimCharacters.right = 0;
		context.TrimCharacters.entireLibrary = false;

		// Enumeration
		context.Enumeration = new Object();
		context.Enumeration.pattern = "<name> <enum>";
		context.Enumeration.useFolderNames = true;
		context.Enumeration.resetCounterOnEachFolder = true;
		context.Enumeration.start = 1;
		context.Enumeration.step = 1;
		context.Enumeration.leadingZeroes = 2;
		context.Enumeration.entireLibrary = false;
		
		// Layer Colors
		context.layerColors = new Object();
		context.layerColors.light = new Object();
		context.layerColors.light.colors = this.defineLightColors();
		context.layerColors.light.index = -1;
		context.layerColors.dark = new Object();
		context.layerColors.dark.colors = this.defineDarkColors();
		context.layerColors.dark.index = -1;
		context.layerColors.forceOutline = true;
		
		// Record Parent Reg Point
		context.recordParentRegPoint = new Object();
		context.recordParentRegPoint.currentElement = 0;

		// SetSelectionPivotToParentRegPoint
		context.setSelectionPivotToParentRegPoint = new Object();
		context.setSelectionPivotToParentRegPoint.showAlert = true;

		//CreateSnapObject
		context.createMagnetTarget = new Object();
		context.createMagnetTarget.targetLayerName = "Magnet Target(s)";
		context.createMagnetTarget.markerLayerName = "Center Marker";
		context.createMagnetTarget.visibleTargets = false;
		context.createMagnetTarget.visibleMarkers = true;
		context.createMagnetTarget.folderName = "EDAPT objects";
		context.createMagnetTarget.showAlert = true;
 
		
		//Smart Magnet Joint
		context.smartMagnetJoint = new Object();
		context.smartMagnetJoint.distanceThreshold = 50;
		context.smartMagnetJoint.depthLevel = 2;

		// SMR panel
		context.smartMagnetRig = new Object();
		context.smartMagnetRig.snapThreshold = 4;
		context.smartMagnetRig.folderPath = "EDAPT Disabled Commands";
		context.smartMagnetRig.help = new Object();
		context.smartMagnetRig.help.A = {show:true, value:"http://flash-powertools.com/support/A"};
		context.smartMagnetRig.help.B = {show:true, value:"http://flash-powertools.com/support/B"};
		context.smartMagnetRig.help.C = {show:true, value:"http://flash-powertools.com/support/C"};
		context.smartMagnetRig.help.D = {show:true, value:"http://flash-powertools.com/support/D"};
		
		// SGC panel
		context.smartGraphicControl = new Object();
		context.smartGraphicControl.imageSize = 128;
		context.smartGraphicControl.defaultThumbnailSize = 64;
		context.smartGraphicControl.folderPath = "EDAPT Smart Graphic Control";
		context.smartGraphicControl.panels = {};
		
		//Commands
		//Couples: 6,7   14,15   18,19
		context.commands = new Object();
		context.commands.showAlert = true;
		
		context.commands.settings = new Array();
		context.commands.settings.push( { id:"comm01", name:["01 Convert To Symbol Preserving Layers"], state:true } ); 		//0
		context.commands.settings.push( { id:"comm02", name:["02 LB Find And Replace"], state:true } );							//1
		context.commands.settings.push( { id:"comm03", name:["03 LB Prefix Suffix"], state:true } );							//2
		context.commands.settings.push( { id:"comm04", name:["04 LB Trim Characters"], state:true } );							//3
		context.commands.settings.push( { id:"comm05", name:["05 LB Enumeration"], state:true } );								//4

		context.commands.settings.push( { id:"comm08", name:["08 Layer Outlines Toggle"], state:true } );						//5
		context.commands.settings.push( { id:"comm09", name:["09 Layer Guide Toggle"], state:true } );							//6
		context.commands.settings.push( { id:"comm10", name:["10 Layer Color Dark"], state:true } );							//7
		context.commands.settings.push( { id:"comm11", name:["11 Layer Color Light"], state:true } );							//8
		context.commands.settings.push( { id:"comm12", name:["12 Set Reg Point To Transform Point"], state:true } );			//9
		
		context.commands.settings.push( { id:"comm13", name:["13 Enter Symbol At Current Frame"], state:true } );				//10
		context.commands.settings.push( { id:"comm16", name:["16 Swap Multiple Symbols"], state:true } );						//11
		context.commands.settings.push( { id:"comm17", name:["17 Sync Symbols to Timeline"], state:true } );					//12
		context.commands.settings.push( { id:"comm18", name:["20 Smart Transform"], state:true } );								//13
		context.commands.settings.push( { id:"comm19", name:["22 EDAPT Shortcuts Map"], state:true } );							//14
		
		
		context.commands.settings.push( { id:"pair1",  name:["06 Next Frame In Symbol", "07 Prev Frame In Symbol" ], state:true } );						//15
		context.commands.settings.push( { id:"pair2",  name:["14 Record Parent Reg Point", "15 Set Selection Pivot To Parent Reg Point"], state:true } );	//16
		context.commands.settings.push( { id:"pair3",  name:["18 Create Magnet Target", "19 Smart Magnet Joint"], state:true } );							//17	
	};
	this.isElementSymbol			= function( element ){
		if( element.elementType == "instance" ){
			if( element.instanceType == "symbol" ){
				return true;
			}
		}
		return false;
	};
	this.createObjectStateMap		= function( objectCollection, props, afilter ){
		var stateMap = new Array();
		for( var i = 0; i < objectCollection.length; i++ ){
			var state = {};
			if( ! props ){
				for ( p in objectCollection[ i ] ){
					state[ p ] = objectCollection[ i ][ p ];
				}
			}
			else{
				for( var j = 0; j < props.length; j++ ){
					var p = props[ j ];
					state[ p ] = objectCollection[ i ][ p ];
				}
			}
			if( typeof afilter == "undefined" ) {
				stateMap.push( state );
			}
			else{
				if( afilter.call( this, state ) == true ){
					stateMap.push( state );
				}
			}

		}
		return stateMap;
	};
	this.restoreObjectStateFromMap	= function( objectCollection, stateMap ){
		if( objectCollection.length != stateMap.length ){
			return;
		}
		for( var i = 0; i < stateMap.length; i++ ){
			state = stateMap[ i ];
			for ( p in state ){
				objectCollection[ i ][ p ] = state[ p ];
			}
		}
	};
	this.getLayers					= function(){
		var tl = fl.getDocumentDOM().getTimeline();
		var selFrames = tl.getSelectedFrames();
		var cl = tl.currentLayer;
		var selectedLayers = new Array();
		for ( n=0; n<selFrames.length; n+=3 ){
			var layerNum = selFrames[n];
			if( layerNum !== cl ){
				var currentLayer = tl.layers[ layerNum ];
				if( currentLayer.layerType != "folder" ){
					selectedLayers.push( currentLayer );
				}
			}
		}
		if( tl.layers[ cl ].layerType != "folder" ){
			selectedLayers.push( tl.layers[ cl ] );
		}
		return selectedLayers;
	};
	this.getData					= function( element, atype ){
		if( this.isElementSymbol( element ) ){
			var dataname = { SMR:"rigData", MT:"MT", SGC:"SGC" };
			if( element.hasPersistentData( dataname[atype] ) ){
				var data = element.getPersistentData( dataname[atype] );
				if( data != 0 ){
					data = this.JSON.parse( data );
					return data;
				}
				return null;
			}
			return null;
		}
		return null;
	};
	this.setData					= function( element, atype, dataObj ){
		if( this.isElementSymbol( element ) ){
			var dataname = { SMR:"rigData", MT:"MT", SGC:"SGC" };
			element.removePersistentData( dataname[atype] );
			element.setPersistentData( dataname[atype], "string", this.JSON.stringify( dataObj ) );
			return true;
		}
		return false;
	};
	this.removeData					= function( element, atype ){
		if( this.isElementSymbol( element ) ){
			var dataname = { SMR:"rigData", MT:"MT", SGC:"SGC" };
			if( element.hasPersistentData( dataname[atype] ) ){
				element.removePersistentData( dataname[atype] );
				return true;
			}
			return false;
		}
		return false;
	};
	this.isMagnetTarget				= function( element ){
		var retval = false;
		if( this.isElementSymbol( element ) ){
			var item = element.libraryItem;
			if( item.hasData( "signature" ) ){
				if( item.getData( "signature" ) == "EDAPT" && item.getData( "type" ) == "MagnetTarget" ){
					retval = true;
				}
			}
		}
		else if( element.symbolType ){
			if( element.hasData( "signature" ) ){
				if( element.getData( "signature" ) == "EDAPT" && element.getData( "type" ) == "MagnetTarget" ){
					retval = true;
				}
			}
		}
		return retval;
	};
	this.isCenterMarker				= function( element ){
		var retval = false;
		if( this.isElementSymbol( element ) ){
			var item = element.libraryItem;
			if( item.hasData( "signature" ) ){
				if( item.getData( "signature" ) == "EDAPT" && item.getData( "type" ) == "CenterMarker" ){
					retval = true;
				}
			}
		}
		else if( element.symbolType ){
			if( element.hasData( "signature" ) ){
				if( element.getData( "signature" ) == "EDAPT" && element.getData( "type" ) == "CenterMarker" ){
					retval = true;
				}
			}
		}
		return retval;
	};
	this.filterStageElements		= function( aFunction, aTimeline, isFilter, returnFirst, excludedElements ){
		/*
			Iterates through all elements in a given timeline at its current frame and executes a function for each of them.
			aFunction		- The function to be executed on each element in the timeline.
			aTimeline		- the context of execution.
			isFilter		- If true, the function result evaluates to boolean.
			returnFirst		- If true, returns the first finded/processed element.
			excludedElements	- Array of elements to exclude from search.
		*/
		
		// Arguments to pass when the function is call
		var args = [];
		for( var i=5; i<arguments.length; i++ ){
			args.push( arguments[ i ] );
		}
		var layers = aTimeline.layers;
		var cf = aTimeline.currentFrame;
		var i = 0;
		var retval = [];

		while ( i < layers.length ){
			var layer = layers [i];
			var frames = layer.frames;
			if( frames[ cf ] ){
				var elements = frames[ cf ].elements;
				var n = 0;
				while ( n < elements.length ){
					if( ! this.include( excludedElements, layer.frames[ cf ].elements[n] ) ){
						if( ! isFilter ){
							var res = aFunction.apply( this, [ layer.frames[ cf ].elements[n] ].concat( [ aTimeline, i, cf, n ] ).concat( args ) );
							if( res ){
								retval.push( res );
								if( returnFirst ){
									return retval;
								}
							}
						}
						else{
							if( aFunction.apply( this, [ layer.frames[ cf ].elements[n] ].concat( [ aTimeline, i, cf, n ] ).concat( args ) ) == true ){
								retval.push( layer.frames[ cf ].elements[n] );
								if( returnFirst ){
									return retval;
								}
							}
						}
					}
					n ++;
				}
			}
			i ++;
		}
		return retval;
	};
	this.getSelection				= function( doc, single ){
		if( single ){
			if( doc.selection.length == 1 ){
				return doc.selection[0];
			}
			return null;
		}
		else{
			return doc.selection;
		}
	};
	this.displayDialogue			= function( atitle, amessage, abuttons, url ){
		var messageLines = "";
		var match = new RegExp( "___", "gi" );
		var myFlash = "<flash width='430' height='24' src='../XULControls/Edapt url.swf'/>";
		amessage = amessage.replace( match, "\n" );
		var myLines = amessage.split( "\n" );
		for( var i=0; i<myLines.length; i++ ){
		  messageLines += ( '<label value="' + myLines[i] + '"/>');
		}
		var btn = ( abuttons ) ? abuttons : "accept cancel";
		var xmlContent = '<?xml version="1.0"?>' + 
		'<dialog buttons="' + btn + '" title="' + atitle + '    ' + Edapt.settings.version + '">' +
			'<vbox>' +
				messageLines + 
				'<spacer></spacer>' + 
				'<spacer></spacer>' + (( url ) ? myFlash : "") +
				'<spacer></spacer>' + 
				'<spacer></spacer>' +
				'<separator></separator>' +
				'<spacer></spacer>' + 
			'</vbox>' + 
		'</dialog>';
		var xmlFile = fl.configURI + "Commands/DialogueGUI.xml";
		var varFile = fl.configURI + "XULControls/vars.txt";
		var needToRemove = false;
		
		if ( FLfile.exists( xmlFile ) ) {
			FLfile.remove( xmlFile );	
		}
		if( url ){
			if ( FLfile.exists( varFile ) ) {
				FLfile.remove( varFile );	
			}
			FLfile.write( varFile, "url=" + url );
			needToRemove = true;
		}

		FLfile.write( xmlFile, xmlContent );
		var settings = fl.getDocumentDOM().xmlPanel( xmlFile );
		FLfile.remove( xmlFile );
		if( needToRemove ){
			FLfile.remove( varFile );
		}
		return settings;
	};
	this.displayOptionalMessageBox	= function( atitle, amessage, apropToChange ){
		var xmlContent = this.createOptionalMessageBox( atitle, amessage );
		var xmlFile = fl.configURI + "Commands/OptionalMessageBoxGUI.xml";
		if ( FLfile.exists( xmlFile ) ) {
			FLfile.remove( xmlFile );	
		}
		FLfile.write( xmlFile, xmlContent );
		var settings = fl.getDocumentDOM().xmlPanel( xmlFile );
		if( settings.dismiss == "accept" ){
			var fpath = fl.configURI + "Javascript/EDAPTsettings.txt";
			if( settings.DontShowAgain == "true" ){
				Edapt.settings[apropToChange].showAlert = false;
				this.serialize( Edapt.settings, fpath );	
			}	
		}
		FLfile.remove( xmlFile );	
	};
	this.createOptionalMessageBox	= function( atitle, amessage ){
		var messageLines = "";
		var myLines = amessage.split( "\n" );
		for( var i=0; i<myLines.length; i++ ){
		  messageLines += ( '<label value="'+myLines[i]+'"/>');
		}
		return '<?xml version="1.0"?>' + 
		'<dialog buttons="accept" title="' + atitle + '    ' + Edapt.settings.version + '">' +
			'<vbox>' + 
				messageLines + 
				'<spacer></spacer>' + 
				'<spacer></spacer>' + 
				'<spacer></spacer>' + 
				'<checkbox 	id="DontShowAgain" label="Don&#39;t show this message again" checked = "false"/>' +
				'<spacer></spacer>' + 
				'<separator></separator>' + 
				'<spacer></spacer>' + 
			'</vbox>' + 
		'</dialog>';
	};
	this.displayMessage				= function( msg, level ){
		switch( Edapt.settings.traceLevel ){
			case 0:
				break;
			case 1:
				if( level == 1 ){
					fl.trace( msg );
				}
				break;
			case 2:
				if( level == 1 || level == 2 ){
					fl.trace( msg );
				}
				break;
			default:
		}
	};
	this.getDialogueLink			= function( command, name ){
		return Edapt.settings[ command ].help[ name ].value;
	};
	this.indexOf					= function( array, element ){
		for( var i=0; i<array.length; i++ ){
			if( array[i] === element ){
				return i;
			}
		}
		return -1;
	};
	this.include					= function( arr, obj ){
		var cnt = arr.length;
		while( cnt -- ){
			if ( arr[cnt] == obj ){
				return true;
			}
		} 
	};
	this.defineDarkColors			= function(){
		return [ "#000099", "#990000", "#006600", "#333333", "#9900CC" ];
	};
	this.defineLightColors			= function(){
		return [ "#FF33FF", "#4FFF4F", "#FFFF00", "#CCCCCC", "#66FFFF" ];
	};
	this.moveCommandFiles			= function(){
		var fpath = fl.configURI + "Javascript/EDAPT Disabled Commands";
		var created = FLfile.createFolder( fpath );
		var ext = ".jsfl";
		for( var i=0; i < Edapt.settings.commands.settings.length; i++ ){
			var command = Edapt.settings.commands.settings[i];
			for( j=0; j< command.name.length; j++){
				var workingPath = fl.configURI + "Commands/" + command.name[j] + ext;
				var disabledPath = fl.configURI + "Javascript/EDAPT Disabled Commands/" + command.name[j] + ext;
				if( command.state == false ){
					if( ! FLfile.exists( disabledPath ) ){
						FLfile.copy( workingPath, disabledPath  );
						FLfile.remove( workingPath );	
					}		
				}
				else if( command.state == true ){
					if( ! FLfile.exists( workingPath ) ){
						FLfile.copy( disabledPath,  workingPath );
						FLfile.remove( disabledPath );
					}
				}
			}
		}
	};
	this.displayPanel				= function( commandName, xmlContent ){
		var xmlFile = fl.configURI + "Commands/" + commandName + ".xml";
		if ( FLfile.exists( xmlFile ) ) {
			FLfile.remove( xmlFile );	
		}
		FLfile.write( xmlFile, xmlContent );
		var settings = fl.getDocumentDOM().xmlPanel( xmlFile );
		FLfile.remove( xmlFile );
		return settings;
	};
	this.traceObject				= function( obj, maxlevel, level, props ){
		if( ! obj ){ 
			fl.trace( "***** null *****" );
			return;
		}
		if( ! maxlevel ){ maxlevel = 1 };
		if( ! level ){ level = 0 };
		
		var today = new Date();
		var h = today.getHours();
		var m = today.getMinutes();
		var s = today.getSeconds();
		var d = h + ":" + ( ( m < 10 ) ? "0" + m : m ) + ":" + ( ( s < 10 ) ? "0" + s : s );
		var cnt = 0;
		
		if( level == 0 ){ fl.trace( "***** " + ( ( obj.name ) ? obj.name : obj ) + " ( " + Object.prototype.toString.call( obj ).match(/^\[object (.*)\]$/)[1] +" ) " + d + " *****" ); }
		if( level < maxlevel ){
			var prefix = "";
			for( var i=0; i<level; i++ ){
				prefix += "\t";
			}
			for( var p in obj ){
				cnt ++;
				var prop = obj[ p ];
				var type = Object.prototype.toString.call( prop ).match(/^\[object (.*)\]$/)[1];
				if( typeof prop == "object" ){
					if( level == 0 ){ fl.trace( "------------------------------------------------" ); }
					if( props ){
						if( this.include( props, p ) ){
							fl.trace( cnt + ". " + prefix + p + "(" + type + " )" );
							this.traceObject( prop, maxlevel, level + 1 );
						}
					}
					else{
						fl.trace( cnt + ". " + prefix + p + "(" + type + " )" );
					}
					this.traceObject( prop, maxlevel, level + 1, props );
				}
				else{
					if( level == 0 ){ fl.trace( "------------------------------------------------" ); }
					if( props ){
						if( this.include( props, p ) ){
							fl.trace( cnt + ". " + prefix + p + ": " + prop + "( " + type + " )" );
						}
					}
					else{
						fl.trace( cnt + ". " + prefix + p + ": " + prop + "( " + type + " )" );
					}
				}
			}
		}
	};
	this.getFlashVersion			= function(){
		astring = fl.version;
		s1 = astring.split( " " )[ 1 ];
		return parseInt( s1.split( "," )[0] );
	};
	this.getProductVersion			= function(){
		var fpath = fl.configURI + "Javascript/EDAPTversion.txt";
		if ( FLfile.exists( fpath ) ) {
			var versionObj = this.deserialize( fpath );
			if( versionObj ){
				if( versionObj.hasOwnProperty( "main" ) && versionObj.hasOwnProperty( "sub" ) && versionObj.hasOwnProperty( "build" ) ){
					return versionObj.main + "." + versionObj.sub + "." + versionObj.build;
				}
				return "0.0.0";
			}
			return "0.0.0";
		}
		return "0.0.0";
	};
	this.serialize					= function( o, filePath ){
		/*Before we try to serialize the settings object,
		  we clone it and remove the unnecessary data */
		var obj = this.cloneObject( o );
		delete obj.version;
		delete obj.recordParentRegPoint.currentElement;
		var str = this.JSON.stringify( obj );
		if( FLfile.exists( filePath ) ){
			FLfile.remove( filePath );
		}
		FLfile.write( filePath, str );
	};
	this.deserialize				= function( filePath ){
		if( FLfile.exists( filePath ) ){
			var str = FLfile.read( filePath );
		}
		return this.JSON.parse( str );
	};
	this.cloneObject				= function( obj ){
		var clone = {};
		for( var i in obj ) {
			clone[i] = obj[i];
		}
		return clone;
	};
	this.JSON						= function(){
		var m = {
				'\b': '\\b',
				'\t': '\\t',
				'\n': '\\n',
				'\f': '\\f',
				'\r': '\\r',
				'"' : '\\"',
				'\\': '\\\\'
			},
			s = {
				'boolean': function (x) {
					return String(x);
				},
				number: function (x) {
					return isFinite(x) ? String(x) : 'null';
				},
				string: function (x) {
					if (/["\\\x00-\x1f]/.test(x)) {
						x = x.replace(/([\x00-\x1f\\"])/g, function(a, b) {
							var c = m[b];
							if (c) {
								return c;
							}
							c = b.charCodeAt();
							return '\\u00' +
								Math.floor(c / 16).toString(16) +
								(c % 16).toString(16);
						});
					}
					return '"' + x + '"';
				},
				object: function (x) {
					if (x) {
						var a = [], b, f, i, l, v;
						if (x instanceof Array) {
							a[0] = '[';
							l = x.length;
							for (i = 0; i < l; i += 1) {
								v = x[i];
								f = s[typeof v];
								if (f) {
									v = f(v);
									if (typeof v == 'string') {
										if (b) {
											a[a.length] = ',';
										}
										a[a.length] = v;
										b = true;
									}
								}
							}
							a[a.length] = ']';
						} else if (x instanceof Object) {
							a[0] = '{';
							for (i in x) {
								v = x[i];
								f = s[typeof v];
								if (f) {
									v = f(v);
									if (typeof v == 'string') {
										if (b) {
											a[a.length] = ',';
										}
										a.push(s.string(i), ':', v);
										b = true;
									}
								}
							}
							a[a.length] = '}';
						} else {
							return;
						}
						return a.join('');
					}
					return 'null';
				}
			};
		return {
			copyright: '(c)2005 JSON.org',
			license: 'http://www.crockford.com/JSON/license.html',
	/*
		Stringify a JavaScript value, producing a JSON text.
	*/
			stringify: function (v) {
				var f = s[typeof v];
				if (f) {
					v = f(v);
					if (typeof v == 'string') {
						return v;
					}
				}
				return null;
			},
	/*
		Parse a JSON text, producing a JavaScript value.
		It returns false if there is a syntax error.
	*/
			parse: function (text) {
				try {
					return !(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(
							text.replace(/"(\\.|[^"\\])*"/g, ''))) &&
						eval('(' + text + ')');
				} catch (e) {
					return false;
				}
			}
		};
	}();
	
	// SETTINGS GUI
	this.loadCommandStates			= function(){
		var bstates = [];
		for( var i=0; i< Edapt.settings.commands.settings.length; i++ ){
			bstates.push( fl.xmlui.get( Edapt.settings.commands.settings[i].id ) );
		}
		return bstates;
	};
	this.loadDefaultSettingsColors	= function(){
		var lights = Edapt.settings.layerColors.light.colors;
		var darks = Edapt.settings.layerColors.dark.colors;
		for( var i=0; i<lights.length; i++ ){
			fl.xmlui.set( "light"+(i+1), lights[i] );
		}
		for( var i=0; i<darks.length; i++ ){
			fl.xmlui.set( "dark"+(i+1), darks[i] );
		}
	};	
	this.resetToDefaultSettingsColors = function(){
		var lights = Edapt.utils.defineLightColors();
		var darks = Edapt.utils.defineDarkColors();
		for( var i=0; i<lights.length; i++ ){
			fl.xmlui.set( "light"+(i+1), lights[i] );
		}
		for( var i=0; i<darks.length; i++ ){
			fl.xmlui.set( "dark"+(i+1), darks[i] );
		}
	};					
	this.createCommandsPanel		= function(){
		var cmd = Edapt.settings.commands.settings;
		var sep = "  /  ";
		var xmlPanel = '<?xml version="1.0"?>' +
		'<dialog title="Manage Commands" >' +
			'<vbox>' +
				'<spacer></spacer>' +
				'<label value="Show / Hide selected commands from the &quot;Commands&quot; menu. Enabling or disabling commands requires Flash to be restarted." />' +
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
							'<checkbox id="'+ cmd[0].id +'" label="'+ cmd[0].name.join( sep ) +'" checked="'+ cmd[0].state +'"/>' +  	// 01 Convert To Symbol Preserving Layers
							'<checkbox id="'+ cmd[5].id +'" label="'+ cmd[5].name.join( sep ) +'" checked="'+ cmd[5].state +'" />' + 	// 08 Layer Outlines Toggle
							'<checkbox id="'+ cmd[10].id +'" label="'+ cmd[10].name.join( sep ) +'" checked="'+ cmd[10].state +'" />' + // 13 Enter Symbol At Current Frame
						'</row>' +
						
						'<row>' +
							'<checkbox id="'+cmd[1].id+'" label="'+cmd[1].name.join( sep ) +'" checked="'+cmd[1].state+'" />' +			// 02 LB Find And Replace
							'<checkbox id="'+cmd[6].id+'" label="'+cmd[6].name.join( sep ) +'" checked="'+cmd[6].state+'" />' +			// 09 Layer Guide Toggle
							'<checkbox id="'+cmd[11].id+'" label="'+cmd[11].name.join( sep ) +'" checked="'+cmd[11].state+'" />' +		// 16 Swap Multiple Symbols
						'</row>' +
						
						'<row>' +
							'<checkbox id="'+cmd[2].id+'" label="'+cmd[2].name.join( sep ) +'" checked="'+cmd[2].state+'" />' +			// 03 LB Prefix Suffix
							'<checkbox id="'+cmd[7].id+'" label="'+cmd[7].name.join( sep ) +'" checked="'+cmd[7].state+'" />' +			// 10 Layer Color Dark
							'<checkbox id="'+cmd[12].id+'" label="'+cmd[12].name.join( sep ) +'" checked="'+cmd[12].state+'" />' +		// 17 Sync Symbols to Timeline
						'</row>' +
						
						'<row>' +
							'<checkbox id="'+cmd[3].id+'" label="'+cmd[3].name.join( sep ) +'" checked="'+cmd[3].state+'" />' +			// 04 LB Trim Characters
							'<checkbox id="'+cmd[8].id+'" label="'+cmd[8].name.join( sep ) +'" checked="'+cmd[8].state+'" />' +			// 11 Layer Color Light
							'<checkbox id="'+cmd[13].id+'" label="'+cmd[13].name.join( sep ) +'" checked="'+cmd[13].state+'" />' +		// 20 Smart Transform
						'</row>' +
						
						'<row>' +
							'<checkbox id="'+cmd[4].id+'" label="'+cmd[4].name.join( sep ) +'" checked="'+cmd[4].state+'" />' +			// 05 LB Enumeration
							'<checkbox id="'+cmd[9].id+'" label="'+cmd[9].name.join( sep ) +'" checked="'+cmd[9].state+'" />' +			// 12 Set Reg Point To Transform Point
							'<checkbox id="'+cmd[14].id+'" label="'+cmd[14].name.join( sep ) +'" checked="'+cmd[14].state+'" />' +		// 21 EDAPT Shortcuts Map
						'</row>' +

					'</rows>' +
				'</grid>' +
				
				'<spacer></spacer>' +
				'<spacer></spacer>' +
				'<spacer></spacer>' +
				'<grid>' +
					'<columns>' +
						'<column/>' +
						'<column/>' +
					'</columns>' +
					'<rows>' +
						'<row>' +
							'<label value="" />'+
							'<checkbox id="'+cmd[15].id+'" label="'+cmd[15].name.join( sep ) +'" checked="'+cmd[15].state+'" />' +		// 06 Next Frame In Symbol and 07 Prev Frame In Symbol
						'</row>' +
						'<row>' +
							'<label value="These commands work in pairs                                      " />' +
							'<checkbox id="'+cmd[16].id+'" label="'+cmd[16].name.join( sep ) +'" checked="'+cmd[16].state+'" />' +		// 14 Record Parent Reg Pointand 15 Set Selection Pivot To Parent Reg Point
						'</row>' +
						'<row>' +
							'<label value="" />' +
							'<checkbox id="'+cmd[17].id+'" label="'+cmd[17].name.join( sep ) +'" checked="'+cmd[17].state+'" />' +		// 18 Create Snap Object and 19 Smart Snap
						'</row>' +
					'</rows>' +
				'</grid>' +
				'<property id="allBoxes" value="false" ></property>' +
				'<button label="Check / Uncheck all Commands" oncreate="loadCommandStates()" oncommand="invertCommandsState()" />' +
			'</vbox>' +
			
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
				'</columns>' +
				'<row>' +
					'<label value="                                                                               " />' +
					'<label value="                                                                               " />' +
					'<hbox>' +
						'<button label="Save and Close" oncommand = "loadCommandStates( true );"/>' +		
						'<button label="Cancel" oncommand = "fl.xmlui.cancel();"/>' +
					'</hbox>' +
				'</row>' +
			'</grid>'+

			'<script>' +
				'var state = false;' +
				'function loadCommandStates( aclose ){'+
					'var bstates = Edapt.utils.loadCommandStates();'+
					'if( Edapt.utils.include( bstates, "true" ) ){'+
						'state = true;'+
					'}'+
					'fl.xmlui.set( "allBoxes", bstates );'+
					'if( aclose ){'+
						'fl.xmlui.accept();' +
					'}'+
				'}' +
				'function invertCommandsState(){' +
					'state = !state;' +
					'Edapt.utils.setCommandBoxes( state );' +
				'}' +
				'function confirmCommandsDialogue(){' +
					'fl.trace( "confirmCommandsDialogue" );' +
				'}' +
			'</script>'+
		'</dialog>';
		var settings = this.displayPanel( "ManageCommands", xmlPanel );
		if( settings.dismiss == "accept" ){
			var fpath = fl.configURI + "Javascript/EDAPTsettings.txt";
			var needToMove = null;
			// Check for command states
			var states = settings.allBoxes.split( "," );
			for( var i=0; i<states.length; i++ ){
				var comm = Edapt.settings.commands.settings[i];
				if( comm.state != Boolean( states[i] == "true" ) ){
					needToMove = true;
					break;
				}
			}
			for( var i=0; i < Edapt.settings.commands.settings.length; i++  ){
				var val = settings[ Edapt.settings.commands.settings[i].id ];
				Edapt.settings.commands.settings[i].state = Boolean( val === "true");
			}
			if( needToMove ){
				this.moveCommandFiles();
				this.serialize( Edapt.settings, fpath );	
				if( Edapt.settings.commands.showAlert == true ){
					this.displayOptionalMessageBox( "Restart", "Hiding or showing commands requires Flash to be restarted." + "\n" + "All command shortcuts will be functional after the next restart.", "commands" );
				}
			}
		}
	};
	this.setCommandBoxes			= function( astate ){
		var cnt = Edapt.settings.commands.settings.length;
		while( cnt -- ){
			fl.xmlui.set( Edapt.settings.commands.settings[cnt].id, astate );
		}
	};	
}


