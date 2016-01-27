var fs = require('fs');
var fse = require('fs.extra');
var path = require('path');

var packageJson = require('../package.json');

var folders = [
	packageJson.lightDevResourcesFolder,
	packageJson.lightDevResourcesFolder + packageJson.lightDevModuleFolder
]

function createFolders() {	
	
	Object.keys(packageJson.lightDevFoldersInModule).forEach(function(key) {
		folders.push(packageJson.lightDevResourcesFolder + packageJson.lightDevModuleFolder + packageJson.lightDevFoldersInModule[key]);
	});
	
	folders.forEach(function (folder) {
		var normalizedFolder = path.normalize(folder);
		if(!fs.existsSync(normalizedFolder)) {
			if(fse.mkdirpSync(normalizedFolder)) {
				console.log("Resource folder '"+normalizedFolder+"' created.");
			} 
		}
	});
}

createFolders();