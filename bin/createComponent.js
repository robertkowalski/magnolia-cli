#! /usr/bin/env node

var path = require('path');
var fs = require('fs');
var fse = require('fs.extra');
var createFromPrototype = require('./createFromPrototype');
var addAvailability = require('./addAvailability');

var packageJson = require('../package.json');

var prototypesFolder = "./_prototypes";

var userArgs = process.argv.slice(2);
var newComponentName = userArgs[0];
var availabilityPatern = userArgs[1];

var createComponent = function() {
	if(newComponentName){
		
		var templateDefinitionFile = packageJson.config.outputPath + "/"+ packageJson.lightModuleName + packageJson.lightDevFoldersInModule.templates_components + "/" + newComponentName + ".yaml";
		var templateDefinitionId = packageJson.lightModuleName +":"+ packageJson.lightDevFoldersInModule.templates_components.replace("/templates/","") + "/" + newComponentName;
		var templateScriptFile = packageJson.config.outputPath + "/"+ packageJson.lightModuleName + packageJson.lightDevFoldersInModule.templates_components + "/" + newComponentName + ".ftl";
		var dialogDefinitionFile = packageJson.config.outputPath + "/"+ packageJson.lightModuleName + packageJson.lightDevFoldersInModule.dialogs_components + "/" + newComponentName + ".yaml";
		var dialogDefinitionId = packageJson.lightModuleName +":"+ packageJson.lightDevFoldersInModule.dialogs_components.replace("/dialogs/","") + "/" + newComponentName;
		
		// component definition
		if(fs.existsSync(path.normalize(templateDefinitionFile))) {
			console.log("WARN: ","'"+newComponentName+"' component template already exists");
		} else {
			createFromPrototype.createFromPrototype("/component/definition.yaml",templateDefinitionFile,{"__name__":newComponentName,"__templateScript__":templateScriptFile.replace(packageJson.config.outputPath,""),"__dialog__":dialogDefinitionId});		
			if(availabilityPatern){
				addAvailability.addAvailabilityWhenCreated(templateDefinitionId,availabilityPatern);
			}
		}
		
		// template script
		if(!fs.existsSync(path.normalize(templateScriptFile))) {
			createFromPrototype.createFromPrototype("/component/template.ftl",templateScriptFile,{"__name__":newComponentName});
		} else {
			console.log("WARN: ","'"+newComponentName+"' ["+templateScriptFile+"] templateScript already exists");
		}
		
		// dialog
		if(!fs.existsSync(path.normalize(dialogDefinitionFile))) {
			createFromPrototype.createFromPrototype("/component/dialog.yaml",dialogDefinitionFile,{"__name__":newComponentName});
		} else {
			console.log("WARN: ","'"+dialogDefinitionFile+"' dialog already exists");
		}
		
	} else {
		console.log("ERROR: ","Template name is missing, try again e.g. 'add-component <component-name>'");
	}
};

var exports = module.exports = {
	createComponent
};


createComponent();