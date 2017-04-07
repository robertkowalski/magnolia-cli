const AdmZip = require('adm-zip')
const path = require('path')
const fs = require('fs')
const helper = require('./helper')
const configJson = require(helper.resolveMgnlCliJsonPath())
const log = helper.logger
const i18next = require('./bootstrap.js')()
const MgnlCliError = helper.MgnlCliError

const extract = function (to, zipPath) {
  const tomcatFolder = path.join(to, configJson.setupMagnolia.tomcatFolder)

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

  const zipEntries = zip.getEntries()

  zipEntries.forEach((zipEntry) => {
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
  const tomcatLogs = path.join(tomcatFolder, 'logs')
  if (!fs.existsSync(tomcatLogs)) {
    fs.mkdirSync(tomcatLogs)
  }
  // sets scripts as executable
  fs.readdirSync(path.join(tomcatFolder, 'bin')).forEach((file) => {
    fs.chmodSync(path.join(tomcatFolder, 'bin', file), '755')
  })
}

exports.extract = extract
