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


// Library initialization
initialize = function(){
	var context;
	if( getVersion() < 11 ){
		//fl.trace( "F8 - CS4" ); //***
		context = getGlobal();
	}
	else{
		//fl.trace( "CS5" );//***
		context = this;
	}
	if( typeof context.EDAPSettings != "object" ){
		var fpath = fl.configURI + "Javascript/EDAPTsettings.txt";
		if ( FLfile.exists( fpath ) ) {
			context.EDAPSettings = deserialize( fpath );
			if( typeof context.EDAPSettings != "object" ){
				createSettings( context );
			}
			else{
				context.EDAPSettings.recordParentRegPoint.currentElement = 0; 
				context.EDAPSettings.layerColors.light.index = -1;
				context.EDAPSettings.layerColors.dark.index = -1;
			}
		}
		else{
			createSettings( context );
			serialize( context.EDAPSettings, fpath );
		}
	}	
}

createSettings = function( context ){
	//fl.trace( "CREATE FRESH... " + getVersion() ); //*****
	context.EDAPSettings = new Object();
	context.EDAPSettings.traceLevel = 1; // 0 = none, 1 = errors only, 2 = all

	// Layer Colors
	context.EDAPSettings.layerColors = new Object();
	context.EDAPSettings.layerColors.light = new Object();
	context.EDAPSettings.layerColors.light.colors = defineLightColors();
	context.EDAPSettings.layerColors.light.index = -1;
	context.EDAPSettings.layerColors.dark = new Object();
	context.EDAPSettings.layerColors.dark.colors = defineDarkColors();
	context.EDAPSettings.layerColors.dark.index = -1;
	context.EDAPSettings.layerColors.forceOutline = true;
	
	// Record Parent Reg Point
	context.EDAPSettings.recordParentRegPoint = new Object();
	context.EDAPSettings.recordParentRegPoint.currentElement = 0;

	// SetSelectionPivotToParentRegPoint
	context.EDAPSettings.setSelectionPivotToParentRegPoint = new Object();
	context.EDAPSettings.setSelectionPivotToParentRegPoint.showAlert = true;

	//CreateSnapObject
	context.EDAPSettings.createSnapObject = new Object();
	context.EDAPSettings.createSnapObject.name = "_SnapObject";
	context.EDAPSettings.createSnapObject.layerName = "Snap Object(s)";
	context.EDAPSettings.createSnapObject.showAlert = true;

	//SmartSnap
	context.EDAPSettings.smartSnap = new Object();
	context.EDAPSettings.smartSnap.distanceThreshold = 50;
	context.EDAPSettings.smartSnap.depthLevel = 2;
	context.EDAPSettings.smartSnap.weights = [1,2,3,4,5];
	
	//Commands
	//Couples: 6,7   14,15   18,19
	context.EDAPSettings.commands = new Object();
	context.EDAPSettings.commands.showAlert = true;
	
	context.EDAPSettings.commands.settings = new Array();
	context.EDAPSettings.commands.settings.push( { id:"comm01", name:["01 Convert To Symbol Preserving Layers"], state:true } ); 		//0
	context.EDAPSettings.commands.settings.push( { id:"comm02", name:["02 LB Find And Replace"], state:true } );						//1
	context.EDAPSettings.commands.settings.push( { id:"comm03", name:["03 LB Prefix Suffix"], state:true } );							//2
	context.EDAPSettings.commands.settings.push( { id:"comm04", name:["04 LB Trim Characters"], state:true } );							//3
	context.EDAPSettings.commands.settings.push( { id:"comm05", name:["05 LB Enumeration"], state:true } );								//4

	context.EDAPSettings.commands.settings.push( { id:"comm08", name:["08 Layer Outlines Toggle"], state:true } );						//5
	context.EDAPSettings.commands.settings.push( { id:"comm09", name:["09 Layer Guide Toggle"], state:true } );							//6
	context.EDAPSettings.commands.settings.push( { id:"comm10", name:["10 Layer Color Dark"], state:true } );							//7
	context.EDAPSettings.commands.settings.push( { id:"comm11", name:["11 Layer Color Light"], state:true } );							//8
	context.EDAPSettings.commands.settings.push( { id:"comm12", name:["12 Set Reg Point To Transform Point"], state:true } );			//9
	
	context.EDAPSettings.commands.settings.push( { id:"comm13", name:["13 Enter Symbol At Current Frame"], state:true } );				//10
	context.EDAPSettings.commands.settings.push( { id:"comm16", name:["16 Swap Multiple Symbols"], state:true } );						//11
	context.EDAPSettings.commands.settings.push( { id:"comm17", name:["17 Sync Symbols to Timeline"], state:true } );					//12
	context.EDAPSettings.commands.settings.push( { id:"comm21", name:["21 EDAPT Shortcuts Map"], state:true } );						//13
	
	
	context.EDAPSettings.commands.settings.push( { id:"pair1",  name:["06 Next Frame In Symbol", "07 Prev Frame In Symbol" ], state:true } );						//14
	context.EDAPSettings.commands.settings.push( { id:"pair2",  name:["14 Record Parent Reg Point", "15 Set Selection Pivot To Parent Reg Point"], state:true } );	//15
	context.EDAPSettings.commands.settings.push( { id:"pair3",  name:["18 Create Snap Object", "19 Smart Snap"], state:true } );									//16	

}



// Timelines, Layers and Elements
getPathToTheTimeline = function(){
	var path = [];
	var prevName = fl.getDocumentDOM().getTimeline().name;
	var repeat = true;
	while( repeat ){
		fl.getDocumentDOM().exitEditMode();
		if( fl.getDocumentDOM().getTimeline().name != prevName ){
			path.push( prevName );
		}
		else{
			repeat = false;
		}
		prevName = fl.getDocumentDOM().getTimeline().name;
	}
	return path;
}

gotoTargetTimeline = function( apath ){
	for( var i=apath.length-1; i>-1; i-- ){
		el = getElementItemByName( fl.getDocumentDOM().getTimeline(), apath[ i ] );
		if( el != null ){
			fl.getDocumentDOM().selection = [el];
			fl.getDocumentDOM().enterEditMode( "inPlace" );
		}
	}	
}

getElementItemByName = function( tml, aname ){
	var cf = tml.currentFrame;
	for( var i=0; i<tml.layers.length; i++ ){
		var myElements = tml.layers[i].frames[cf].elements;
		for( j=0; j<myElements.length; j++ ){
			if( isElementSymbol( myElements[j] ) && ( myElements[j].libraryItem.name == aname ) ){
				return myElements[j];
			}
		}
		return null;
	}
	return null;
}

isElementSymbol = function( element ){
	if( element.elementType == "instance" ){
		if( element.instanceType == "symbol" ){
			return true;
		}
	}
	return false;
}

createObjectStateMap = function( objectCollection, props, afilter ){
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
}

restoreObjectStateFromMap = function( objectCollection, stateMap ){
	if( objectCollection.length != stateMap.length ){
		return;
	}
	for( var i = 0; i < stateMap.length; i++ ){
		state = stateMap[ i ];
		for ( p in state ){
			objectCollection[ i ][ p ] = state[ p ];
		}
	}
}

getLayers = function(){
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
}




// Messages
displayOptionalMessageBox = function( atitle, amessage, apropToChange ){
	var xmlContent = createOptionalMessageBox( atitle, amessage );
	var xmlFile = fl.configURI + "Commands/OptionalMessageBoxGUI.xml";
	if ( FLfile.exists( xmlFile ) ) {
		FLfile.remove( xmlFile );	
	}
	FLfile.write( xmlFile, xmlContent );
	var settings = fl.getDocumentDOM().xmlPanel( xmlFile );
	if( settings.dismiss == "accept" ){
		var fpath = fl.configURI + "Javascript/EDAPTsettings.txt";
		if( settings.DontShowAgain == "true" ){
			EDAPSettings[apropToChange].showAlert = false;
			serialize( EDAPSettings, fpath );	
		}	
	}
	FLfile.remove( xmlFile );	
}

createOptionalMessageBox = function( atitle, amessage ){
	var messageLines = "";
	var myLines = amessage.split( "\n" );
	for( var i=0; i<myLines.length; i++ ){
	  messageLines += ( '<label value="'+myLines[i]+'"/>');
	}
	return '<?xml version="1.0"?>' + 
	'<dialog buttons="accept" title="' + atitle + '">' +
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
}

displayMessage = function( msg, level ){
	initialize();
	switch( EDAPSettings.traceLevel ){
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
}




// Array functions
indexOf = function( array, element ){
	for( var i=0; i<array.length; i++ ){
		if( array[i] === element ){
			return i;
		}
	}
	return -1;
}

include = function( arr, obj ) {
  for( var i=0; i<arr.length; i++ ) {
    if (arr[i] == obj) return true;
  }
  return false;
}




// UI functions
defineDarkColors = function(){
	return [ "#000099", "#990000", "#006600", "#333333", "#9900CC" ];
}

defineLightColors = function(){
	return [ "#FF33FF", "#4FFF4F", "#FFFF00", "#CCCCCC", "#66FFFF" ];
}

setAllCommandBoxes = function( astate ){
	for( var i=0; i<EDAPSettings.commands.settings.length; i++ ){
		fl.xmlui.set( EDAPSettings.commands.settings[i].id, astate );
	}
}

getAllCommandBoxes = function(){
	var output = new Array();
	for( var i=0; i<EDAPSettings.commands.settings.length; i++ ){
		output.push( fl.xmlui.get( EDAPSettings.commands.settings[i].id ) );
	}
	return output;
}

moveCommandFiles = function(){
	var fpath = fl.configURI + "Commands/EDAPT Hidden Commands";
	var created = FLfile.createFolder( fpath );
	var ext = ".jsfl";
	for( var i=0; i < EDAPSettings.commands.settings.length; i++ ){
		var command = EDAPSettings.commands.settings[i];
		for( j=0; j< command.name.length; j++){
			var workingPath = fl.configURI + "Commands/" + command.name[j] + ext;
			var disabledPath = fl.configURI + "Commands/EDAPT Hidden Commands/" + command.name[j] + ext;
			if( command.state == false ){
				if( ! FLfile.exists( disabledPath ) ){
					//fl.trace( "Disabling " + workingPath ); //***
					FLfile.copy( workingPath, disabledPath  );
					FLfile.remove( workingPath );	
				}		
			}
			else if( command.state == true ){
				if( ! FLfile.exists( workingPath ) ){
					//fl.trace( "Enabling " + workingPath ); //***
					FLfile.copy( disabledPath,  workingPath );
					FLfile.remove( disabledPath );
				}
			}
		}
	}
}




// Serialization
serialize = function( o, filePath ){
	/*Before we try to serialize the settings object,
	  we clone it and remove the unnecessary data */
	var obj = cloneObject( o );
	delete obj.recordParentRegPoint.currentElement;

	var str = JSON.stringify( obj );
	if( FLfile.exists( filePath ) ){
		FLfile.remove( filePath );
	}
	FLfile.write( filePath, str );
}

deserialize = function( filePath ){
	if( FLfile.exists( filePath ) ){
		var str = FLfile.read( filePath );
	}
	return JSON.parse( str );
}

cloneObject = function(obj) {
	var clone = {};
	for( var i in obj ) {
		clone[i] = obj[i];
	}
	return clone;
}

/*
Copyright (c) 2005 JSON.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The Software shall be used for Good, not Evil.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
JSON = function () {
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




// Helper functions
getGlobal = function(){
	return (function(){
		return this;
	}).call(null);
}

getVersion = function( astring ){
	astring = fl.version;
	s1 = astring.split( " " )[ 1 ];
	return parseInt( s1.split( "," )[0] );
} 