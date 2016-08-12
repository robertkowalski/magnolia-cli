var path = require('path')
var fs = require('fs')
var replace = require('replace-in-file')

var helper = require('./helper')
var configJson = require(helper.resolveMgnlCliJsonPath())

var replaceProperties = function (obj, instance) {
  var pathToConfig = path.join(configJson.setupMagnolia.tomcatFolder, '/webapps/', instance, '/WEB-INF/config/default')
  if (!fs.existsSync(pathToConfig)) {
    console.log("Path '%s' not found. Skipping it...", pathToConfig)
    return
  }
  console.log('Changing magnolia.properties at ' + pathToConfig + ' as follows:')

  Object.keys(obj).forEach(function (key) {
    console.log(key + '=' + obj[key])

    var regex = '(' + key.replace(/\./g, '\\.') + ')(\s*=\s*)(.+)'
    var replacement = '$1$2' + obj[key]
    var pathToProps = path.join(pathToConfig, 'magnolia.properties')

    replace({
      files: pathToProps,
      replace: new RegExp(regex, 'g'),
      with: replacement
    }, function (e) {
      if (e) throw e
    })
  })
}

var editProperties = function () {
  if (configJson.setupMagnolia.webapps) {
    console.log('Replacing Magnolia properties to prepare it for light development...')
    replaceProperties(configJson.setupMagnolia.webapps.magnoliaAuthor, 'magnoliaAuthor')
  // replaceProperties(configJson.setupMagnolia.webapps.magnoliaPublic, "magnoliaPublic")
  } else {
    console.log('No properties configuration found')
  }
}

exports.editProperties = editProperties
