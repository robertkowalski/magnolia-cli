#! /usr/bin/env node

var path = require('path');
var fs = require('fs');
var createFromPrototype = require('./createFromPrototype');

var packageJson = require('../package.json');

var userArgs = process.argv.slice(2);
var newPageName = userArgs[0];

var createPage = function() {	
	
	if(newPageName){
		
		var templateDefinitionFile = packageJson.config.outputPath + "/"+ packageJson.lightModuleName + packageJson.lightDevFoldersInModule.templates_pages + "/" + newPageName + ".yaml";
		var templateScriptFile = packageJson.config.outputPath + "/"+ packageJson.lightModuleName + packageJson.lightDevFoldersInModule.templates_pages + "/main.ftl";
		var dialogDefinitionFile = packageJson.config.outputPath + "/"+ packageJson.lightModuleName + packageJson.lightDevFoldersInModule.dialogs_pages + "/" + newPageName + ".yaml";
		var dialogDefinitionId = packageJson.lightModuleName +":"+ packageJson.lightDevFoldersInModule.dialogs_pages.replace("/dialogs/","") + "/" + newPageName;
		
		// page definition
		if(fs.existsSync(path.normalize(templateDefinitionFile))) {
			console.log("'"+newPageName+"' page template already exists")
		} else {
			createFromPrototype.createFromPrototype("/page/definition.yaml",templateDefinitionFile,{"__name__":newPageName,"__templateScript__":templateScriptFile.replace(packageJson.config.outputPath,""),"__dialog__":dialogDefinitionId});
		}
		
		// template script
		if(!fs.existsSync(path.normalize(templateScriptFile))) {
			createFromPrototype.createFromPrototype("/page/template.ftl",templateScriptFile,{"__name__":newPageName,"__lightDevModuleFolder__":"/"+ packageJson.lightModuleName});
		} else {
			console.log("'"+templateScriptFile+"' templateScript already exists")
		}
		
		// dialog
		if(!fs.existsSync(path.normalize(dialogDefinitionFile))) {
			createFromPrototype.createFromPrototype("/page/dialog.yaml",dialogDefinitionFile,{"__name__":newPageName});
		} else {
			console.log("'"+dialogDefinitionFile+"' dialog already exists")
		}
		
	} else {
		console.log("template name is missing, try again e.g. 'addPage myHome'");
	}

}

var exports = module.exports = {
	createPage
}

createPage();