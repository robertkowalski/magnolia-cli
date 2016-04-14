var path = require('path');
var fs = require('fs');

var packageJson = require('../package.json');

function editMagnoliaProperties(){
	if(packageJson.setupMagnolia.webapps){
		Object.keys(packageJson.setupMagnolia.webapps).forEach(function(instance) {
			var pathToProperties = path.normalize("./"+packageJson.setupMagnolia.tomcatFolder+"/webapps/"+instance+"/WEB-INF/config"+packageJson.setupMagnolia.webapps[instance].modifyPropertyFile);
			readWriteSync(pathToProperties,packageJson.setupMagnolia.webapps[instance].changes);
		});
	} else {
		console.log("WARN: ","No 'editMagnoliaProperties' configured");
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
				  		console.log("DONE: ","'"+pathToProperties+"' updated");
				  	});
			  	}
			  	
			});
		} else {
			console.warn("WARN: ","'"+pathToProperties+"' not found");
		}
	}
}

editMagnoliaProperties();