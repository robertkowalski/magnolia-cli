var fs = require('fs')
var path = require('path')
var ProgressBar = require('progress')
var request = require('request')
var truncateMiddle = require('truncate-middle')

var helper = require('./helper')
var configJson = require(helper.resolveMgnlCliJsonPath())

var download = function (to, zip) {
  var pathToZip = path.join(to, zip)

  if (fs.existsSync(pathToZip)) {
    console.log("%s exists. We won't download it again.", zip)
    return
  } else if (!configJson.setupMagnolia.downloadUrl) {
    console.log('No Magnolia Tomcat bundle to download.')
    return
  }

  var truncatedUrl = truncateMiddle(configJson.setupMagnolia.downloadUrl, 40, 60, '...')

  request
    .get(configJson.setupMagnolia.downloadUrl)
    .on('response', function (res) {
      if (res.statusCode !== 200) {
        console.log('Error while trying to get ' + configJson.setupMagnolia.downloadUrl + '. Is the URL correct?')
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

      res.on('end', function () {
        fs.renameSync('./temp-magnolia.zip.download', zip)
      })
    })
    .pipe(fs.createWriteStream('./temp-magnolia.zip.download'))
}

exports.download = download
