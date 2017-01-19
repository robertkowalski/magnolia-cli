var fs = require('fs')
var fse = require('fs-extra')
var path = require('path')
var ProgressBar = require('progress')
var request = require('request')

var helper = require('./helper')
var configJson = require(helper.resolveMgnlCliJsonPath())

function downloadJars (done) {
  var jars = configJson.setupMagnolia.downloadJars

  if (!Object.keys(jars).length) {
    return done(null)
  }

  var urls = {}
  var downloadedJars = 0
  Object.keys(jars).forEach(function (jar) {
    var url = jars[jar]
    var fileName = path.basename(url)
    urls[fileName] = url
  })
  Object.keys(urls).forEach(function (fileName) {
    var piper = fs.createWriteStream('./' + fileName)

    request
      .get(urls[fileName])
      .on('response', function (res) {
        var len = parseInt(res.headers['content-length'], 10)
        var bar = new ProgressBar('Downloading ' + fileName + ' [:bar] :percent :etas', {
          width: 20,
          total: len
        })

        res.on('data', function (chunk) {
          bar.tick(chunk.length)
        })
      })
      .pipe(piper)

    piper.on('close', function () {
      if (configJson.setupMagnolia.webapps) {
        downloadedJars++
        Object.keys(configJson.setupMagnolia.webapps).forEach(function (instance) {
          if (fs.existsSync(path.join(configJson.setupMagnolia.tomcatFolder, '/webapps/', instance, '/WEB-INF/lib/'))) {
            var pathToFile = path.join(configJson.setupMagnolia.tomcatFolder, '/webapps/', instance, '/WEB-INF/lib/', fileName)
            if (!fs.existsSync(pathToFile)) {
              fs.rename(fileName, pathToFile, function (err) {
                if (err) throw err
                console.log('%s copied to WEB-INF/lib/ of Magnolia webapps', fileName)
              })
            } else {
              fse.remove(fileName)
            }
          }
        })
        if (done && downloadedJars === Object.keys(urls).length) {
          done(null)
        }
      }
    })
  })
}

exports.download = downloadJars
