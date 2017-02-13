#!/usr/bin/env node

require('../lib/handleErrors.js')

var jumpstart = require('../lib/jumpstart')

var program = require('../lib/commander_shimmed.js')
var prompt = require('inquirer').prompt
var until = require('async').until

function setup (program, credentials) {
  jumpstart.setupMagnolia(program, credentials, function (err) {
    if (err) throw err
  })
}

program
  .version(require('../package.json').version)
  .name('mgnl jumpstart')
  .description('Downloads and sets up an instance of Magnolia CE or EE for light development in the current directory.')
  .option('-p, --path <path>', 'The path to the light modules root folder which will be observed for changes. If no path is provided, defaults to "light-modules" in the current folder. Light modules are created under this folder which is observed by Magnolia for changes. The path to such folder is the value of "magnolia.resources.dir" property at <magnoliaWebapp>/WEB-INF/config/default/magnolia.properties.')
  .option('-m, --magnolia-version <version>', 'If not provided defaults to the latest stable version.')
  .option('-i, --install-sample-module <name>', 'If provided, a sample light module under the light modules root folder with the given name is created.')
  .option('-e, --enterprise-edition', 'Will download a magnolia-enterprise-pro-demo-bundle. Requires credentials to Magnolia Nexus.')
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
