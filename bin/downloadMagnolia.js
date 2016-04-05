var fs = require('fs');
var path = require('path');
var ProgressBar = require("progress");
var request = require("request");

var packageJson = require('../package.json');
var tomcatFolder = path.normalize(packageJson.setupMagnolia.tomcatFolder);

if(fs.existsSync("./magnolia.zip")) {
    console.log("magnolia.zip exists. We won't download it again.")
    return;
} else if(!packageJson.setupMagnolia.downloadTomcatBundleFrom) {
    console.log("No Magnolia Tomcat bundle to download.")
    return;
}

request
  .get(packageJson.setupMagnolia.downloadTomcatBundleFrom)
  .on("response", function(res) {
      var len = parseInt(res.headers['content-length'], 10);
      var bar = new ProgressBar("Downloading Magnolia [:bar] :percent :etas", {
      width: 20,
      total: len});

      res.on('data', function (chunk) {
          bar.tick(chunk.length);
      });
   })
   .pipe(fs.createWriteStream("./magnolia.zip"))

