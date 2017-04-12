#!/usr/bin/env node

require('../lib/handleErrors.js')

const jumpstart = require('../lib/jumpstart')

const program = require('../lib/commander_shimmed.js')
const prompt = require('inquirer').prompt
const until = require('async').until
const i18next = require('../lib/bootstrap.js')()

function setup (program, credentials) {
  jumpstart.setupMagnolia(program, credentials, function (err) {
    if (err) throw err
  })
}

program
  .version(require('../package.json').version)
  .name('mgnl jumpstart')
  .description(i18next.t('mgnl-jumpstart--cmd-option-description'))
  .option('-p, --path <path>', i18next.t('mgnl-jumpstart--cmd-option-path'))
  .option('-m, --magnolia-version <version>', i18next.t('mgnl-jumpstart--cmd-option-version'))
  .option('-i, --install-sample-module <name>', i18next.t('mgnl-jumpstart--cmd-option-install-sample-module'))
  .option('-e, --enterprise-edition', i18next.t('mgnl-jumpstart--cmd-option-install-ee'))
  .parse(process.argv)

if (program.enterpriseEdition) {
  var credentials
  prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Username'
    },
    {
      type: 'password',
      message: 'Password',
      name: 'password'
    }
  ]
).then(function (answers) {
  credentials = answers
  // for the time being only EE pro-demo bundle is available
  // A NOW bundle should come soon
  credentials.type = 'EE Pro'
})

  until(
    function () {
      return typeof credentials !== 'undefined'
    },
    function (callback) {
      setTimeout(function () {
        callback(null)
      }, 500)
    },
    function () {
      setup(program, credentials)
    }
  )
} else {
  setup(program, credentials)
}
