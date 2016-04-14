var fs = require('fs');
var path = require('path');
var ProgressBar = require("progress");
var request = require("request");

var packageJson = require('../package.json');
var tomcatFolder = path.normalize(packageJson.setupMagnolia.tomcatFolder);

if(fs.existsSync("./magnolia.zip")) {
    console.log("WARN: ","magnolia.zip exists. We won't download it again.")
    return;
} else if(!packageJson.setupMagnolia.downloadTomcatBundleFrom) {
    console.log("WARN: ","No Magnolia Tomcat bundle to download.")
    return;
} else {

  var piper = fs.createWriteStream("./magnolia.zip");
  
  request
    .get(packageJson.setupMagnolia.downloadTomcatBundleFrom)
    .on("response", function(res) {
    		console.log("DOWNLOADING: ",packageJson.setupMagnolia.downloadTomcatBundleFrom);
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
    console.log("DONE: ","Magnolia downloaded.");
  });
}

