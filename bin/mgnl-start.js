#!/usr/bin/env node

require('../lib/handleErrors.js')

var packageJson = require('../package.json')
var path = require('path')
var helper = require('../lib/helper.js')
var MgnlCliError = helper.MgnlCliError
var program = require('../lib/commander_shimmed.js')
var findup = require('findup-sync')
var spawn = require('child_process').spawn
var log = require('npmlog')
var os = require('os')
var fs = require('fs')
var until = require('async').until

program
  .version(packageJson.version)
  .name('mgnl start')
  .description('Start up Magnolia and display the logs. Magnolia CLI looks in the current working directory or parent directories for the nearest folder starting with "apache-tomcat". To stop Magnolia, simply enter CTRL+C')
  .option('-p, --path <path>', 'The path to the apache-tomcat folder. If no path is provided, Magnolia CLI will look in the current working directory or parent directories for the nearest folder starting with "apache-tomcat"')
  .option('-d, --dont-ignore-open-files-check', 'Does not ignore the open files limit check (it is ignored by default). For more information, see https://documentation.magnolia-cms.com/display/DOCS/Known+issues#Knownissues-Toomanyopenfiles')
  .parse(process.argv)

var apacheTomcatFolder

if (program.path) {
  apacheTomcatFolder = findup('apache-tomcat*', {cwd: program.path})
} else {
  apacheTomcatFolder = findup('apache-tomcat*')
}
if (apacheTomcatFolder) {
  startUpMagnolia(apacheTomcatFolder)
} else {
  throw new MgnlCliError("Could not find any apache-tomcat folder. Can't start up Magnolia. Have you run 'mgnl jumpstart'?", true)
}

function startUpMagnolia (apacheTomcatFolder) {
  var magnoliaControl = path.join(apacheTomcatFolder, 'bin', os.platform() === 'win32' ? 'magnolia_control.bat' : 'magnolia_control.sh')

  if (!fs.existsSync(magnoliaControl)) {
    throw new MgnlCliError(magnoliaControl + " does not exist. Can't start up Magnolia.", true)
  }
  var ignoreOpenFilesLimit = program.dontIgnoreOpenFilesCheck ? '' : '--ignore-open-files-limit'
  // on Windows we need to change the cwd of the spawned process or the Tomcat scripts won't be able to resolve CATALINA_HOME env variable
  spawn(magnoliaControl, ['start', ignoreOpenFilesLimit], {stdio: 'inherit', cwd: path.join(apacheTomcatFolder, 'bin')})
  log.info('Starting Tomcat instance at ' + apacheTomcatFolder + '. To stop it, enter CTRL+C ')

  if (os.platform() !== 'win32') {
    var tail
    var catalinaOut = path.join(apacheTomcatFolder, 'logs', 'catalina.out')
    // catalina.out may not have been created yet
    until(
        function () {
          return fs.existsSync(catalinaOut)
        },
        function (callback) {
          setTimeout(function () {
            callback(null)
          }, 500)
        },
        function () {
          tail = spawn('tail', ['-f', catalinaOut], {stdio: 'inherit'})
        }
      )
  }
  // on Windows process.on('SIGINT', ..) apparently doesn't work, so here's a workaround
  if (os.platform() === 'win32') {
    var rl = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.on('SIGINT', function () {
      gracefulShutdown(magnoliaControl, tail)
    })
  }

  process.on('SIGINT', function () {
    gracefulShutdown(magnoliaControl, tail)
  })
}

function gracefulShutdown (magnoliaControl, tailProcess) {
  spawn(magnoliaControl, ['stop'], {stdio: 'inherit', cwd: path.join(apacheTomcatFolder, 'bin')})
  log.info('Magnolia is stopping...')

  if (tailProcess) {
    tailProcess.kill()
  }
}
