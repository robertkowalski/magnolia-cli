var fs = require('fs-extra')
var path = require('path')
var ProgressBar = require('progress')
var request = require('request')
var Promise = require('bluebird')

var helper = require('./helper')
var configJson = require(helper.resolveMgnlCliJsonPath())

var MgnlCliError = helper.MgnlCliError
var log = helper.logger
const i18next = require('./bootstrap.js')()

function download (to, zip, credentials, cb) {
  return new Promise(function (resolve, reject) {
    var pathToZip = path.join(to, zip)

    if (fs.existsSync(pathToZip)) {
      log.info(
        i18next.t(
          'download-magnolia--info-bundle-exists',
          { file: zip, interpolation: { escapeValue: false } }
        )
      )
      return resolve()
    }

    if (!configJson.setupMagnolia.downloadUrl) {
      throw new MgnlCliError(i18next.t('download-magnolia--error-no-bundle-to-download'), false)
    }

    var tempDownload = './temp-magnolia.zip.download'

    var target = fs.createWriteStream(tempDownload)
    target.on('close', function () {
      fs.renameSync(tempDownload, zip)
      resolve()
    })

    request
      .get(configJson.setupMagnolia.downloadUrl)
      .auth(credentials.username, credentials.password, false)
      .on('response', function (res) {
        if (res.statusCode !== 200) {
          fs.removeSync(tempDownload)

          const msg = i18next.t(
            'download-magnolia--error-http-error',
            { url: configJson.setupMagnolia.downloadUrl, interpolation: { escapeValue: false } }
          )

          throw new MgnlCliError(msg, false)
        }
        var len = parseInt(res.headers['content-length'], 10)
        log.info(
          i18next.t(
            'download-magnolia--info-starting-download-from',
            { url: configJson.setupMagnolia.downloadUrl, interpolation: { escapeValue: false } }
          )
        )

        const statusMsg = i18next.t('download-magnolia--downloading')
        const bar = new ProgressBar(statusMsg, {
          width: 20,
          total: len
        })

        res.on('data', function (chunk) {
          bar.tick(chunk.length)
        })
      })
      .pipe(target)
  })
}

exports.download = download
