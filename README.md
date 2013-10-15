###In order to get the commands to function, the files have to be organized in the following way:
All commands (1 to 23) have to be in the 'Commands' folder.
All files with .swf extension have to be in 'XULControls' folder.
EDAPT Loader.jsfl and EDAPTversion.txt have to be in the 'Tools' folder.
Edapt.dll has to be in the 'External Libraries' folder.

To display EDAPT functions specification in the output panel, execute the following line of JSFL code:
  ```fl.trace( Edapt.specification() );```

All the above mentioned folders (Commands, Javascript, WindowSWF and XULControls) are located in Flash Configuration directory – called 'flashConfig' for convenience.
```
flashConfig\
	Commands\
		01 Convert To Symbol Preserving Layers.jsfl
		02 LB Find And Replace.jsfl
		03 LB Prefix Suffix.jsfl
		04 LB Trim Characters.jsfl
		05 LB Enumeration.jsfl
		06 Next Frame In Symbol.jsfl
		07 Prev Frame In Symbol.jsfl
		08 Layer Outlines Toggle.jsfl
		09 Layer Guide Toggle.jsfl
		10 Layer Color Dark.jsfl
		11 Layer Color Light.jsfl
		12 Set Reg Point To Transform Point.jsfl
		13 Enter Symbol At Current Frame.jsfl
		14 Record Parent Reg Point.jsfl
		15 Set Selection Pivot To Parent Reg Point.jsfl
		16 Swap Multiple Symbols.jsfl
		17 Sync Symbols to Timeline.jsfl
		18 Create Magnet Target.jsfl
		19 Smart Magnet Joint.jsfl
		20 Smart Transform.jsfl
		21 Convert To Keyframe Advanced.jsfl
		22 EDAPT Help.jsfl
		23 EDAPT Settings.jsfl

	External Libraries\
		Edapt.dll
	
	Tools\
		EDAPT Loader.jsfl
		EDAPTversion.txt
		
	WindowSWF\
		Smart Magnet Rig.swf
		SmartMagnetRig.jsfl
		
	XULControls\
		EDAPT Help.swf
		EDAPT Shortcuts Map.swf
		EDAPT url.swf
```
For questions, suggestions or bug reports, please, use the EDAP Tools ticket system
http://www.flash-powertools.com/hesk/
