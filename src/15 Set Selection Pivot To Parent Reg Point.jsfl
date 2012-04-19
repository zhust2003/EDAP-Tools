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

try {
	runScript( "Set Selection Pivot To Parent Reg Point" );
}catch( error ){
	fl.trace( error );
}


function runScript( commandname ){
	if( fl.getDocumentDOM() == null ){
		fl.trace( "No document open." );
		return;
	}
	fl.runScript( fl.configURI + "Javascript/EDAPT Common Functions.jsfl" );
	initialize();
	if( ! EDAPSettings ){
	  displayMessage( commandname + " : Please, select a symbol and execute 'Record Parent Reg Point' command first.", 1 )
	} 
	else{
		var parent = EDAPSettings.recordParentRegPoint.currentElement;
		if( parent.instanceType == "symbol" ){
			sl = fl.getDocumentDOM().selection.length;
			if( sl > 1 ){
				fl.getDocumentDOM().setTransformationPoint( { x:parent.matrix.tx, y:parent.matrix.ty } );
			}
			else{
				if( EDAPSettings.setSelectionPivotToParentRegPoint.showAlert == true ){
					var message = "&quot;" + commandname + "&quot; requires multiple objects to be selected."+"\n"+
					"The command moves the pivot point of the selected group to a location previously recorded by"+"\n"+
					"running &quot;Record Parent Reg Point&quot;."+"\n"+"\n"+
					"Example:"+"\n"+
					"When hinging of the whole arm (upper arm + lower arm + hand) should happen in shoulder, and multiple"+"\n"+
					"Symbols are selected, Flash positions the pivot of the group in the middle of selection&#39;s bounding box."+"\n"+
					"Upon activation the pivot is re-located to previously recorded coordinates, in this case shoulder&#39;s "+"\n"+
					"Registration Point. This allows the whole arm to be rotated from the shoulder.";
					displayOptionalMessageBox( commandname, message, "set_selection_pivot_to_parent" );
					displayMessage( commandname + " : This command works with multiple selection only", 1 )
					return;
				}
			}
		}
		else{
			displayMessage( commandname + " : Please, select a symbol and execute 'Record Parent Reg Point' command first.", 1 )
		}
	}
}