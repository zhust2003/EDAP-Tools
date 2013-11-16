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
  
 version: 2.0.3
 */

try {
    runScript( "Next Frame In Symbol" );
}catch( error ){
    fl.trace( error );
}

function runScript( commandname ){
    if( fl.getDocumentDOM() == null ){
        fl.trace( "No document open." );
        return;
    }
    var sl = fl.getDocumentDOM().selection.length;
    for( var i = 0; i < sl; i ++ ){
        var el = fl.getDocumentDOM().selection[i];									// Get the selected element
        if( Edapt.utils.isElementSymbol( el ) == true ){							// If the selected element is movieclip, button or graphis..
            var selectedSymbol = el.libraryItem;									// Get the source of the instance
            var fcount = selectedSymbol.timeline.frameCount;						// And check the frame count in the timeliene of the element
            if( fcount <= 1 ){
                Edapt.utils.displayMessage( commandname + " : The timeline of the selected element contains only 1 frame.", 2 );
            }
            else{
                el.firstFrame = increaseFrame( el.firstFrame, fcount );
            }
        }
        else{
            Edapt.utils.displayMessage( commandname + " : There is no timeline in the selected element.", 1 );
        }
    }
}

function increaseFrame( cf, fcnt ){
    if ( cf == fcnt - 1 ){
        cf = 0;
    }else{
        cf ++;
    }
    return cf;
}