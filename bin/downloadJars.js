var fs = require('fs');
var fse = require('fs.extra');
var path = require('path');
var ProgressBar = require("progress");
var request = require("request");

var packageJson = require('../package.json');
var tomcatFolder = path.normalize(packageJson.setupMagnolia.tomcatFolder);

function downloadJars(){
  if(packageJson.setupMagnolia.downloadJars){
		Object.keys(packageJson.setupMagnolia.downloadJars).forEach(function(jar) {
  		
  		console.log("DOWNLOADING: ",packageJson.setupMagnolia.downloadJars[jar]);
  		
  		var url = packageJson.setupMagnolia.downloadJars[jar]; 
  		var fileName = url.split('/')[url.split('/').length-1];
			
			var piper = fs.createWriteStream("./"+fileName);
			
			request
        .get(url)
        .on("response", function(res) {
            var len = parseInt(res.headers['content-length'], 10);
            var bar = new ProgressBar("[:bar] :percent :etas", {
            width: 20,
            total: len});
      
            res.on('data', function (chunk) {
                bar.tick(chunk.length);
            });
         })
         .pipe(piper);
         
      piper.on('close', function(){
      	if(packageJson.setupMagnolia.webapps){
      		Object.keys(packageJson.setupMagnolia.webapps).forEach(function(instance) {
      			var pathToLib = path.normalize("./"+packageJson.setupMagnolia.tomcatFolder+"/webapps/"+instance+"/WEB-INF/lib/");
      			fse.copyRecursive("./"+fileName, pathToLib, function (err) {
        		  if (!err) {
        		    console.log("DONE: ","'"+fileName+" downloaded and copied to '"+pathToLib+"");
        		  }
        		});
      		});
      		setTimeout(function(){ 
        		fs.unlink("./"+fileName); 
          }, 2000);
      	}
      });
         
         
		});
	}
}

downloadJars();