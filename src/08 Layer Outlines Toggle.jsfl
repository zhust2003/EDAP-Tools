/*
 Electric Dog Flash Animation Power Tools
 Copyright (C) 2011-2013  Vladin M. Mitov

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

try {
    runScript( "Layer Outlines Toggle" );
}catch( error ){
    fl.trace( error );
}
function runScript( commandname ){
    if( fl.getDocumentDOM() == null ){
        fl.trace( "No document open." );
        return;
    }
    var counter = 0;
    var affectedLayers = Edapt.utils.getLayers();
    for( var i=0; i < affectedLayers.length; i ++ ){
        var currentLayer = affectedLayers[i];
        forceModeToToggle( currentLayer );
        counter ++ ;
    }
    var tail = ( counter == 1 ) ? "" : "s";
    Edapt.utils.displayMessage( commandname + " : " + counter + " layer" + tail + " affected.", 2 );
}
function forceModeToToggle( cl ){
    var cm = cl.outline;
    cl.outline = !cm;
}