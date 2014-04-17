/*
Electric Dog Flash Animation Power Tools
Copyright (C) 2013  Vladin M. Mitov

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
	runScript( "Smart Transform Point CW" );
}catch( error ){
	fl.trace( error );
}
function runScript( commandname ){
	var MT = fl.tools.altIsDown;
	if( MT ){
		fl.runScript( fl.configURI + "Commands/Smart transform Point.edapt", 
		"selectNextMagnetTarget", "cw", commandname );
	}else{
		fl.runScript( fl.configURI + "Commands/Smart transform Point.edapt", 
		"selectNextRegPoint", "cw", commandname );
	}
}