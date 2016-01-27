var path = require('path');
var fs = require('fs');

var packageJson = require('../package.json');

function editMagnoliaProperties(){
	if(packageJson.editMagnoliaProperties){
		Object.keys(packageJson.editMagnoliaProperties).forEach(function(instance) {
			var pathToProperties = path.normalize(packageJson.editMagnoliaProperties[instance].path);
			readWriteSync(pathToProperties,packageJson.editMagnoliaProperties[instance].changes);
		});
	} else {
		console.log("no 'editMagnoliaProperties' configured");
	}
}

function readWriteSync(pathToProperties,changes) {
  	if(changes){
	  	if(fs.existsSync(path.normalize(pathToProperties))) {
		  	fs.readFile(path.normalize(pathToProperties), 'utf-8', function (err, data) {
			  	if (err) throw err;
			  	var newValue = data;
			  	
			  	Object.keys(changes).forEach(function(change) {
			  		newValue = newValue.replace(new RegExp(change+'=(.+)', 'i'), change+'='+changes[change]);
			  	});
			  	if(newValue){
				  	fs.writeFile(pathToProperties, newValue, 'utf-8', function (err, data) {
				  		if (err) throw err;
				  		console.log("'"+pathToProperties+"' file updated");
				  	});
			  	}
			  	
			});
		} else {
			console.warn("'"+pathToProperties+"' not found")
		}
	}
}

editMagnoliaProperties();