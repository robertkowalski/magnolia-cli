var fs = require('fs-extra')
var path = require('path')
var helper = require('./helper')
var configJson = require(helper.resolveMgnlCliJsonPath())

var nodeModulesFolder = path.resolve(__dirname, '../node_modules')

var copyResources = function (lightModulesRoot, moduleName, from, to) {
  var normalizedFrom = path.join(nodeModulesFolder, from)
  var normalizedTo = path.join(lightModulesRoot, moduleName, to, from)

  if (fs.existsSync(normalizedFrom)) {
    fs.copy(normalizedFrom, normalizedTo, function (err) {
      if (err) {
        throw err
      }
    })
  } else {
    throw new Error("Can't find " + normalizedFrom)
  }
}

var copyLightDevResources = function (lightModulesRoot, moduleName) {
  Object.keys(configJson.lightDevCopyResources).forEach(function (key) {
    copyResources(lightModulesRoot, moduleName, key, configJson.lightDevFoldersInModule[configJson.lightDevCopyResources[key]])
  })
}

exports.copyLightDevResources = copyLightDevResources
