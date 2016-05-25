var AdmZip = require('adm-zip')
var path = require('path')
var fs = require('fs')
var util = require('util')
var packageJson = require('./helper').requirePackageJson()

var extract = function (to, zipPath) {
  var tomcatFolder = path.join(to, packageJson.setupMagnolia.tomcatFolder)

  if (fs.existsSync(tomcatFolder)) {
    console.log("%s already exists. We won't extract it again.", tomcatFolder)
    return
  }

  console.log('Extracting...')
  try {
    var zip = new AdmZip(path.join(to, zipPath))
  } catch (e) {
    throw new Error(util.format('An error occurred: %s. Is the zip file perhaps corrupted? Try to remove it and download it again.', e))
  }

  var zipEntries = zip.getEntries()

  zipEntries.forEach(function (zipEntry) {
    if (zipEntry.entryName.match(/^(magnolia).*(\/apache-tomcat).*\/$/) && zipEntry.entryName.split('/').length < 4) {
      console.log(zipEntry.entryName, 'to', tomcatFolder)
      if (zip.extractEntryTo(zipEntry.entryName, tomcatFolder, false, false)) {
        console.log('Extraction completed')
      }
    }
  })

  // workaround: for some reason AdmZip seems to skip empty folders. This means that Tomcat's logs folder isn't found when
  // starting up the container which eventually leads to abort the process
  var tomcatLogs = path.join(tomcatFolder, 'logs')
  if (!fs.existsSync(tomcatLogs)) {
    fs.mkdirSync(tomcatLogs)
  }
  // sets scripts as executable
  fs.readdirSync(path.join(tomcatFolder, 'bin')).forEach(function (file) {
    fs.chmodSync(path.join(tomcatFolder, 'bin', file), '755')
  })
}

exports.extract = extract
