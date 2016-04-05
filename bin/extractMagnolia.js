var AdmZip = require("adm-zip");
var path = require('path');
var fs = require('fs');

var packageJson = require('../package.json');
var tomcatFolder = path.normalize(packageJson.setupMagnolia.tomcatFolder);

if (fs.existsSync(tomcatFolder)) {
    console.log(tomcatFolder + " already exists. We won't extract it again.")
    return;
}

console.log("Extracting ...")

var zip = new AdmZip("magnolia.zip");

var zipEntries = zip.getEntries();

zipEntries.forEach(function (zipEntry) {
    if (zipEntry.entryName.match(/^(magnolia).*(\/apache-tomcat).*\/$/) && zipEntry.entryName.split('/').length < 4) {
        console.log(zipEntry.entryName, "to", tomcatFolder);
        if (zip.extractEntryTo(zipEntry.entryName, tomcatFolder, false, false)) {
            console.log("Extraction completed");
        }
    }
});

//workaround: for some reason AdmZip seems to skip empty folders. This means that Tomcat's logs folder isn't found when
//starting up the container which eventually leads to abort the process
var tomcatLogs = path.join(tomcatFolder, 'logs');
if (!fs.existsSync(tomcatLogs)) {
    fs.mkdirSync(tomcatLogs);
}
//sets scripts as executable
fs.readdirSync(path.join(tomcatFolder, 'bin')).forEach(function (file) {
    fs.chmodSync(path.join(tomcatFolder, 'bin', file), '755')
});
