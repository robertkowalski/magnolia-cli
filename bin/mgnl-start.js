#!/usr/bin/env node

require('../lib/handleErrors.js')

var packageJson = require('../package.json')
var path = require('path')
const helper = require('../lib/helper.js')
var MgnlCliError = helper.MgnlCliError
var program = require('../lib/commander_shimmed.js')
var spawn = require('child_process').spawn
const execFile = require('child_process').execFile
const log = helper.logger
const findTomcat = helper.findTomcat
var os = require('os')
var fs = require('fs')
var until = require('async').until
const i18next = require('../lib/bootstrap.js')()

program
  .version(packageJson.version)
  .name('mgnl start')
  .description(i18next.t('mgnl-start--cmd-option-description'))
  .option('-p, --path <path>', i18next.t('mgnl-start--cmd-option-path'))
  .option('-d, --dont-ignore-open-files-check', i18next.t('mgnl-start--cmd-option-dont-ignore-open-files-check'))
  .parse(process.argv)

const apacheTomcatFolder = findTomcat(program.path)
if (apacheTomcatFolder) {
  startUpMagnolia(apacheTomcatFolder)
} else {
  throw new MgnlCliError(
    i18next.t('mgnl-start--cmd-error-tomcat-notfound'),
    true
  )
}

function startUpMagnolia (apacheTomcatFolder) {
  var magnoliaControl = path.join(apacheTomcatFolder, 'bin', os.platform() === 'win32' ? 'magnolia_control.bat' : 'magnolia_control.sh')

  if (!fs.existsSync(magnoliaControl)) {
    throw new MgnlCliError(
      i18next.t(
        'mgnl-start--cmd-error-magnolia-control-not-exists',
        { file: magnoliaControl, interpolation: { escapeValue: false } }
      ),
      true
    )
  }
  var ignoreOpenFilesLimit = program.dontIgnoreOpenFilesCheck ? '' : '--ignore-open-files-limit'
  // on Windows we need to change the cwd of the spawned process or the Tomcat scripts won't be able to resolve CATALINA_HOME env variable
  execFile(magnoliaControl, ['start', ignoreOpenFilesLimit], {stdio: 'inherit', cwd: path.join(apacheTomcatFolder, 'bin')})

  log.important(
    i18next.t(
      'mgnl-start--cmd-important-starting-tomcat',
      { apacheTomcatFolder: apacheTomcatFolder, interpolation: { escapeValue: false } }
    )
  )

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
  // on Windows process.on('SIGINT', ..) apparently doesn't work (in all cases), so here's a workaround
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
  execFile(magnoliaControl, ['stop'], {stdio: 'inherit', cwd: path.join(apacheTomcatFolder, 'bin')}, (error, stdout, stderr) => {
    if (error || stderr && (stderr.indexOf('SEVERE:') > 0)) {
      log.error(
        i18next.t(
          'mgnl-start--cmd-error-shutdown-failed',
          { file: magnoliaControl, interpolation: { escapeValue: false } }
        )
      )
      log.error(stderr)

      exit(1, tailProcess)
    }

    exit(0, tailProcess)
  })
  log.important(i18next.t('mgnl-start--cmd-important-stopping'))

  // on windows, the script doesn't terminate automatically, so we exit manually after a while
  setTimeout(() => exit(0, tailProcess), 3000)
}

function exit (code, tailProcess) {
  if (tailProcess) {
    tailProcess.kill()
  }

  process.exit(code)
}
