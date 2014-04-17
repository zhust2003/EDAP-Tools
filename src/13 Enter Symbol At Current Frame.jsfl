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
    runScript( "Enter Symbol At Current Frame" );
}catch( error ){
    fl.trace( error );
}

function runScript( commandname ){
    if( fl.getDocumentDOM() == null ){
        fl.trace( "No document open." );
        return;
    }
    var selection = fl.getDocumentDOM().selection;
    var check = validateSelection( selection );
    if( check == false ){
        Edapt.utils.displayMessage( commandname + " : Please, select a single symbol on the stage.", 1 );
    }
    else{
        var element = selection[0];
        var selectedSymbol = element.libraryItem;
        var theFrame = element.firstFrame;
        fl.getDocumentDOM().enterEditMode( "inPlace" );
        selectedSymbol.timeline.currentFrame = theFrame;
    }
}

function validateSelection( sel ){
    if( sel.length != 1 ){
        return false;
    }
    return( Edapt.utils.isElementSymbol( sel[0] ) );
}