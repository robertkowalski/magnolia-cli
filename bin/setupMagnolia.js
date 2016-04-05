var http = require('http');
var fs = require('fs');
var fse = require('fs.extra');
var path = require('path');
var AdmZip = require('adm-zip');

var packageJson = require('../package.json');


var download = function(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};

var tomcatFolder = path.normalize(packageJson.setupMagnolia.tomcatFolder);

if( !fs.existsSync(tomcatFolder) && packageJson.setupMagnolia.downloadTomcatBundleFrom) {
  download(packageJson.setupMagnolia.downloadTomcatBundleFrom,"./",function(){
    
    var downloadedFileName = packageJson.setupMagnolia.downloadTomcatBundleFrom.split("/");
    
    var zip = new AdmZip(""+downloadedFileName[downloadedFileName.lenght-1]);
    
    zip.extractEntryTo(tomcatFolder, tomcatFolder, false, false);

  });
}