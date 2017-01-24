var jumpstart = require('../lib/jumpstart')
var helper = require('../lib/helper')

var program = require('commander')
var inquirer = require('inquirer')
var async = require('async')

var setup = function (program, credentials) {
  try {
    jumpstart.setupMagnolia(program, credentials, function (err) {
      if (err) throw err
    })
  } catch (e) {
    helper.printError(e)
    if (e.displayHelp) {
      program.outputHelp()
    }
  }
}

program
  .version(require('../package.json').version)
  .description('Downloads and sets up an instance of Magnolia CE or EE for light development in the current directory.')
  .option('-p, --path <path>', 'The path to the light modules root folder which will be observed for changes. If no path is provided, defaults to "light-modules" in the current folder. Light modules are created under this folder which is observed by Magnolia for changes. The path to such folder is the value of "magnolia.resources.dir" property at <magnoliaWebapp>/WEB-INF/config/default/magnolia.properties.')
  .option('-m, --magnolia-version <version>', 'If not provided defaults to the latest stable version.')
  .option('-i, --install-sample-module <name>', 'If provided, a sample light module under the light modules root folder with the given name is created.')
  .option('-e, --enterprise-edition', 'Will download a magnolia-enterprise-pro-demo-bundle. Requires credentials to Magnolia Nexus.')
  .parse(process.argv)

if (program.enterpriseEdition) {
  var credentials
  inquirer.prompt([
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

  async.until(
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
