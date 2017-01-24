var path = require('path')
var fs = require('fs')
var replace = require('replace-in-file')
var parallel = require('async/parallel')

var helper = require('./helper')
var configJson = require(helper.resolveMgnlCliJsonPath())

function replaceProperties (obj, instance, cb) {
  var pathToConfig = path.join(configJson.setupMagnolia.tomcatFolder, '/webapps/', instance, '/WEB-INF/config/default')

  if (!fs.existsSync(pathToConfig)) {
    console.log("Path '%s' not found. Skipping it...", pathToConfig)
    return cb(null)
  }

  console.log('Changing magnolia.properties at ' + pathToConfig + ' as follows:')

  var tasks = Object.keys(obj).map(function (key) {
    return function task (done) {
      console.log(key + '=' + obj[key])
      var regex = '(' + key.replace(/\./g, '\\.') + ')(\s*=\s*)(.+)'
      var replacement = '$1$2' + obj[key]
      var pathToProps = path.join(pathToConfig, 'magnolia.properties')

      replace({
        files: pathToProps,
        replace: new RegExp(regex),
        with: replacement
      }, done)
    }
  })

  parallel(tasks, cb)
}

function editProperties (cb) {
  if (configJson.setupMagnolia.webapps) {
    console.log('Replacing Magnolia properties to prepare it for light development...')
    replaceProperties(configJson.setupMagnolia.webapps.magnoliaAuthor, 'magnoliaAuthor', cb)
  // replaceProperties(configJson.setupMagnolia.webapps.magnoliaPublic, "magnoliaPublic")
  } else {
    console.log('No properties configuration found')
    cb(null)
  }
}

exports.editProperties = editProperties
