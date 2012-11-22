smartSnap = {};

if ( ! smartSnap.hasOwnProperty( 'isElementSymbol' ) ){
     //fl.trace( "initialize smartSnap..." );
	fl.showIdleMessage( false ); //  Prevents the warning about a script running too long.
	smartSnap.lastCurrentTimeline = null;
	smartSnap.mouseLoc = {x:-1000, y:-1000};
	
	smartSnap.message = function( atitle, amessage ){
		var messageLines = "";
		var myLines = amessage.split( "***" );
		for( var i=0; i<myLines.length; i++ ){
			messageLines += ( '<label value="'+ myLines[i] + '"/>');
		}
		var xmlContent = '<?xml version="1.0"?>' +
		'<dialog buttons="accept" title="' + atitle + '">' +
		'<vbox>' +
			messageLines +
			'<spacer></spacer>' +
			'<spacer></spacer>' +
			'<separator></separator>' +
			'<spacer></spacer>' +
		'</vbox>' +
		'</dialog>';
		var xmlFile = fl.configURI + "WindowSWF/SmartMagnetRig.xml";
		if ( FLfile.exists( xmlFile ) ) {
			FLfile.remove( xmlFile );	
		}
		FLfile.write( xmlFile, xmlContent );
		var settings = fl.getDocumentDOM().xmlPanel( xmlFile );
		FLfile.remove( xmlFile );	
	}; 
	 
	 
	smartSnap.newStructure = function(){
		var doc = fl.getDocumentDOM();
		if( doc ){
			var xmlContent = '<?xml version="1.0"?>' +
			'<dialog title="New Rig" buttons="accept, cancel">' +
			'<vbox>' +
				'<textbox id="name" size="40" value=""/>' +
				'<spacer></spacer>' +
				'<separator></separator>' +
				'<spacer></spacer>' +
				'<spacer></spacer>' +
			'</vbox>' +
			'</dialog>';
			var xmlFile = fl.configURI + "WindowSWF/SmartMagnetRig.xml";
			if ( FLfile.exists( xmlFile ) ) {
				FLfile.remove( xmlFile );	
			}
			FLfile.write( xmlFile, xmlContent );
			var settings = doc.xmlPanel( xmlFile );
			FLfile.remove( xmlFile );
			return this.JSON.stringify( settings );
		}
		else{
			return '{}';
		}
	};
	 
	 
	smartSnap.exportStructure = function( jsonData, currentnum ){
		/* 
		folderName: "file:///D|/BOOKZ"
		fileName: "koko"
		exportAll: "false"
		dismiss: "cancel", "accept"
		*/
		fl.trace( currentnum ); //***
		var doc = fl.getDocumentDOM();
		var retval = new Object();
		retval.result = 'ok';
		retval.files = 0;
		if( doc ){
			var xmlContent = '<?xml version="1.0"?>' +
			'<dialog title="Export Rig" buttons="accept, cancel">' +
				'<property id="folderName" value="" ></property>' +
				'<vbox>' +
					'<button label="Choose folder to export in..." oncommand = "showBrowseFolder()" />' +
					'<spacer></spacer>' +
					'<spacer></spacer>' +
					'<spacer></spacer>' +
					'<label value="Use this filename instead of original rig name." />' +
					'<textbox id="fileName" size="35" value=""/>' +
					'<spacer></spacer>' +
					'<checkbox id="exportAll" label="Export All Rigs" checked = "false" />' +
					'<spacer></spacer>' +
					'<separator></separator>' +
					'<spacer></spacer>' +
					'<spacer></spacer>' +
				'</vbox>' +
				'<script>' +
					'function showBrowseFolder(){' +
						'var fldr = fl.browseForFolderURL( "Select a folder." );' +
						'fl.xmlui.set( "folderName", fldr );'+
						'fl.xmlui.set( "folderPath", fldr );'+
					'}'+
				'</script>'+
			'</dialog>';
			var xmlFile = fl.configURI + "WindowSWF/ExportRig.xml";
			if ( FLfile.exists( xmlFile ) ) {
				FLfile.remove( xmlFile );	
			}
			FLfile.write( xmlFile, xmlContent );
			var settings = doc.xmlPanel( xmlFile );
			FLfile.remove( xmlFile );
			var data = smartSnap.JSON.parse( jsonData );
			var fileName;
			
			if( ! smartSnap.validName( settings.folderName ) ){
				retval.result = 'Invalid folder.';
				//fl.trace( "[" + settings.folderName + "]" ); //***
				return smartSnap.JSON.stringify( retval );
			}
			else{
				if( settings.folderName.charAt( settings.folderName.length - 1 ) != "/" ){ settings.folderName += "/";} // add folder separator if needed
			}

			if( settings.fileName.length > 0 ){
				fileName = settings.fileName;			// Use the name, provided by the user.
			}
			else{
				fileName = data[ currentnum ][ 0 ].id;	// Use the original rig name.
			}
			var cnt;
			if( settings.exportAll == 'true' ){
				cnt = 0;
				for( var i = 0; i < data.length; i++ ){
					var fn = "";
					if( settings.fileName.length > 0 ){
						fn = fileName + smartSnap.pad( ( i + 1 ), ( data.length + '' ).length );
					}
					else{
						fn = data[ i ][ 0 ].id;
					}
					FLfile.write( settings.folderName + fn + '.rig', smartSnap.JSON.stringify( data[ i ] ) );
					cnt ++;
				}
			}
			else{
				FLfile.write( settings.folderName + fileName + '.rig', smartSnap.JSON.stringify( data[ currentnum ] ) );
				cnt = 1;
			}
			retval.files = cnt;
			return smartSnap.JSON.stringify( retval );
		}
		else{
			retval.result = 'No document.';
			return smartSnap.JSON.stringify( retval );
		}
	 };
 

	smartSnap.importStructure = function(){
		var path = fl.browseForFileURL( 'open', 'Import Structure' );
		if( path ){
			var string = FLfile.read( path );
			return string;
		}
		return '';
	};
	 
 
	smartSnap.retreiveRigsFromDocument = function (){
		// Executed once, on panel initialization.
		// Iterates through all elements on the stage
		// and collects their 'rigData' custom props.
		var doc = fl.getDocumentDOM();
		if( doc ){
			var sel = smartSnap.getAllStageElements();
			if( sel.length ){
				out = '[';
				for( var i=0; i<sel.length; i++ ){
					var tail = ( i < (sel.length - 1) ) ? ", " : "";
					out += ( smartSnap.getRigData( sel[i] ) + tail );
				}
				out += ']';
				return out;
			}
			return '';
		}
		return '';
	};
	 
	 
	smartSnap.getCurrentRigInfo = function( id ){
		var doc = fl.getDocumentDOM();
		if( doc ){
			var tml = doc.getTimeline(); //***
			if( tml != smartSnap.lastCurrentTimeline ){
				//fl.trace( "The timeline changed to: " + tml.name );
				smartSnap.lastCurrentTimeline = tml;
				return '';
			}
			else{
				var sel = smartSnap.getAllStageElements();
				if( sel.length ){
					var out = [];
					for( var i=0; i<sel.length; i++ ){
						var el = sel[i];
						var obj = smartSnap.JSON.parse( smartSnap.getRigData( el ) );
						if( obj.rig == id ){
							obj.hasSnapObject = smartSnap.hasSnapObject( el );
							obj.selected = smartSnap.include( doc.selection, el );
							out.push( obj );
						}
					}
					var retval = smartSnap.JSON.stringify( out );
					return retval;
				}
				return '';
			}
		}
		return '';
	};
	
	
	smartSnap.getLinkedSymbolName = function( adata ){
		var args = smartSnap.JSON.parse( adata );
		var elts = smartSnap.getAllStageElements();
		var cnt = elts.length;
		while( cnt-- ){
			var el = elts[ cnt ];
			var inf = smartSnap.JSON.parse( smartSnap.getRigData( el ) );
			var hasName = false;
			if ( el.symbolType == "movie clip" || el.symbolType == "button" ){
				if( el.name.length > 0 ){
					hasName = true;
				}
			}
			
			if( inf.rig == args.rig && inf.id == args.id ){
				return "Symbol: " + el.libraryItem.name + ( hasName ? ( ",      Instance: " + el.name ) : "" );	
			}
		}
		return '';
	};
	  
	  
	smartSnap.setNode = function( rigdata ){
		var doc = fl.getDocumentDOM();
		if( doc ){
			var sel = doc.selection;
			if( sel.length == 1 ){
				var el = sel[0];
				if( smartSnap.isElementSymbol( el ) ){
					var args = smartSnap.JSON.parse( rigdata );
					var current = smartSnap.JSON.parse( smartSnap.getRigData( el ) );
					if( current == false ){
						smartSnap.setRigData( el, rigdata );
					}
					else{
						smartSnap.removeRigData( el );
					}
				}
			}
		}
	};
	 
	
	 
	smartSnap.removeNode = function( adata ){
		// Removes rig data from a single selected instance on the stage.
		var doc = fl.getDocumentDOM();
		if( doc ){
			var sel = doc.selection;
			if( sel.length == 1 ){
				var el = sel[0];
				if( smartSnap.isElementSymbol( el ) ){
					var inf = getRigData( el );
					if( inf.rig == adata.rig && inf.id == adata.id ){
						smartSnap.removeRigData( el );
					}
				}
			}
		}
	};
	 
	 
	smartSnap.removeSelectedNodes = function(){
		var doc = fl.getDocumentDOM();
		var retval = [];
		if( doc ){
			var sel = doc.selection;
			var cnt = 0;
			if( sel.length > 0 ){
				for( var i=0; i<sel.length; i++ ){
					var el = sel[i];
					if( smartSnap.getRigData( el ) != 0 ){
						retval.push( smartSnap.JSON.parse( smartSnap.getRigData( el ) ) );
						cnt ++;
					}
					smartSnap.removeRigData( el );
				}
				smartSnap.message( 'Remove Links', cnt + " link(s) are removed." );
			}
			else{
				smartSnap.message( 'Remove Links', 'Select some symbol instances to perform this command.' );
			}
		}
		return smartSnap.JSON.stringify( retval );
	};
	
	
	// HELPER FUNCTIONS
	smartSnap.validName = function( aname ){
		return ( typeof( aname ) == 'string' ) && aname.length > 0 && aname != 'null';
	};
	smartSnap.pad = function( number, length ){
		var str = '' + number;
		while ( str.length < length ) {
			str = '0' + str;
		}
		return str;
	};
	smartSnap.isElementSymbol = function( element ){ 
		if( element.elementType == 'instance' ){
			if( element.instanceType == 'symbol' ){
				return true;
			}
		}
		return false;
	};
	smartSnap.hasSnapObject = function( element ){
		var tml = element.libraryItem.timeline;
		var layers = tml.layers;
		var currentframe = tml.currentFrame;
		tml.currentFrame =  element.firstFrame; // bugfix  2011/08/31
		var i = 0;
		while ( i < layers.length ){
			var cf = layers[i].frames[ currentframe ]; // ***
			if( cf ){
				//var elts = layers[i].frames[ currentframe].elements;
				var elts = cf.elements; //***
				var j = 0;
				while( j < elts.length ){
					var elt = elts[j];
					if( smartSnap.isElementSymbol( elt ) ){
						if( elt.libraryItem.getData( "weight" ) != 0 ){
							return true;
						}
					}
					j++;
				}
			}
			i ++;
		}
		return false;
	};
	smartSnap.include = function( arr, obj ) {
		for( var i=0; i<arr.length; i++ ) {
			if (arr[i] == obj) { return true; }
		}
		return false;
	}
	smartSnap.getRigData = function( element ){
		if( element.hasPersistentData( 'rigData' ) ){
			return element.getPersistentData( 'rigData' );
		}
		return "";
	};
	smartSnap.removeRigData = function( element ){
		element.removePersistentData( 'rigData' );
	};
	smartSnap.setRigData = function( element, data ){
		element.removePersistentData( 'rigData' );
		element.setPersistentData( 'rigData', 'string', data );
	};
	smartSnap.hasRigData = function( element ){
		return ( element.hasPersistentData( 'rigData' ) );
	};
	smartSnap.getAllStageElements = function(){
		var tml = fl.getDocumentDOM().getTimeline();
		var layers = tml.layers;
		var currentframe = tml.currentFrame;
		var retval = [];
			var i = 0;
			while ( i < layers.length ){
				var cf = layers[i].frames[ currentframe ];
				if( cf ){
					var elts = cf.elements;
					var j = 0;
					while( j < elts.length ){
						if( smartSnap.isElementSymbol( elts[j] ) ){
							retval.push( elts[j] );
						}
						j++;
					}
				}
				i ++;
			}
			
		return retval;
	};	
	smartSnap.JSON = function () {
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
}