var AdmZip = require('adm-zip')
var path = require('path')
var fs = require('fs')
var helper = require('./helper')
var configJson = require(helper.resolveMgnlCliJsonPath())
var log = helper.logger
const i18next = require('./bootstrap.js')()
const MgnlCliError = helper.MgnlCliError

var extract = function (to, zipPath) {
  var tomcatFolder = path.join(to, configJson.setupMagnolia.tomcatFolder)

  if (fs.existsSync(tomcatFolder)) {
    log.info(
      i18next.t(
        'extract-magnolia--info-tomcat-already-exists',
        { tomcatFolder: tomcatFolder, interpolation: { escapeValue: false } }
      )
    )
    return
  }

  log.info(i18next.t('extract-magnolia--info-extracting'))

  try {
    var zip = new AdmZip(path.join(to, zipPath))
  } catch (e) {
    const msg = i18next.t(
      'extract-magnolia--error-extract-error',
      { error: e, interpolation: { escapeValue: false } }
    )
    throw new MgnlCliError(msg)
  }

  var zipEntries = zip.getEntries()

  zipEntries.forEach(function (zipEntry) {
    if (zipEntry.entryName.match(/^(magnolia).*(\/apache-tomcat).*\/$/) && zipEntry.entryName.split('/').length < 4) {
      const msg = i18next.t(
        'extract-magnolia--info-extract-from-to',
        { entry: zipEntry.entryName, folder: tomcatFolder, interpolation: { escapeValue: false } }
      )
      log.info(msg)

      if (zip.extractEntryTo(zipEntry.entryName, tomcatFolder, false, false)) {
        log.info(i18next.t('extract-magnolia--info-extract-complete'))
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
