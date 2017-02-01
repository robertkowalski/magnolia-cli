var fs = require('fs-extra')
var path = require('path')
var ProgressBar = require('progress')
var request = require('request')
var Promise = require('bluebird')

var helper = require('./helper')
var configJson = require(helper.resolveMgnlCliJsonPath())

var MgnlCliError = helper.MgnlCliError
var log = helper.logger

function download (to, zip, credentials, cb) {
  return new Promise(function (resolve, reject) {
    var pathToZip = path.join(to, zip)

    if (fs.existsSync(pathToZip)) {
      log.info("%s exists. We won't download it again.", zip)
      return resolve()
    }

    if (!configJson.setupMagnolia.downloadUrl) {
      var msg = [
        'No Magnolia Tomcat bundle to download.',
        'Please add it to mgnl-cli.json'
      ].join('\n')

      throw new MgnlCliError(msg, false)
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
          var msg = [
            'Error while trying to get ' + configJson.setupMagnolia.downloadUrl + '.',
            '',
            'Are the URL and/or your credentials to Nexus correct?'
          ].join('\n')

          throw new MgnlCliError(msg, false)
        }
        var len = parseInt(res.headers['content-length'], 10)
        log.info('Starting download from: ' + configJson.setupMagnolia.downloadUrl)
        var bar = new ProgressBar('Downloading Magnolia [:bar] :percent :etas', {
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
