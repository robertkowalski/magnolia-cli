var fs = require('fs.extra');
var path = require('path');

var packageJson = require('../package.json');

function copyResources(from,to) {		
	var normalizedFrom = path.normalize(from);
	var normalizedTo = path.normalize(packageJson.config.outputPath + "/"+ packageJson.lightModuleName + to);
	if(fs.existsSync(normalizedFrom)) {
		fs.copyRecursive(normalizedFrom, normalizedTo, function (err) {
		  if (!err) {
		    console.log("Copied '"+normalizedFrom+"' to '"+normalizedTo+"'");
		  }
		});
	} else {
		console.log("can't found '"+normalizedFrom+"'");
	}
}

function lightDevCopyResources(){
	Object.keys(packageJson.lightDevCopyResources).forEach(function(key) {
		copyResources(key, packageJson.lightDevFoldersInModule[packageJson.lightDevCopyResources[key]])
	});
}

lightDevCopyResources();
