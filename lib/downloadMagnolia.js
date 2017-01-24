var fs = require('fs-extra')
var path = require('path')
var ProgressBar = require('progress')
var request = require('request')
var truncateMiddle = require('truncate-middle')

var helper = require('./helper')
var configJson = require(helper.resolveMgnlCliJsonPath())

function download (to, zip, credentials, cb) {
  var pathToZip = path.join(to, zip)

  if (fs.existsSync(pathToZip)) {
    console.log("%s exists. We won't download it again.", zip)
    return cb(null)
  } else if (!configJson.setupMagnolia.downloadUrl) {
    console.error('No Magnolia Tomcat bundle to download.')
    // XXX deep fix with introduction of "usage errors"
    return cb(null)
  }

  var truncatedUrl = truncateMiddle(configJson.setupMagnolia.downloadUrl, 40, 60, '...')
  var tempDownload = './temp-magnolia.zip.download'

  var target = fs.createWriteStream(tempDownload)
  target.on('close', function () {
    fs.renameSync(tempDownload, zip)
    cb(null)
  })

  request
    .get(configJson.setupMagnolia.downloadUrl)
    .auth(credentials.username, credentials.password, false)
    .on('response', function (res) {
      if (res.statusCode !== 200) {
        helper.printError('Error while trying to get ' + configJson.setupMagnolia.downloadUrl + '. Is the URL and/or your credentials to Nexus correct?')
        fs.removeSync(tempDownload)
        process.exit(1)
      }
      var len = parseInt(res.headers['content-length'], 10)
      var bar = new ProgressBar('Downloading ' + truncatedUrl + ' [:bar] :percent :etas', {
        width: 20,
        total: len
      })

      res.on('data', function (chunk) {
        bar.tick(chunk.length)
      })
    })
    .pipe(target)
}

exports.download = download
