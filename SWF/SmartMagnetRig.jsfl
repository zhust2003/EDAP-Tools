fl.trace( "INIT" );
fl.runScript( fl.configURI + "Javascript/EDAPT Common Functions.jsfl" );
initialize();
fl.showIdleMessage( false );
lastCurrentTimeline = null;

message						= function( atitle, amessage ){
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
}
newRig						= function(){
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
}
exportRigs					= function( jsonData, currentnum ){
	/* 
	folderName: "file:///D|/BOOKZ"
	fileName: "koko"
	exportAll: "false"
	dismiss: "cancel", "accept"
	*/
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
		var data = JSON.parse( jsonData );
		var fileName;
		
		if( ! isValidName( settings.folderName ) ){
			retval.result = 'Invalid folder.';
			//fl.trace( "[" + settings.folderName + "]" ); //***
			return JSON.stringify( retval );
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
					fn = fileName + pad( ( i + 1 ), ( data.length + '' ).length );
				}
				else{
					fn = data[ i ][ 0 ].id;
				}
				FLfile.write( settings.folderName + fn + '.rig', JSON.stringify( data[ i ] ) );
				cnt ++;
			}
		}
		else{
			FLfile.write( settings.folderName + fileName + '.rig', JSON.stringify( data[ currentnum ] ) );
			cnt = 1;
		}
		retval.files = cnt;
		return JSON.stringify( retval );
	}
	else{
		retval.result = 'No document.';
		return JSON.stringify( retval );
	}
 }
importRig					= function(){
	var path = fl.browseForFileURL( 'open', 'Import Structure' );
	if( path ){
		var string = FLfile.read( path );
		return string;
	}
	return '';
}
retreiveRigsFromDocument	= function(){
	var doc = fl.getDocumentDOM();
	if( doc ){
		var sel = getAllStageElements();
		if( sel.length ){
			out = [];
			for( var i=0; i<sel.length; i++ ){
				var inf = getRigData( sel[i] );
				if( inf ){
					out.push( inf );
				}
			}
			return JSON.stringify( out );
		}
		return '';
	}
	return '';
}
getCurrentRigInfo			= function( id ){
	
	var doc = fl.getDocumentDOM();
	if( doc ){
		var tml = doc.getTimeline();
		if( tml != lastCurrentTimeline ){
			//fl.trace( "The timeline changed to: " + tml.name );
			lastCurrentTimeline = tml;
			return '';
		}
		else{
			var sel = getAllStageElements();
			if( sel.length ){
				var out = [];
				for( var i=0; i<sel.length; i++ ){
					var el = sel[i];
					var obj = getRigData( el );
					if( obj ){
						if( obj.rig == id ){
							obj.hasSnapObject = Boolean( getSnapObjects( el, true ).length > 0 );
							obj.selected = include( doc.selection, el );
							out.push( obj );
						}
					}
				}
				return JSON.stringify( out );
			}
			return '';
		}
	}
	
	return '';
}
getLinkedSymbolInfo 		= function( adata ){
	var args = JSON.parse( adata );
	var elts = getAllStageElements();
	var cnt = elts.length;
	while( cnt-- ){
		var el = elts[ cnt ];
		var inf = getRigData( el );
		var hasName = false;
		if ( el.symbolType == "movie clip" || el.symbolType == "button" ){
			if( el.name.length > 0 ){
				hasName = true;
			}
		}
		if( inf ){
			if( inf.rig == args.rig && inf.id == args.id ){
				return "Symbol: " + el.libraryItem.name + ( hasName ? ( ",      Instance: " + el.name ) : "" );	
			}
		}
	}
	return '';
}
setRigInfo					= function( rigdata ){
	fl.trace( rigdata );
	var doc = fl.getDocumentDOM();
	if( doc ){
		var sel = doc.selection;
		if( sel.length == 1 ){
			var el = sel[0];
			if( isElementSymbol( el ) ){
				var current = getRigData( el );
				if( ! current ){
					var inf = JSON.parse( rigdata );
					setRigData( el, rigdata );
					doc.rotateSelection( 45 );  // Bug Fix - To force 'Save' command in Flash
					doc.rotateSelection( -45 );
					return "link";
				}
				else{
					removeRigData( el );
					return "unlink";
				}
			}
		}
	}
}
createSnapInfo				= function( rigdata ){
	var args = JSON.parse( rigdata );
	var info = new Object();
	info.rig = args.rig;
	info.parent = args.id;
	return JSON.stringify( info );
}
removeSelectedNodes 		= function(){
	var doc = fl.getDocumentDOM();
	var retval = [];
	if( doc ){
		var sel = doc.selection;
		var cnt = 0;
		if( sel.length > 0 ){
			for( var i=0; i<sel.length; i++ ){
				var el = sel[i];
				var inf = getRigData( el );
				if( inf ){
					retval.push( inf );
					cnt ++;
				}
				removeRigData( el );
			}
			message( 'Remove Links', cnt + " link(s) are removed." );
		}
		else{
			message( 'Remove Links', 'Select some symbol instances to perform this command.' );
		}
	}
	return JSON.stringify( retval );
}
traceObj 					= function ( obj ){
	for( p in obj ){
		fl.trace( p + ": " + obj[ p ] );
	}
}

// HELPER FUNCTIONS
findSnapInParent			= function( element, inf ){
	var radius = 4;
	if( isElementSymbol( element ) ){
		var parent = findParent( inf );
		if( parent ){
			var snaps = getSnapObjects( parent, false );
			for( var i=0; i<snaps.length; i++ ){
				var snap = snaps[i];
				var p1 = {	x:snap.matrix.tx * parent.matrix.a + snap.matrix.ty * parent.matrix.c + parent.matrix.tx, 
							y:snap.matrix.ty * parent.matrix.d + snap.matrix.tx * parent.matrix.b + parent.matrix.ty };
				var p2 = { x:element.matrix.tx, y:element.matrix.ty };
				var dist = fl.Math.pointDistance( p1, p2 );
				if( dist <= radius ){
					return snap;
				}
			}
			return null;
		}
		return null;
	}
	return null;
}
getSnapObjects				= function( element, flag ){
	var retval = [];
	var tml = element.libraryItem.timeline;
	var layers = tml.layers;
	var currentframe = tml.currentFrame;
	tml.currentFrame =  element.firstFrame; // bugfix  2011/08/31
	var i = 0;
	while ( i < layers.length ){
		var cf = layers[i].frames[ currentframe ];								
		if( cf ){
			var elts = cf.elements;
			var j = 0;
			while( j < elts.length ){
				var elt = elts[j];
				if( isElementSymbol( elt ) ){
					if( elt.libraryItem.getData( "weight" ) != 0 ){
						retval.push( elt );
						if( flag ){
							return retval;
						}
					}
				}
				j++;
			}
		}
		i ++;
	}
	return retval;
}
findParent 					= function( args ){
	var tml = fl.getDocumentDOM().getTimeline();
	var currentframe = tml.currentFrame;
	var layers = tml.layers;
	var i = 0;
	while ( i < layers.length ){
		var cf = layers[i].frames[ currentframe ];
		if( cf ){
			var elts = cf.elements;
			var j = 0;
			while( j < elts.length ){
				var elt = elts[j];
				if( isElementSymbol( elt ) ){
					var inf = getRigData( elt );
					if( args.parent == inf.id ){
						return elt;
					}
				}
				j++;
			}
		}
		i ++;
	}
	return null;
}
isValidName					= function( aname ){
	return ( typeof( aname ) == "string" ) && aname.length > 0 && aname != "null";
}
pad							= function( number, length ){
	var str = '' + number;
	while ( str.length < length ) {
		str = '0' + str;
	}
	return str;
}
removeRigData				= function( element ){
	element.removePersistentData( 'rigData' );
}
setRigData					= function( element, data ){
	element.removePersistentData( 'rigData' );
	element.setPersistentData( 'rigData', 'string', data );
}
getAllStageElements			= function(){
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
					if( isElementSymbol( elts[j] ) ){
						retval.push( elts[j] );
					}
					j++;
				}
			}
			i ++;
		}
		
	return retval;
}