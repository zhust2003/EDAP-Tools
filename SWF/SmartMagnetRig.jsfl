fl.runScript( fl.configURI + "Javascript/EDAPT Common Functions.jsfl" );
initialize();
fl.showIdleMessage( false );
lastCurrentTimeline = null;


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
		
		if( ! ( ( typeof( settings.folderName ) == "string" ) && ( settings.folderName.length > 0 ) && ( settings.folderName != "null" ) ) ){
			retval.result = 'Invalid folder.';
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
					fn = fileName + zeroPrefix( ( i + 1 ), ( data.length + '' ).length );
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
				var inf = getData( sel[i], "SMR" );
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
					var obj = getData( el, "SMR" );
					if( obj ){
						if( obj.rig == id ){
							obj.hasSnapObject =  Boolean( getSnapObjectsInElement( el ).length > 0 );
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
	var doc = fl.getDocumentDOM();
	if( doc ){
		var args = JSON.parse( adata );
		var elts = getAllStageElements();
		var cnt = elts.length;
		while( cnt-- ){
			var el = elts[ cnt ];
			var inf = getData( el, "SMR" );
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
	return '';
}
removeSelectedNodes 		= function(){
	var doc = fl.getDocumentDOM();
	var retval = [];
	if( doc ){
		var sel = doc.selection;
		var cnt = 0;
		if( sel.length > 0 ){
			
			var settings = displayDialogue( "Remove Links", "Are you sure you want to remove links from the selected Symbol Instances?", "accept, cancel" );
			if( settings.dismiss == "accept" ){
				for( var i=0; i<sel.length; i++ ){
					var el = sel[i];
					var inf = getData( el, "SMR" );
					if( inf ){
						retval.push( inf );
						cnt ++;
					}
					removeData( el, "SMR" );
				}
				displayDialogue( "Remove Links", cnt + " link(s) were removed.", "accept" );
			}
		}
		else{
			displayDialogue( "Remove Links", "Select at least one already linked Symbol on Stage.", "accept" );
		}	
	}
	return JSON.stringify( retval );
}
setRigInfo					= function( infoString ){
	var doc = fl.getDocumentDOM();
	if( ! doc ){ return;}
	if( doc.selection.length > 1 || doc.selection == 0 ){ 
		displayDialogue( "Set Rig Information", "Select one Symbol on Stage.", "accept" );
		return;
	}
	var element = getSelection( doc, true );
	if( ! element ){ return;}
	
	var rigDataObj = JSON.parse( infoString );
	var infoObj = getData( element, "SMR" );
	
	if( infoObj ){
		if( infoObj.rig == rigDataObj.rig ){
			unLink( element, rigDataObj );
		}
		else{
			var settings = displayDialogue( "Rig information", "The selected Symbol Instance is a part of another rig.\nAre you sure you want to replace the existing rig information with new one?", "accept, cancel" );
			if( settings.dismiss == "accept" ){
				link( doc, element, rigDataObj );
			}
		}
	}
	else{
		link( doc, element, rigDataObj );
	}
}
link						= function( doc, element, rigDataObject ){
	var myTimeline = doc.getTimeline();
	var myInfObj = getData( element, "SMR" );
	var snapInfo = createSnapInfo( myTimeline, element, rigDataObject );
	var myID = snapInfo.id;

	if( rigDataObject.parent == "" ){ // ROOT
		doc.moveSelectionBy( { x:1, y:1 } );
		doc.moveSelectionBy( { x:-1, y:-1 } );
		doc.enterEditMode( "inPlace" );
		for( var i=0; i<snapInfo.snaps.length; i++ ){
			if( ! getData( snapInfo.snaps[i], "SMR" ) ){
				myID ++;
				var ok1 = setData( snapInfo.snaps[i], "SMR", { rig:rigDataObject.rig, id:String( myID ) } );
			}
		}
		doc.exitEditMode();
		var ok2 = setData( element, "SMR", rigDataObject  );
	}
	else{// CHILD
		doc.moveSelectionBy( { x:1, y:1 } );
		doc.moveSelectionBy( { x:-1, y:-1 } );
		doc.enterEditMode( "inPlace" );
		for( var i=0; i<snapInfo.snaps.length; i++ ){
			if( ! getData( snapInfo.snaps[i], "SMR" ) ){
				myID ++;
				var ok1 = setData( snapInfo.snaps[i], "SMR", { rig:rigDataObject.rig, id:String( myID ) } );
			}
		}
		doc.exitEditMode();		
		var parent = getMyParent( myTimeline, rigDataObject );
		var pSnaps = getSnapObjectsInElement( parent );
		var xSnap = null;
		for( var j=0; j<pSnaps.length; j++ ){
			var d = fl.Math.pointDistance( elementToContainer( parent, pSnaps[j] ), {x:element.matrix.tx, y:element.matrix.ty} );
			if( d <= EDAPSettings.smartMagnetRig.snapThreshold ){
				xSnap = pSnaps[j];
				break;
			} 
		}
		if( xSnap ){
			var snapInf = getData( xSnap, "SMR" );
			if( snapInf ){
				var id = snapInf.id;
				rigDataObject.snapTo = id;
				var ok2 = setData( element, "SMR", rigDataObject );
			}
			else{
				var mtID = String( getMaxID( myTimeline, rigDataObject ) + 1 );
				rigDataObject.snapTo = mtID;
				setData( xSnap, "SMR", { rig:rigDataObject.rig, id:mtID } );
				var ok2 = setData( element, "SMR", rigDataObject );
			}
		}
		else{
		
			var msg = "No Magnet Target found within the "+ EDAPSettings.smartMagnetRig.snapThreshold +"px radius.\n"+
			"Parent Symbol must contain a Magnet Target (MT) object.\n"+
			"MT center must overlap with the Registration Point of currently selected Symbol Instance."
			var settings = displayDialogue( "Rig information", msg, "accept" );
			return;
		}	
	}

	var mysiblings = filterStageElements( isMySibling, myTimeline, true, false, [], element, rigDataObject );
	for( var sib = 0; sib < mysiblings.length; sib ++ ){
		var children = [];
		var xSibling = mysiblings[ sib ];
		getMyChildren( xSibling, myTimeline, children, false );
		var sibSnaps = getSnapObjectsInElement( xSibling );
		for( var ch = 0; ch < children.length; ch ++ ){
			// Iterate through all snap-objects and check the distances
			var xChild = children[ ch ];
			for( var sn = 0; sn < sibSnaps.length; sn ++ ){
				var xSnap = sibSnaps[ sn ];
				var dist = fl.Math.pointDistance( elementToContainer( xSibling, xSnap ), {x:xChild.matrix.tx, y:xChild.matrix.ty} );
				if( dist <= EDAPSettings.smartMagnetJoint.snapThreshold ){
					var snapID = getData( xSnap, "SMR" ).id;
					if( snapID ){
						var oldInfo = getData( xChild, "SMR" );
						oldInfo[ "snapTo" ] = snapID;
						setData( xChild, "SMR", oldInfo );
					}
				}
			}
		}
	}	
}
unLink						= function( element, dataObj ){
	var inf = getData( element, "SMR" );
	if( inf.rig == dataObj.rig && inf.id == dataObj.id ){
	var ok = removeData( element, "SMR" );
		if( ok ){
			var tail = "";
			if( inf ){
				tail += "\n\n\Rig: " + inf.rig + "\n";
				tail += "ID: " + inf.id + "\n";
				tail += "Symbol: " + element.libraryItem.name + "\n";
				if( element.name ){
					tail += "Instance: " + element.name;
				}
			}
			displayDialogue( "Remove Rig information", "One link was removed." + tail, "accept" );
		}
	}
	else{
		displayDialogue( "Remove Rig information", "You can unlink only the currently selected Symbol Instance.", "accept" );
	}
}


// HELPER FUNCTIONS
createSnapInfo				= function( myTimeline, element, rigDataObject ){
	var mtID = getMaxID( myTimeline, rigDataObject ); // Find maximum existing ID number
	var mySnaps = filterStageElements( isMagnetTarget, element.libraryItem.timeline, true, false, [] );
	return { id:mtID, snaps:mySnaps };
}
getMaxID					= function( myTimeline, inf ){
	var snaps = collectUniqueSnapObjects( myTimeline, inf );
	var maxID;
	if( snaps.length > 0 ){
		snaps.sort( sortOnID );
		maxID = Number( getData( snaps[ snaps.length-1 ], "SMR" ).id );
	}
	else{
		maxID = 0;
	}
	return maxID;
}
collectUniqueSnapObjects	= function( aTimeline, inf ){
	var retval = [];
	var layers = aTimeline.layers;
	var cf = aTimeline.currentFrame;
	var i = 0;
	while ( i < layers.length ){
		var layer = layers [i];
		var frames = layer.frames;
		if( frames[ cf ] ){
			var elements = frames[ cf ].elements;
			var n = 0;
			while ( n < elements.length ){
				var el = layer.frames[ cf ].elements[ n ];
				var mysnaps = getSnapObjectsInElement( el );
				for( var j=0; j<mysnaps.length; j++ ){
					var sno = mysnaps[ j ];
					if( ! include( retval, sno ) ){
						var data = getData( sno, "SMR" );
						if( data ){
							if( data.rig == inf.rig ){
								retval.push( sno );	
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
}
getSnapObjectsInElement		= function( element ){
	if( isElementSymbol( element ) ){
		return filterStageElements( isMagnetTarget, element.libraryItem.timeline, true, false, [] );
	}
	return [];
}
sortOnID					= function( a, b ){
	return ( convertID( getData( a, "SMR" ).id ) - convertID( getData( b, "SMR" ).id ) );
}
convertID					= function( id ){
	if( id.length == 0 ){ return -1; }
	var retval = Number( id );
	return isNaN( retval ) ? 0 : retval;
}
getMyParent					= function( myTimeline, rigInfObj ){
	var parents = filterStageElements( getParent, myTimeline, false, true, [], rigInfObj );
	if( parents.length > 0 ){
		return parents[0];
	}
	return null;
}
getParent					= function( element, aTimeline, currentLayernum, cf, n, inf ){
	var data = getData( element, "SMR" );
	if( data ){
		if( ( data.rig == inf.rig && data.id == inf.parent ) ){
			return element;
		}
		return null;
	}
	return null;
}
elementToContainer			= function( container, element ){
	var theX = element.matrix.tx * container.matrix.a + element.matrix.ty *  container.matrix.c +  container.matrix.tx;
	var theY = element.matrix.ty * container.matrix.d + element.matrix.tx *  container.matrix.b +  container.matrix.ty;
	return { x:theX, y:theY };
}
isMySibling					= function( element, aTimeline, currentLayernum, cf, n, target, inf ){
	if ( element.libraryItem ==  target.libraryItem ){
		var data = getData( element, "SMR" );
		if( ! data ){ return false; }
		if( data.rig == inf.rig ){
			return true;
		}
		return false;
	}
	return false;
}
getMyChildren				= function( element, tml, children, recurs ){
	var retval = filterStageElements( isMyChild, tml, true, false, [ element ], getData( element, "SMR" ) );
	if( retval.length ){
		if( recurs ){
			for( var i=0; i<retval.length; i++ ){
				getMyChildren( retval[i], tml, children, recurs );
			}
		}
		for( var j=0; j<retval.length; j++ ){
			children.push( retval[j] );
		}
	}
}
isMyChild					= function( element, aTimeline, currentLayernum, cf, n, inf ){
	var data = getData( element, "SMR" );
	if( data ){
		if( ( data.rig == inf.rig && data.parent == inf.id ) ){
			return true;
		}
		return false;
	}
	return false;
}
zeroPrefix					= function( number, length ){
	var str = '' + number;
	while ( str.length < length ) {
		str = '0' + str;
	}
	return str;
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