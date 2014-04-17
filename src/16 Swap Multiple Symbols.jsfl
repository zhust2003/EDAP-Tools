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
    runScript( "Swap Multiple Symbols" );
}catch( error ){
    fl.trace( error );
}

function runScript( commandname ){
    if( fl.getDocumentDOM() == null ){
        fl.trace( "No document open." );
        return;
    }
    if( fl.getDocumentDOM().library.getSelectedItems().length != 1 ){
        Edapt.utils.displayMessage( commandname + " : Please, select a single library item.", 1 );
        return;
    }
    var selItem = fl.getDocumentDOM().library.getSelectedItems()[0];
    if( selItem.itemType != "graphic" &&  selItem.itemType != "button" && selItem.itemType != "movie clip" ){
        Edapt.utils.displayMessage( commandname + " : Please, select a single SYMBOL in the library.", 1 );
        return;
    }
    var selElements = fl.getDocumentDOM().selection;
    var replaced = 0;
    var skipped = 0;
    if( selElements.length > 0){
        for( var i = 0; i < selElements.length; ++i ){
            var element = selElements[i];
            fl.getDocumentDOM().selectNone();
            fl.getDocumentDOM().selection = [ element ];
            if( Edapt.utils.isElementSymbol( element ) == true ){
                fl.getDocumentDOM().swapElement( selItem.name );
                replaced ++ ;
            }
            else{
                skipped ++;
            }
        }
        fl.getDocumentDOM().selection = selElements;
        var tail = ( replaced == 1 ) ? "" : "s";
        Edapt.utils.displayMessage( commandname + " : " + replaced + " element" + tail + " was replaced, " + skipped + " was skipped.", 2 );
    }
    else{
        Edapt.utils.displayMessage( commandname + " : Please, select a single element on the stage", 1 );
    }
}