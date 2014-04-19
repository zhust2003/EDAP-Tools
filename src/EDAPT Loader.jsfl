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

	version: 2.5.0
*/
Edapt.drawing = {
    ScreenMarker: function( x, y, delay ){
        if( !x && !y ){ x = y = 0; }
        this.delay = delay;
        this.doc = 	fl.getDocumentDOM();
        this.center = { "x":x, "y":y };
        this.scale = 1 / this.doc.zoomFactor;
        this.setLocation = function( x, y ){
            this.center.x = x;
            this.center.y = y;
            this.scale = 1 / this.doc.zoomFactor;
        };
        this.draw = function( w, h ){
            fl.drawingLayer.beginFrame();
            fl.drawingLayer.setColor( 0xff0000 );
            var startX = this.center.x - ( this.scale * w );
            this.__fill__rect( startX, this.center.y - this.scale * h, startX + this.scale * w * 2, this.center.y + this.scale * h );
            fl.drawingLayer.endFrame();
            if( this.delay ){
                this.__sleep( this.delay );
            }
            this.end();
        };
        this.end = function(){
            fl.drawingLayer.beginFrame();  // Clear the drawing
            fl.drawingLayer.endDraw();
        };
        this.__sleep = function( milliseconds ) {
            var start = new Date().getTime();
            for ( var i = 0; i < 1e7; i++) {
                if ((new Date().getTime() - start) > milliseconds ){
                    break;
                }
            }
        };
        this.__draw__polygon = function(){};
        this.__fill__rect = function( x1, y1, x2, y2 ){
            var n, start, end;
            if( Math.abs( x1 - x2 ) > Math.abs( y1 - y2 ) ){
                // X is bigger than y, so iterate over y
                start = Math.min( y1, y2 );
                end = Math.max( y1, y2 );
                for(n = start; n < end; n += this.scale){
                    fl.drawingLayer.moveTo(x1, n);
                    fl.drawingLayer.lineTo(x2, n);
                }
            }else{
                // Y is bigger than X, so iterate over X
                start = Math.min(x1, x2);
                end = Math.max(x1, x2);
                for( n = start; n < end; n += this.scale ){
                    fl.drawingLayer.moveTo(n, y1);
                    fl.drawingLayer.lineTo(n, y2);
                }
            }
        };
    }
};
Edapt.utils = new Utils();
Edapt.utils.initialize();
function Utils() {
	this.initialize					= function(){
		var ver = this.getProductVersion();
		var fpath = fl.configURI + "Javascript/EDAPT." + ver + "/settings.txt";
		if ( FLfile.exists( fpath ) ) {
			Edapt.settings = this.deserialize( fpath );
			if( ! Edapt.settings ){
				Edapt.settings = {};
				this.createSettings( Edapt.settings );
				this.serialize( Edapt.settings, fpath );
			}
			else{
				// reset some values 
				Edapt.settings.layerColors.light.index = -1;
				Edapt.settings.layerColors.dark.index = -1;
			}
		}
		else{
			Edapt.settings = {};
			FLfile.createFolder( fl.configURI + "Javascript/EDAPT." + ver );	
			this.createSettings( Edapt.settings );
			this.serialize( Edapt.settings, fpath );
		}
		Edapt.settings.version = this.getProductVersion();
		if( Edapt.settings.runFirstTime ){
			Edapt.utils.showWelcomeDialogue();
		}
	};
	this.createSettings				= function( context ){
		context.traceLevel = 1;			// 0 = none, 1 = errors only, 2 = all
		context.bgColor = "0x156FC3";	// Web-site accent colour
		context.runFirstTime = true;	// Use for welcome/update dialogue

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
		context.Enumeration.useFolderNames = false;
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

		// Smart Transform Point CW /CCW
		context.SmartTransformPoint = new Object();
		context.SmartTransformPoint.showAlert = true;
		context.SmartTransformPoint.modifierUsed = false;

		//CreateSnapObject
		context.createMagnetTarget = new Object();
		context.createMagnetTarget.targetLayerName = "Magnet Target(s)";
		context.createMagnetTarget.markerLayerName = "Center Marker";
		context.createMagnetTarget.visibleTargets = false;
		context.createMagnetTarget.visibleMarkers = true;
		context.createMagnetTarget.folderName = "EDAPT objects";
		context.createMagnetTarget.showAlert = true;

		// Convert to Keyframes
		context.ConvertToKeyframes = new Object();
		context.ConvertToKeyframes.recursive = true;
		context.ConvertToKeyframes.restore = false;
		context.ConvertToKeyframes.showAlert = true;
		
		
		//Smart Magnet Joint
		context.smartMagnetJoint = new Object();
		context.smartMagnetJoint.distanceThreshold = 50;
		context.smartMagnetJoint.depthLevel = 2;

		context.metadataNames = { SMR:"rigData", MT:"MT", SGC:"SGC" };
		
		// SMR panel
		context.smartMagnetRig = new Object();
		context.smartMagnetRig.snapThreshold = 4;
		context.smartMagnetRig.folderPath = "";
		context.smartMagnetRig.help = new Object();
		context.smartMagnetRig.help.A = {show:true, value:"http://flash-powertools.com/smart-magnet-rigs/"};
		
		// SGC panel
		context.smartGraphicControl = new Object();
		context.smartGraphicControl.imageSize = 128;
		context.smartGraphicControl.defaultThumbnailSize = 64;
		context.smartGraphicControl.folderPath = "Smart Graphic Control";
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
		context.commands.settings.push( { id:"comm19", name:["21 Convert To Keyframe Advanced"], state:true } );				//14

		context.commands.settings.push( { id:"pair1",  name:["06 Next Frame In Symbol", "07 Prev Frame In Symbol" ], state:true } );			//15
		context.commands.settings.push( { id:"pair2",  name:["14 Smart Transform Point CW", "15 Smart Transform Point CCW"], state:true } );	//16
		context.commands.settings.push( { id:"pair3",  name:["18 Create Magnet Target", "19 Smart Magnet Joint"], state:true } );				//17	
	};
	this.toStage					= function( doc, apoint ){
		if( ! doc ){ return null; }
		var mat = doc.viewMatrix;
		return { x:apoint.x * mat.a + apoint.y * mat.c + mat.tx, y:apoint.x * mat.b + apoint.y * mat.d + mat.ty };
	};
	this.isElementSymbol			= function( element ){
		if( ! element ){ return false; }
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
			var dataname = Edapt.settings.metadataNames;
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
			var dataname = Edapt.settings.metadataNames;
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
	this.getLayerPrevKey			= function( alayer, sf ){
		if( ! alayer ) return null;
		var fi = ( ( sf - 1 ) < 0 ) ? 0 : sf - 1;
		return alayer.frames[ fi ].startFrame;
	};
	this.getLayerNextKey			= function( alayer, sf ){
		if( ! alayer ) return null;
		var fr = alayer.frames[ sf ];
		return fr.startFrame + fr.duration;
	};
	this.filterStageElements		= function( aFunction, aTimeline, isFilter, returnFirst, excludedElements ){
		/*
			Iterates through all elements in a given timeline at its current frame and executes a function for each of them.
			aFunction		- The function to be executed on each element in the timeline.
			aTimeline		- the context of execution.
			isFilter		- If true, the function result evaluates to boolean.
			returnFirst		- If true, returns the first finded/processed element.
			excludedElements	- Array of elements to exclude from processing.
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
			xvars = "url=" + url + "&" + "color=" + Edapt.settings.bgColor;
			FLfile.write( varFile, xvars ); //0x156FC3
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
			var fpath = fl.configURI + "Javascript/EDAPT." + Edapt.settings.version + "/settings.txt";
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
	this.isArraysEqual				= function( arr1, arr2 ){
		if( arr1.length != arr2.length ){ return false; }
		for( var i=0; i<arr1.length; i++ ){
			if( arr1[i] != arr2[i] ){
				return false;
			}
		}
		return true;
	};
	this.defineDarkColors			= function(){
		return [ "#000099", "#990000", "#006600", "#333333", "#9900CC" ];
	};
	this.defineLightColors			= function(){
		return [ "#FF33FF", "#4FFF4F", "#FFFF00", "#CCCCCC", "#66FFFF" ];
	};
	this.moveCommandFiles			= function(){
		var fpath = fl.configURI + "Javascript/EDAPT." + Edapt.settings.version + "/Disabled Commands";
		var created = FLfile.createFolder( fpath );
		var ext = ".jsfl";
		for( var i=0; i < Edapt.settings.commands.settings.length; i++ ){
			var command = Edapt.settings.commands.settings[i];
			for( j=0; j< command.name.length; j++){
				var workingPath = fl.configURI + "Commands/" + command.name[j] + ext;
				var disabledPath = fl.configURI + "Javascript/EDAPT." + Edapt.settings.version + "/Disabled Commands/" + command.name[j] + ext;
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
		ver = fl.version;
		s1 = ver.split( " " )[ 1 ];
		return parseFloat( s1.split( "," )[0] );
	};
	this.getProductVersion			= function(){
		var fpath = fl.configURI + "Tools/EDAPTversion.txt";
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
	
	// MANAGE COMMANDS
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
		var ver = Edapt.settings.version;
		var cmd = Edapt.settings.commands.settings;
		var sep = "  /  ";
		var xmlPanel = '<?xml version="1.0"?>' +
		'<dialog title="Manage Commands  -  ' + ver + '">' +
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
							'<checkbox id="'+cmd[14].id+'" label="'+cmd[14].name.join( sep ) +'" checked="'+cmd[14].state+'" />' +		// 21 Convert To Keyframe Advanced.jsfl
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
			var fpath = fl.configURI + "Javascript/EDAPT." + Edapt.settings.version + "/settings.txt";
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

	// VIEW SHORTCUTS
	this.viewShortcutsMap			= function(){
		var ver = Edapt.settings.version;
		var xmlPanel = 
		'<dialog buttons="accept" title="EDAPT Shortcuts Map  -  ' + ver + '">' +
			'<vbox>' +
				'<flash width="920" height="540" src="../XULControls/EDAPT Shortcuts Map.swf"/>' +
				'<spacer></spacer>' +
				'<separator></separator>' +
				'<spacer></spacer>' +
			'</vbox>' +
		'</dialog>';
		this.displayPanel( "EDAPTShortcutsMap", xmlPanel );
	};
	
	// WELCOME SCREEN
	this.showWelcomeDialogue = function(){
		var ver = this.getProductVersion();
		var msg = 
		'Welcome to Electric Dog Flash Animation Power Tools - ' + ver + "!\n" + "\n" +
		'For instant keyboard access to the Commands activate EDAPT Shortcuts (or assign your own)' + "\n" +
		'- Windows: Edit > Keyboard Shortcuts... Current Set drop-down menu > EDAPT Shortcuts' + "\n" +
		'- Mac: Flash > Keyboard Shortcuts... Current Set drop-down menu > EDAPT Shortcuts' + "\n" + "\n" +
		
		'All commands are under the Commands menu.' + "\n" +
		'To start "Smart Magnet Rig" panel, choose Window > Other Panels > Smart Magnet Rig.' + "\n" + "\n" +
		
		'For more information visit "http://flash-powertools.com/installation-support/".';
		
		fl.trace( msg );
		Edapt.settings.runFirstTime = false;
		var fpath = fl.configURI + "Javascript/EDAPT." + ver + "/settings.txt";
		if ( FLfile.exists( fpath ) ){
			this.serialize( Edapt.settings, fpath );
		}
	}
}

Edapt.SmartTransform = {
	//common
	stpf:-1,
	stpi:-1,
	couner:0,
	translatePositionToParent:		function( parent, child ){
		var newX = child.matrix.tx * parent.matrix.a + child.matrix.ty *  parent.matrix.c +  parent.matrix.tx;
		var newY = child.matrix.ty * parent.matrix.d + child.matrix.tx *  parent.matrix.b +  parent.matrix.ty;
		return { "x":newX, "y":newY };
	},
	drawMarker:						function( doc, currentObject, size, translate ){
		var newPos;
		if( ! translate ){
			newPos = { "x":currentObject.element.matrix.tx, "y":currentObject.element.matrix.ty };
		}else{
			newPos = this.translatePositionToParent( currentObject.parent, currentObject.element );
		}
		doc.getTransformationPoint(); // Force Flash to apply current transformation correctly
		doc.rotateSelection( 0 );	  // Force Flash to redraw the screen;
		doc.setTransformationPoint( newPos );
		var markPoint = Edapt.utils.toStage( doc, newPos );
		var marker = new Edapt.drawing.ScreenMarker( markPoint.x, markPoint.y, 250 );
		marker.draw( size, size );
	},
	sortByClockwise:				function( a, b ){
		return b.theta - a.theta;
	},
	
	// reg points
	prepareSelectionRegPoint:		function( aSelection ){
		var retval = [];
		var left   = Infinity;
		var top    = Infinity;
		var right  = -Infinity;
		var bottom = -Infinity;
		var i;
		for( i = 0; i < aSelection.length; i++ ){
			left   = Math.min( aSelection[ i ].matrix.tx, left );
			right  = Math.max( aSelection[ i ].matrix.tx, right );
			top    = Math.min( aSelection[ i ].matrix.ty, top );
			bottom = Math.max( aSelection[ i ].matrix.ty, bottom );
		}
		var center = { "x": left + ( right - left ) / 2, "y": top + ( bottom - top ) / 2 };
		for( i = 0; i < aSelection.length; i++ ){
			var element = aSelection[ i ];
			var item = {};
			item.element = element;
			item.theta = Math.atan2( element.matrix.tx - center.x, element.matrix.ty - center.y );
			retval.push( item );
		}
		retval.sort( this.sortByClockwise );
		return retval;
	},
	jumpToNextRegPoint:				function( doc, sel, dest ){
		var sorted = this.prepareSelectionRegPoint( sel );
		if( dest == "cw" ){
			if( this.stpf < sorted.length - 1 ){
				this.stpf ++;
			}
			else{
				this.stpf = 0;
			}
		}else if( dest == "ccw" ){
			if( this.stpf > 0 ){
				this.stpf --;
			}
			else{
				this.stpf  = sorted.length - 1;
			}	
		}
		var currentObject = sorted[ this.stpf ];
		this.drawMarker( doc, currentObject, 14, false );
	},
	selectNextRegPoint:				function( doc, dest, commandname ){
		var sel = doc.selection;
		if( sel.length > 1 ){
			this.jumpToNextRegPoint( doc, sel, dest );
			this.couner ++;
		}
		else{
			Edapt.utils.displayMessage( commandname + " : This command works with multiple selection only", 2 );
		}	
	},

	// magnet targets
	isSnapObject:					function( element, aTimeline, currentLayernum, cf, n ){
		if( Edapt.utils.isMagnetTarget( element ) ){
			var remove = false;
			var layer = aTimeline.layers[ currentLayernum ];
			if( layer.frames[ cf ].startFrame != cf ){
				aTimeline.currentLayer = currentLayernum;
				aTimeline.convertToKeyframes( cf );
				remove = true;
			}
			var el = layer.frames[ cf ].elements[n];
			if( remove ){
				aTimeline.clearKeyframes( cf );
			}
			return el;
		}
		else{
			return null;
		}
	},
	getSnapObjects:					function( element ){
		if( Edapt.utils.isElementSymbol( element ) ){
			return Edapt.utils.filterStageElements( this.isSnapObject, element.libraryItem.timeline, false, false, [] );
		}
		return [];
	},
	prepareSelectionMagnetTarget:	function( aSelection ){
		var retval = [];
		var left   = Infinity;
		var top    = Infinity;
		var right  = -Infinity;
		var bottom = -Infinity;
		var i, j, snaps, element, newPos;
		for( i = 0; i < aSelection.length; i++ ){
			element = aSelection[ i ];
			snaps = this.getSnapObjects( element );
			for( j=0; j<snaps.length; j++ ){
				newPos = this.translatePositionToParent( element, snaps[ j ] );
				left   = Math.min( newPos.x, left );
				right  = Math.max( newPos.x, right );
				top    = Math.min( newPos.y, top );
				bottom = Math.max( newPos.y, bottom );
			}
		}
		var center = { "x": left + ( right - left ) / 2, "y": top + ( bottom - top ) / 2 };

		for( i = 0; i < aSelection.length; i++ ){
			element = aSelection[ i ];
			element.libraryItem.timeline.currentFrame = element.firstFrame;
			snaps = this.getSnapObjects( element );
			for( j=0; j<snaps.length; j++ ){
				newPos = this.translatePositionToParent( element, snaps[ j ] );
				var item = {};
				item.element = snaps[ j ];
				item.theta = Math.atan2( newPos.x - center.x, newPos.y - center.y );
				item.parent = element;
				retval.push( item );
			}
		}
		retval.sort( this.sortByClockwise );
		return retval;
	},
	jumpToNextMagnetTarget:			function( doc, sel, dest ){
		var sorted = this.prepareSelectionMagnetTarget( sel );
		if( sorted.length > 0 ){
			if( dest == "cw" ){
				if( this.stpi < sorted.length - 1 ){
					this.stpi ++;
				}
				else{
					this.stpi = 0;
				}	
			}else if( dest == "ccw" ){
				if( this.stpi > 0 ){
					this.stpi --;
				}
				else{
					this.stpi  = sorted.length - 1;
				}	
			}
			var currentObject = sorted[ this.stpi ];
			this.drawMarker( doc, currentObject, 10, true );
		}
	},
	selectNextMagnetTarget:			function( doc, dest, commandname ){
		var sel = doc.selection;
		if( sel.length > 1 ){
			Edapt.settings.SmartTransformPoint.modifierUsed = true;
			Edapt.utils.serialize( Edapt.settings, fl.configURI + "Javascript/EDAPT." + Edapt.settings.version + "/settings.txt" );
			this.jumpToNextMagnetTarget( doc, sel, dest );
		}
		else{
			Edapt.utils.displayMessage( commandname + " : This command works with multiple selection only", 2 );
		}
	}
};

Edapt.TweenSplitter = {
	map:							function( value, start1, stop1, start2, stop2) {
		return start2 + ( stop2 - start2 ) * ( ( value - start1 ) / ( stop1 - start1 ) );
	},
	lerp:							function( a, b, x ){
	  return a + x * ( b - a );
	},
	getNormalized:					function( arr ){
		var normalised = [];
		var p = arr[ 0 ];
		var mx = Number.MAX_VALUE;
		var my = mx;
		var MX = -Number.MAX_VALUE;
		var MY = MX;
		for ( var i = 0; i < arr.length; i++ ) {
		  p = arr[ i ];
		  if( p.x < mx ) { mx = p.x; }
		  if( p.y < my ) { my = p.y; }
		  if( p.x > MX ) { MX = p.x; }
		  if( p.y > MY ) { MY = p.y; }
		  normalised[ i ] = p;
		}
		for ( var i = 0; i < arr.length; i++) {
		  normalised[ i ].x = this.map( normalised[ i ].x, mx, MX, 0, 1 );
		  normalised[ i ].y = this.map( normalised[ i ].y, my, MY, 0, 1 );
		}
		return normalised;
	},
	modifyFrameSelection:			function( atimeline, selFrames ){
		var map = {};
		var retval = {};
		for( var i=0; i < selFrames.length; i+=3 ){
			var li = selFrames[ i ];
			var st = selFrames[ i+1 ];
			var en = selFrames[ i+2 ];
			var myLayer = atimeline.layers[ li ];
			if( ! retval.hasOwnProperty( li ) ){
				retval[ li ] = { sel:[], newsel:[li, Number.MAX_VALUE, - Number.MAX_VALUE ], keys:[] };
			}
			retval[ li ].newsel[1] = Math.min( retval[ li ].newsel[1], st );
			retval[ li ].newsel[2] = Math.max( retval[ li ].newsel[2], en );
			retval[ li ].sel.push( li, st, en );
		}
		for( var p in retval ){
			var li = parseInt( p );
			var st = retval[ p ].newsel[1];
			var en = retval[ p ].newsel[2];
			var myLayer = atimeline.layers[ li ];
			for( var j = st; j < en; j++ ){
				var myFrame = myLayer.frames[ j ];
				if( myFrame ){
					if( j === myFrame.startFrame ){
						retval[ p ].keys.push( li, j, j+1 );
					}
				}
			}
		}	
		return retval;
	},
	getEaseFromFrame:				function ( aframe ){
		var props = ( aframe.hasCustomEase ) ? ( aframe.useSingleEaseCurve ) ? [ "all" ] : [ "position", "rotation", "scale", "color", "filters" ] : [ "all" ];
		var retval = {};
		for( var i = 0; i < props.length; i++ ){
			var xprop = props[ i ];
			var ease = aframe.getCustomEase( xprop );
			if( ease.length === 0 ){
				ease = [	{"x":0,"y":0}, {"x":0.3333333333333333,"y":0.3333333333333333}, {"x":0.6666666666666666,"y":0.6666666666666666}, {"x":1,"y":1}	];
			}
			retval[ xprop ] = ease;
		}
		return retval;
	},
	Bezier:							function( apoints ){
		this.id = -1;
		this.x0 = apoints[0].x; // X coordinate of the first point.
		this.y0 = apoints[0].y; // Y coordinate of the first point.
		this.x1 = apoints[1].x; // X coordinate of the first control point.
		this.y1 = apoints[1].y; // Y coordinate of the first control point.
		this.x2 = apoints[2].x; // X coordinate of the second control point.
		this.y2 = apoints[2].y; // Y coordinate of the second control point.
		this.x3 = apoints[3].x; // X coordinate of the end point.
		this.y3 = apoints[3].y; // Y coordinate of the end point.
		this.points = apoints;

		this.clone						= function(){
			return new Edapt.TweenSplitter.Bezier( [ {   x:this.x0, y:this.y0 },
								   { x:this.x1, y:this.y1 },
								   { x:this.x2, y:this.y2 },
								   { x:this.x3, y:this.y3 } ] );
		};
		this.flip						= function(){
			var temp = this.x0;
			this.x0 = this.x3;
			this.x3 = temp;
			temp = this.y0;
			this.y0 = this.y3;
			this.y3 = temp;

			temp = this.x1;
			this.x1 = this.x2;
			this.x2 = temp;
			temp = this.y1;
			this.y1 = this.y2;
			this.y2 = temp;
			this.points = [ {x:this.x0, y:this.y0}, {x:this.x1, y:this.y1}, {x:this.x2, y:this.y2},{x:this.x3, y:this.y3} ];
		};
		this.getPoint					= function( t ) {
		  // Special case start and end
		  if ( t == 0 ) {
			return { x:this.x0, y:this.y0 };
		  } else if ( t == 1 ) {
			return { x:this.x3, y:this.y3 };
		  }

		  // Step one - from 4 points to 3
		  var ix0 = Edapt.TweenSplitter.lerp( this.x0, this.x1, t );
		  var iy0 = Edapt.TweenSplitter.lerp( this.y0, this.y1, t );

		  var ix1 = Edapt.TweenSplitter.lerp( this.x1, this.x2, t );
		  var iy1 = Edapt.TweenSplitter.lerp( this.y1, this.y2, t );

		  var ix2 = Edapt.TweenSplitter.lerp( this.x2, this.x3, t );
		  var iy2 = Edapt.TweenSplitter.lerp( this.y2, this.y3, t );

		  // Step two - from 3 points to 2
		  ix0 = Edapt.TweenSplitter.lerp( ix0, ix1, t );
		  iy0 = Edapt.TweenSplitter.lerp( iy0, iy1, t );

		  ix1 = Edapt.TweenSplitter.lerp( ix1, ix2, t );
		  iy1 = Edapt.TweenSplitter.lerp( iy1, iy2, t );

		  // Final step - last point
		  return { x:Edapt.TweenSplitter.lerp( ix0, ix1, t ), y:Edapt.TweenSplitter.lerp( iy0, iy1, t ) };
		};
		this.getCurve					= function(){
			return [{ x:this.x0, y:this.y0 },
					{ x:this.x1, y:this.y1 },
					{ x:this.x2, y:this.y2 },
					{ x:this.x3, y:this.y3 } ];
		};
		this.split						= function( t ){
			var a = this.clone();
			var b = this.clone();
			a.subdivideLeft( t );
			b.subdivideRight( t );
			return [ a, b ];
		};
		this.subdivideLeft				= function( t ){
		  if ( t == 1 ){
			return;
		  }
		  // Step one - from 4 points to 3
		  var ix0 = Edapt.TweenSplitter.lerp( this.x0, this.x1, t );
		  var iy0 = Edapt.TweenSplitter.lerp( this.y0, this.y1, t );

		  var ix1 = Edapt.TweenSplitter.lerp( this.x1, this.x2, t );
		  var iy1 = Edapt.TweenSplitter.lerp( this.y1, this.y2, t );

		  var ix2 = Edapt.TweenSplitter.lerp( this.x2, this.x3, t );
		  var iy2 = Edapt.TweenSplitter.lerp( this.y2, this.y3, t );

		  // Collect our new x1 and y1
		  this.x1 = ix0;
		  this.y1 = iy0;

		  // Step two - from 3 points to 2
		  ix0 = Edapt.TweenSplitter.lerp( ix0, ix1, t );
		  iy0 = Edapt.TweenSplitter.lerp( iy0, iy1, t );

		  ix1 = Edapt.TweenSplitter.lerp(ix1, ix2, t);
		  iy1 = Edapt.TweenSplitter.lerp(iy1, iy2, t);

		  // Collect our new x2 and y2
		  this.x2 = ix0;
		  this.y2 = iy0;

		  // Final step - last point
		  this.x3 = Edapt.TweenSplitter.lerp( ix0, ix1, t );
		  this.y3 = Edapt.TweenSplitter.lerp( iy0, iy1, t );
		  this.points = [ {x:this.x0, y:this.y0}, {x:this.x1, y:this.y1}, {x:this.x2, y:this.y2},{x:this.x3, y:this.y3} ];
		};
		this.subdivideRight				= function( t ){
		  this.flip();
		  this.subdivideLeft( 1 - t );
		  this.flip();
		};
		this.solvePositionFromXValue	= function( xVal ){
			// Desired precision on the computation.
			var epsilon = 1e-6;

			// Initial estimate of t using linear interpolation.
			var t = ( xVal - this.x0 ) / ( this.x3 - this.x0 );
			if ( t <= 0 ){
				return null; //0;
			} else if ( t >= 1 ){
				return null; //1;
			}

			// Try gradient descent to solve for t. If it works, it is very fast.
			var tMin = 0;
			var tMax = 1;
			for ( var i = 0; i < 8; i++ ){
				var value = this.getPoint( t ).x;
				var derivative = ( this.getPoint( t + epsilon ).x - value ) / epsilon;
				if ( Math.abs(value - xVal) < epsilon ){
					return t;
				} else if ( Math.abs(derivative) < epsilon){
					break;
				} else{
					if ( value < xVal ){
						tMin = t;
					} else{
						tMax = t;
					}
					t -= ( value - xVal ) / derivative;
				}
			}

			// If the gradient descent got stuck in a local minimum, e.g. because
			// the derivative was close to 0, use a Dichotomy refinement instead.
			// We limit the number of interations to 8.
			for ( var i = 0; Math.abs(value - xVal) > epsilon && i < 8; i++ ){
				if ( value < xVal ){
					tMin = t;
					t = (t + tMax) / 2;
				}else{
					tMax = t;
					t = (t + tMin) / 2;
				}
				value = this.getPoint( t ).x;
			}
			return t;
		};
		this.solveYValueFromXValue		= function( xVal ){
		  return this.getPoint(this.solvePositionFromXValue(xVal)).y;
		};
	},
	BezierSpline:					function( apoints ){
		this.segments = [];
		this.init						= function( apoints ){
			var cnt = ( apoints ) ? apoints.length - 1 : -1;
			if( apoints ){
				for( var i = 0; i < cnt; i += 3 ){
					var seg = new Edapt.TweenSplitter.Bezier( [ apoints[i], apoints[i+1], apoints[i+2], apoints[i+3] ] );
					this.segments.push( seg );
					seg.id = this.segments.length;
				}
			}

		};
		this.getSegment					= function( t ){
			var segment = Math.max( 1, Math.ceil( this.segments.length * t ) );
			return this.segments[ segment ];
		};
		this.solvePositionFromXValue	= function( xVal ){
			for( var i = 0; i < this.segments.length; i ++ ){
				var xCurve = this.segments[ i ];
				var xValue = xCurve.solvePositionFromXValue( xVal );
				if( xValue ){
					return { segment:i, position:xValue };
				}
			}
			return { segment:-1, position:-1 };
		};
		this.split						= function( t ){
			var spoint = this.solvePositionFromXValue( t );
			if( spoint.segment > -1 && spoint.position > -1 ){
				var splitted = this.segments[ spoint.segment ].split( spoint.position );
				var seg = spoint.segment;
				var pos = spoint.position;
				var a = new Edapt.TweenSplitter.BezierSpline();
				var b = new Edapt.TweenSplitter.BezierSpline();
				for( i = 0; i < seg; i++ ){
					a.segments.push( this.segments[ i ] );
				}
				a.segments.push( splitted[0] );
				b.segments.push( splitted[1] );
				seg ++;
				for( i = seg; i < this.segments.length; i++ ){
					b.segments.push( this.segments[ i ] );
				}
				return [ a, b ];
			}
			return null
		};
		this.getCurve					= function(){
			var retval = [];
			for( var i = 0; i < this.segments.length; i++ ){
				var segment = this.segments[ i ];
				var xpoints = segment.getCurve();
				var start = ( i === 0 ) ? 0 : 1;
				for( var j = start; j < xpoints.length; j ++ ){
					retval.push( xpoints[ j ] );
				}
			}
			return retval;
		};
		this.init( apoints );
	},
	convertToKeyframes:				function( atimeline ){
		var selFrames = atimeline.getSelectedFrames();
		var selModified = this.modifyFrameSelection( atimeline, selFrames );
		var keyIndices = {};
		for( var i=0; i < selFrames.length; i+=3 ){
			var li = selFrames[i];
			var st = selFrames[i+1];
			var en = selFrames[i+2];
			var myLayer = atimeline.layers[ li ];

			if( ! keyIndices.hasOwnProperty( li ) ){
				keyIndices[ li ] = [];
			}
			for( var j = st; j < en; j++ ){
				if( j < myLayer.frames.length ){
					var pk, prevKey, ease;
					var xCurve = { prevFrame:{}, currentFrame:{} };
					var nk = Edapt.utils.getLayerNextKey( myLayer, j );
					if ( keyIndices[ li ].length < 1 ){
						pk = Edapt.utils.getLayerPrevKey( myLayer, j );
						ease = this.getEaseFromFrame( myLayer.frames[ pk ] );
					}else{
						var tmp = Edapt.utils.getLayerPrevKey( myLayer, j );
						if( tmp >= keyIndices[ li ][ keyIndices[ li ].length - 1 ].end ){
							pk = tmp;
							ease = this.getEaseFromFrame( myLayer.frames[ pk ] );
						}else{
							pk = keyIndices[ li ][ keyIndices[ li ].length - 1 ].end;
							ease = keyIndices[ li ][ keyIndices[ li ].length - 1 ].curve.currentFrame;
						}
					}
					prevKey = myLayer.frames[ pk ];
					if( prevKey ){
						var totalDuration = nk - pk;
						var ratio = ( j - pk ) / totalDuration;
						for( var p in ease ){
							var originalSpline = new this.BezierSpline( ease[ p ] );
							var splitted = originalSpline.split( ratio );
							if( splitted ){
								xCurve.prevFrame[ p ] = this.getNormalized( splitted[0].getCurve() );
								xCurve.currentFrame[ p ] = this.getNormalized( splitted[1].getCurve() );
							}	
						}
						keyIndices[ li ].push( { start:pk, end:j, ratio:ratio, curve:xCurve, isKey:Boolean( j === myLayer.frames[j].startFrame ) } );
					}
				}
			}
		}
		var cnt = 0;
		for( var p in selModified ){
			var layerInfo = selModified[ p ];
			atimeline.setSelectedFrames( layerInfo.newsel, Boolean( cnt === 0 ) );	// block select
			cnt ++;
		}
		atimeline.convertToKeyframes();

		var needToClear = false;
		for( var p in selModified ){
			var layerInfo = selModified[ p ];
			if( ! Edapt.utils.isArraysEqual( layerInfo.sel, layerInfo.newsel ) ){
				atimeline.setSelectedFrames( layerInfo.sel, false );	// exclude original selection
				needToClear = true;
				for( var j = 0; j < layerInfo.keys.length; j+=3 ){
					var keyDef = [ layerInfo.keys[j], layerInfo.keys[j+1], layerInfo.keys[j+2] ];
					var exclude = true;
						for( jj = 0; jj < layerInfo.sel.length; jj+=3 ){
							var selDef = [ layerInfo.sel[jj], layerInfo.sel[jj+1], layerInfo.sel[jj+2] ];
							if( Edapt.utils.isArraysEqual( keyDef, selDef ) ){
								exclude = false;
								break;
							}
						}
					if( exclude ){
						atimeline.setSelectedFrames( keyDef, false );	// exclude pre-existing keys, not included in the original selection
					}
				}
			 }
			
		}
		if( needToClear ) atimeline.clearKeyframes();
		
		for( var l in keyIndices ){
			var myLayer = atimeline.layers[ l ];
			var layerInfo = keyIndices[ l ];
			for( var j = 0; j < layerInfo.length; j++ ){
				var myKey = layerInfo[ j ];
				if( ! myKey.isKey ){
					var prevFrame = myLayer.frames[ myKey.start ];
					var thisFrame = myLayer.frames[ myKey.end ];
					thisFrame.hasCustomEase = true;
					prevFrame.hasCustomEase = true;
					thisFrame.useSingleEaseCurve = prevFrame.useSingleEaseCurve;
					var prevInfo = myKey.curve.prevFrame;
					var currInfo = myKey.curve.currentFrame;
					for( var p in prevInfo ){
						thisFrame.setCustomEase( p, myKey.curve.currentFrame[ p ] );
						prevFrame.setCustomEase( p, myKey.curve.prevFrame[ p ] );
					}
				}
			}
		}
	}
};