var watch = require('watch')
var path = require('path')

global.__base = __dirname + '/'
var buildBootstrap = require(__base + 'buildBootstrap')

var packageJson = require('../package.json')
var folderToWatch = path.normalize(packageJson.config.outputPath + '/' + packageJson.lightModuleName + packageJson.lightDevFoldersInModule.cssWatch)
var buildedCss = path.normalize(packageJson.config.outputPath + '/' + packageJson.lightModuleName + packageJson.lightDevFoldersInModule.css + '/bootstrap.css')

watch.watchTree(folderToWatch, function (f, curr, prev) {
  if (typeof f == 'object' && prev === null && curr === null) {
    buildBootstrap.buildLess()
    console.log('%s is now watched for changes', folderToWatch)
  } else if (prev === null) {
    console.log('New file in %s detected.', folderToWatch)
    buildBootstrap.buildLess()
  } else if (curr.nlink === 0) {
    console.log('Some file was removed in %s detected.', folderToWatch)
    buildBootstrap.buildLess()
  } else {
    console.log('File changed in %s detected.', folderToWatch)
    buildBootstrap.buildLess()
  }
})
