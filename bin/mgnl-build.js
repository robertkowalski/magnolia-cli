var packageJson = require('../package.json')
var program = require('commander')
var build = require('@magnolia/magnolia-build')

// TODO: change the usage text!!!
program
  .version(packageJson.version)
  .description('Scan a node_modules folder for npm packages with the keyword "magnolia-light-module (in package.json) and extract them to a directory of choice. This way you can point your Magnolia instance"s resource dir to that particular folder.')
  .option('-n, --node-modules <path>', 'The path to the node_modules folder to scan. If no path is provided, then the current directory is assumed to contain a folder "node_modules" which will be scanned for the modules with "magnolia-light-module" keyword.')
  .option('-p, --path <path>', 'The path to the light modules root folder. If no path is provided, then the current directory is assumed to contain a "light-modules" root folder and the extraction will happen here.')
  .parse(process.argv)

var node_modules = program.nodeModules || 'node_modules'
var lightModulesRoot = program.path || 'light-modules'

build(node_modules, lightModulesRoot)
