var fs = require('fs')
var fse = require('fs-extra')
var path = require('path')
var ProgressBar = require('progress')
var request = require('request')

var packageJson = require('../package.json')

var downloadJars = function (done) {
  if (packageJson.setupMagnolia.downloadJars) {
    Object.keys(packageJson.setupMagnolia.downloadJars).forEach(function (jar) {
      var url = packageJson.setupMagnolia.downloadJars[jar]
      var fileName = url.split('/')[url.split('/').length - 1]

      var piper = fs.createWriteStream('./' + fileName)

      request
        .get(url)
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
        if (packageJson.setupMagnolia.webapps) {
          Object.keys(packageJson.setupMagnolia.webapps).forEach(function (instance) {
            var pathToLib = path.join(packageJson.setupMagnolia.tomcatFolder, '/webapps/', instance, '/WEB-INF/lib/')
            if (!fs.existsSync(path.join(pathToLib, fileName))) {
              fse.copyRecursive('./' + fileName, pathToLib, function (err) {
                if (err) {
                  throw err
                }
                console.log('%s copied to WEB-INF/lib/ of Magnolia webapps', fileName)
              })
            }
          })
          if (done) {
            done()
          }
          setTimeout(function () {
            fs.unlink('./' + fileName)
          }, 2000)
        }
      })
    })
  }
}

exports.download = downloadJars
