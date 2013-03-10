fl.showIdleMessage( false );
var LMU = 0;
var LKU = 0;

// HELPER FUNCTIONS
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
		return Edapt.utils.JSON.stringify( settings );
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
		var data = Edapt.utils.JSON.parse( jsonData );
		var fileName;
		
		if( ! ( ( typeof( settings.folderName ) == "string" ) && ( settings.folderName.length > 0 ) && ( settings.folderName != "null" ) ) ){
			retval.result = 'Invalid folder.';
			return Edapt.utils.JSON.stringify( retval );
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
				FLfile.write( settings.folderName + fn + '.rig', Edapt.utils.JSON.stringify( data[ i ] ) );
				cnt ++;
			}
		}
		else{
			FLfile.write( settings.folderName + fileName + '.rig', Edapt.utils.JSON.stringify( data[ currentnum ] ) );
			cnt = 1;
		}
		retval.files = cnt;
		return Edapt.utils.JSON.stringify( retval );
	}
	else{
		retval.result = 'No document.';
		return Edapt.utils.JSON.stringify( retval );
	}
 }
importRig					= function(){
	var path = fl.browseForFileURL( 'open', 'Import Structure' );
	if( path ){
		var string = FLfile.read( path );
		if( Edapt.utils.JSON.parse( string ) ){
			return string;
		}
		return 'corrupted';
	}
	return 'canceled';
}
retreiveRigsFromDocument	= function(){
	var doc = fl.getDocumentDOM();
	if( doc ){
		var sel = getAllStageElements();
		if( sel.length ){
			out = [];
			for( var i=0; i<sel.length; i++ ){
				var inf = Edapt.utils.getData( sel[i], "SMR" );
				if( inf ){
					out.push( inf );
				}
			}
			return Edapt.utils.JSON.stringify( out );
		}
		return '';
	}
	return '';
}
checkForUpdates				= function( id ){
	var doc = fl.getDocumentDOM();
	if( ! doc ){ return ''; }
	var myMouseUp = Edapt.lastMouseUp()[3];
	var myKeyUp = Edapt.lastKeyUp();
	if( ! LMU ){
		LMU = myMouseUp;
		return getStageInfo( id );
	}
	else{
		if( myMouseUp != LMU ){
			LMU = myMouseUp;
			return getStageInfo( id );
		}
	}
	if( ! LKU ){
		if( myKeyUp[0] == 24 || myKeyUp[0] == 126 ){
			LKU = myKeyUp[2];
			return getStageInfo( id );
		}
	}
	else{
		if( myKeyUp[2] != LKU ){
			if( myKeyUp[0] == 24 || myKeyUp[0] == 126 ){
				LKU = myKeyUp[2];
				return getStageInfo( id );
			}
		}
	}
	return '';
}
getStageInfo				= function( id ){
	var doc = fl.getDocumentDOM();
	var tml = doc.getTimeline();
	var sel = getAllStageElements();
	if( sel.length ){
		var out = [];
		var i = sel.length
		while( i-- ){
			var el = sel[i];
			var obj = Edapt.utils.getData( el, "SMR" );
			if( obj ){
				if( obj.rig == id ){
					obj.hasSnapObject = Boolean( getSnapObjectsInElement( el ).length > 0 );
					obj.selected = Edapt.utils.include( doc.selection, el );
					out.push( obj );
				}
			}
		}
		return Edapt.utils.JSON.stringify( out );
	}
	else{
		return 'empty';
	}
}
getLinkedSymbolInfo 		= function( adata ){
	var doc = fl.getDocumentDOM();
	if( doc ){
		var args = Edapt.utils.JSON.parse( adata );
		var elts = getAllStageElements();
		var cnt = elts.length;
		while( cnt-- ){
			var el = elts[ cnt ];
			var inf = Edapt.utils.getData( el, "SMR" );
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
			
			var settings = Edapt.utils.displayDialogue( "Remove Links", "Are you sure you want to remove links from the selected Symbol Instances?", "accept, cancel" );
			if( settings.dismiss == "accept" ){
				for( var i=0; i<sel.length; i++ ){
					var el = sel[i];
					var inf = Edapt.utils.getData( el, "SMR" );
					if( inf ){
						retval.push( inf );
						cnt ++;
					}
					Edapt.utils.removeData( el, "SMR" );
				}
				Edapt.utils.displayDialogue( "Remove Links", cnt + " link(s) were removed.", "accept" );
			}
		}
		else{
			Edapt.utils.displayDialogue( "Remove Links", "Select at least one already linked Symbol on Stage.", "accept" );
		}	
	}
	return Edapt.utils.JSON.stringify( retval );
}
setRigInfo					= function( infoString ){
	var doc = fl.getDocumentDOM();
	if( ! doc ){ return;}
	if( doc.selection.length > 1 || doc.selection == 0 ){ 
		Edapt.utils.displayDialogue( "Set Rig Information", "Select one Symbol on Stage.", "accept" );
		return;
	}
	var element = Edapt.utils.getSelection( doc, true );
	if( ! element ){ return;}
	
	var rigDataObj = Edapt.utils.JSON.parse( infoString );
	var infoObj = Edapt.utils.getData( element, "SMR" );
	
	if( infoObj ){
		if( infoObj.rig == rigDataObj.rig ){
			unLink( element, rigDataObj );
		}
		else{
			var settings = Edapt.utils.displayDialogue( "Set Rig information",
			"The selected Symbol Instance is a part of another rig.\nAre you sure you want to replace the existing rig information with new one?",
			"accept, cancel" );
			if( settings.dismiss == "accept" ){
				link( doc, element, rigDataObj );
			}
		}
	}
	else{
		var exists = Edapt.utils.filterStageElements( isAlreadyExists,  doc.getTimeline(), true, true, [ element ], rigDataObj );
		if( exists.length > 0 ){
			Edapt.utils.displayDialogue( "Set Rig information",
			"Another Symbol Instance is already linked to this node!\nYou can only link one Symbol Instance to a given node.\nFor detailed information how to use Smart Magnet Rig click the following link:",
			"accept",
			Edapt.utils.getDialogueLink( "smartMagnetRig", "A" ) );
			return;
		}
		link( doc, element, rigDataObj );
	}
}
link						= function( doc, element, rigDataObject ){
	var myTimeline = doc.getTimeline();
	var myInfObj = Edapt.utils.getData( element, "SMR" );
	var snapInfo = createSnapInfo( myTimeline, element, rigDataObject );
	var myID = snapInfo.id;

	if( rigDataObject.parent == "" ){ // ROOT
		doc.moveSelectionBy( { x:1, y:1 } );
		doc.moveSelectionBy( { x:-1, y:-1 } );
		doc.enterEditMode( "inPlace" );
		for( var i=0; i<snapInfo.snaps.length; i++ ){
			if( ! Edapt.utils.getData( snapInfo.snaps[i], "MT" ) ){
				myID ++;
				var ok1 = Edapt.utils.setData( snapInfo.snaps[i], "MT", { rig:rigDataObject.rig, id:String( myID ) } );
			}
		}
		doc.exitEditMode();
		var ok2 = Edapt.utils.setData( element, "SMR", rigDataObject  );
	}
	else{// CHILD
		doc.moveSelectionBy( { x:1, y:1 } );
		doc.moveSelectionBy( { x:-1, y:-1 } );
		doc.enterEditMode( "inPlace" );
		for( var i=0; i<snapInfo.snaps.length; i++ ){
			if( ! Edapt.utils.getData( snapInfo.snaps[i], "MT" ) ){
				myID ++;
				var ok1 = Edapt.utils.setData( snapInfo.snaps[i], "MT", { rig:rigDataObject.rig, id:String( myID ) } );
			}
		}
		doc.exitEditMode();		
		var parent = getMyParent( myTimeline, rigDataObject );
		var pSnaps = getSnapObjectsInElement( parent );
		var xSnap = null;
		for( var j=0; j<pSnaps.length; j++ ){
			var d = fl.Math.pointDistance( elementToContainer( parent, pSnaps[j] ), {x:element.matrix.tx, y:element.matrix.ty} );
			if( d <= Edapt.settings.smartMagnetRig.snapThreshold ){
				xSnap = pSnaps[j];
				break;
			} 
		}
		if( xSnap ){
			var snapInf = Edapt.utils.getData( xSnap, "MT" );
			if( snapInf ){
				var id = snapInf.id;
				rigDataObject.snapTo = id;
				var ok2 = Edapt.utils.setData( element, "SMR", rigDataObject );
			}
			else{
				var mtID = String( getMaxID( myTimeline, rigDataObject ) + 1 );
				rigDataObject.snapTo = mtID;
				Edapt.utils.setData( xSnap, "MT", { rig:rigDataObject.rig, id:mtID } );
				var ok2 = Edapt.utils.setData( element, "SMR", rigDataObject );
			}
		}
		else{
			var msg = "No Magnet Target found within the "+ Edapt.settings.smartMagnetRig.snapThreshold +"px radius.\n"+
			"Parent Symbol must contain a Magnet Target (MT) object.\n"+
			"MT center must overlap with the Registration Point of currently selected Symbol Instance."
			var settings = Edapt.utils.displayDialogue( "Set Rig information", msg, "accept" );
			return;
		}	
	}

	var mysiblings = Edapt.utils.filterStageElements( isMySibling, myTimeline, true, false, [], element, rigDataObject );
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
				if( dist <= Edapt.settings.smartMagnetJoint.snapThreshold ){
					var snapID = Edapt.utils.getData( xSnap, "MT" ).id;
					if( snapID ){
						var oldInfo = Edapt.utils.getData( xChild, "SMR" );
						oldInfo[ "snapTo" ] = snapID;
						Edapt.utils.setData( xChild, "SMR", oldInfo );
					}
				}
			}
		}
	}	
}
unLink						= function( element, dataObj ){
	var inf = Edapt.utils.getData( element, "SMR" );
	if( inf.rig == dataObj.rig && inf.id == dataObj.id ){
	var ok = Edapt.utils.removeData( element, "SMR" );
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
			Edapt.utils.displayDialogue( "Remove Rig information", "One link was removed." + tail, "accept" );
		}
	}
	else{
		Edapt.utils.displayDialogue( "Remove Rig information", "You can unlink only the currently selected Symbol Instance.", "accept" );
	}
}


// HELPER FUNCTIONS
isAlreadyExists 			= function( element, aTimeline, currentLayernum, cf, n, inf ){
	var xinf = Edapt.utils.getData( element, "SMR" );
	if( ! xinf ){ return false; }
	return Boolean( xinf.rig == inf.rig &&  xinf.id == inf.id );
}
createSnapInfo				= function( myTimeline, element, rigDataObject ){
	var mtID = getMaxID( myTimeline, rigDataObject ); // Find maximum existing ID number
	var mySnaps = Edapt.utils.filterStageElements( Edapt.utils.isMagnetTarget, element.libraryItem.timeline, true, false, [] );
	return { id:mtID, snaps:mySnaps };
}
getMaxID					= function( myTimeline, inf ){
	var snaps = collectUniqueSnapObjects( myTimeline, inf );
	var maxID;
	if( snaps.length > 0 ){
		snaps.sort( sortOnID );
		maxID = Number( Edapt.utils.getData( snaps[ snaps.length-1 ], "SMR" ).id );
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
					if( ! Edapt.utils.include( retval, sno ) ){
						var data = Edapt.utils.getData( sno, "SMR" );
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
	if( Edapt.utils.isElementSymbol( element ) ){
		return Edapt.utils.filterStageElements( Edapt.utils.isMagnetTarget, element.libraryItem.timeline, true, false, [] );
	}
	return [];
}
sortOnID					= function( a, b ){
	return ( convertID( Edapt.utils.getData( a, "SMR" ).id ) - convertID( getData( b, "SMR" ).id ) );
}
convertID					= function( id ){
	if( id.length == 0 ){ return -1; }
	var retval = Number( id );
	return isNaN( retval ) ? 0 : retval;
}
getMyParent					= function( myTimeline, rigInfObj ){
	var parents = Edapt.utils.filterStageElements( getParent, myTimeline, false, true, [], rigInfObj );
	if( parents.length > 0 ){
		return parents[0];
	}
	return null;
}
getParent					= function( element, aTimeline, currentLayernum, cf, n, inf ){
	var data = Edapt.utils.getData( element, "SMR" );
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
		var data = Edapt.utils.getData( element, "SMR" );
		if( ! data ){ return false; }
		if( data.rig == inf.rig ){
			return true;
		}
		return false;
	}
	return false;
}
getMyChildren				= function( element, tml, children, recurs ){
	var retval = Edapt.utils.filterStageElements( isMyChild, tml, true, false, [ element ], Edapt.utils.getData( element, "SMR" ) );
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
	var data = Edapt.utils.getData( element, "SMR" );
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
	var i = layers.length;
	while ( i -- ){
		var cf = layers[i].frames[ currentframe ];
		if( cf ){
			var elts = cf.elements;
			var j = elts.length;
			while( j -- ){
				if( Edapt.utils.isElementSymbol( elts[j] ) ){
					retval.push( elts[j] );
				}
			}
		}
	}
	return retval;
}