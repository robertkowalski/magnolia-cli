const fs = require('fs-extra')
const path = require('path')
const ProgressBar = require('progress')
const request = require('request')
const Promise = require('bluebird')

const helper = require('./helper')
const configJson = require(helper.resolveMgnlCliJsonPath())

const MgnlCliError = helper.MgnlCliError
const log = helper.logger
const i18next = require('./bootstrap.js')()

function download (to, zip, credentials, cb) {
  return new Promise((resolve, reject) => {
    const pathToZip = path.join(to, zip)

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

    const tempDownload = './temp-magnolia.zip.download'

    const target = fs.createWriteStream(tempDownload)
    target.on('close', () => {
      fs.renameSync(tempDownload, zip)
      resolve()
    })

    request
      .get(configJson.setupMagnolia.downloadUrl)
      .auth(credentials.username, credentials.password, false)
      .on('response', (res) => {
        if (res.statusCode !== 200) {
          fs.removeSync(tempDownload)

          const msg = i18next.t(
            'download-magnolia--error-http-error',
            { url: configJson.setupMagnolia.downloadUrl, interpolation: { escapeValue: false } }
          )

          throw new MgnlCliError(msg, false)
        }
        const len = parseInt(res.headers['content-length'], 10)
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

        res.on('data', (chunk) => {
          bar.tick(chunk.length)
        })
      })
      .pipe(target)
  })
}

exports.download = download
