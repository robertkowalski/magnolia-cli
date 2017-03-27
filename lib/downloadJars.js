var fs = require('fs')
var fse = require('fs-extra')
var path = require('path')
var ProgressBar = require('progress')
var request = require('request')

var helper = require('./helper')
var configJson = require(helper.resolveMgnlCliJsonPath())
var log = helper.logger
const i18next = require('./bootstrap.js')()

function downloadJars (done) {
  var jars = configJson.setupMagnolia.downloadJars

  if (!Object.keys(jars).length) {
    return done(null)
  }

  var urls = {}
  var downloadedJars = 0
  Object.keys(jars).forEach((jar) => {
    var url = jars[jar]
    var fileName = path.basename(url)
    urls[fileName] = url
  })
  Object.keys(urls).forEach((fileName) => {
    var piper = fs.createWriteStream('./' + fileName)

    request
      .get(urls[fileName])
      .on('response', (res) => {
        var len = parseInt(res.headers['content-length'], 10)

        const statusMsg = i18next.t(
          'download-jars--downloading',
          { fileName: fileName, interpolation: { escapeValue: false } }
        )

        const bar = new ProgressBar(statusMsg, {
          width: 20,
          total: len
        })

        res.on('data', (chunk) => {
          bar.tick(chunk.length)
        })
      })
      .pipe(piper)

    piper.on('close', () => {
      if (configJson.setupMagnolia.webapps) {
        downloadedJars++
        Object.keys(configJson.setupMagnolia.webapps).forEach((instance) => {
          if (fs.existsSync(path.join(configJson.setupMagnolia.tomcatFolder, '/webapps/', instance, '/WEB-INF/lib/'))) {
            var pathToFile = path.join(configJson.setupMagnolia.tomcatFolder, '/webapps/', instance, '/WEB-INF/lib/', fileName)
            if (!fs.existsSync(pathToFile)) {
              fs.rename(fileName, pathToFile, (err) => {
                if (err) throw err
                log.info(
                  i18next.t(
                    'download-jars--copied',
                    { fileName: fileName, interpolation: { escapeValue: false } }
                  )
                )
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
