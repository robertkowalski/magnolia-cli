var packageJson = require('../package.json')
var program = require('commander')
var build = require('@magnolia/magnolia-build')
var helper = require('./helper')

program
  .version(packageJson.version)
  .description("Scan a node_modules folder for Magnola light modules, and extract them to a directory of choice, light-modules by default. That way you can point your Magnolia instance's resource dir to that particular folder, and easily get started working on light modules. A Magnolia light module is an NPM package defined by the magnolia-light-module keyword in its package.json")
  .option('-n, --node-modules <path>', "The path to the node_modules folder to scan. If no path is provided, then the current directory is assumed to contain a 'node_modules' which will be scanned for Magnolia light modules")
  .option('-p, --path <path>', "The path to the light modules root folder. If no path is provided, then the current directory is assumed to contain a 'light-modules' root folder and the extraction will happen here")
  .parse(process.argv)

var node_modules = program.nodeModules || 'node_modules'
var lightModulesRoot = program.path || helper.defaultLightModulesRootName

build(node_modules, lightModulesRoot)
