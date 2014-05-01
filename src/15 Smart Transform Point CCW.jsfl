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
	runScript( "Smart Transform Point CCW" );
}catch( error ){
	fl.trace( error );
}
function runScript( commandname ){
	var doc = fl.getDocumentDOM();
	if( doc == null ){
		fl.trace( "No document open." );
		return;
	}
	if( fl.tools.altIsDown ){
		Edapt.SmartTransform.selectNextMagnetTarget( doc, "ccw", commandname );
	}else{
		Edapt.SmartTransform.selectNextRegPoint( doc, "ccw", commandname );
		if( Edapt.settings.SmartTransformPoint.showAlert == true && ! Edapt.settings.SmartTransformPoint.modifierUsed ){
			if( Edapt.SmartTransform.couner >= 5 ){
				var message = "Please note that 14 Smart Transform Point CW and 15 Smart Transform Point CCW can also work in Inverse mode.\n"+
				"This is activated with Alt+ the corresponding shortcut. Read more about these two commands online:";
				Edapt.utils.displayDialogue( commandname, message, null, "http://flash-powertools.com/smart-transform-point-cw-ccw/", "SmartTransformPoint" );
				Edapt.SmartTransform.couner = 0;
			}
		} 
	}
}