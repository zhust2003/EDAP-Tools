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
				createFresh( context );
			}
			else{
				context.EDAPSettings.recordParentRegPoint.currentElement = 0; 
				context.EDAPSettings.layerColors.light.index = -1;
				context.EDAPSettings.layerColors.dark.index = -1;
			}
		}
		else{
			createFresh( context );
			serialize( context.EDAPSettings, fpath );
		}
	}	
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

displayOptionalMessageBox = function( atitle, amessage, atype ){
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
			switch( atype ){
				case "create_snap_object":
					EDAPSettings.createSnapObject.showAlert = false;
					break;
				case "set_selection_pivot_to_parent":
					EDAPSettings.setSelectionPivotToParentRegPoint.showAlert = false;
					break;
				default:
			}
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

createFresh = function( context ){
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

getVersion = function( astring ){
	astring = fl.version;
	s1 = astring.split( " " )[ 1 ];
	return parseInt( s1.split( "," )[0] );
} 

include = function( arr, obj ) {
  for( var i=0; i<arr.length; i++ ) {
    if (arr[i] == obj) return true;
  }
  return false;
}

defineDarkColors = function(){
	return [ "#000099", "#990000", "#006600", "#333333", "#9900CC" ];
}

defineLightColors = function(){
	return [ "#FF33FF", "#4FFF4F", "#FFFF00", "#CCCCCC", "#66FFFF" ];
}

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

function cloneObject(obj) {
	var clone = {};
	for(var i in obj) {
		clone[i] = obj[i];
	}
	return clone;
}


setAllCommandBoxes = function( arrayOfNames, astate ){
	for( var i=0; i<arrayOfNames.length; i++ ){
		fl.xmlui.set( arrayOfNames[i], astate );
	}
}

getAllCommandBoxes = function( arrayOfNames ){
	var output = new Array();
	for( var i=0; i<arrayOfNames.length; i++ ){
		output.push( fl.xmlui.get( arrayOfNames[i] ) );
	}
	return output;
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


getGlobal = function(){
	return (function(){
		return this;
	}).call(null);
}