var spawnSync = require('child_process').spawnSync
var path = require('path')
var fs = require('fs-extra')
var expect = require('chai').expect

var invokeMgnlSubcommand = function (subcommand, argv) {
  var split = argv.split(/(\s+)/).filter(function (el) { return el.trim() && el.length !== 0 })
  var args = [path.join(__dirname, '../bin/mgnl.js'), subcommand].concat(split)
  var obj = spawnSync('node', args)
  return obj
}

var checkFileContains = function (file, values) {
  fs.readFile(file, 'utf-8', function (err, data) {
    expect(err).to.be.null
    values.forEach(function (value) {
      expect(data).to.contain(value)
    })
  })
}
var invokeAndVerify = function (subcommand, argv, pathToFile, callback, pathToModule) {
  // pathToModule is usually defined when the calling test has 'cd' to a different dir.
  var basedir = invoke(subcommand, argv, pathToModule)

  fs.readFile(basedir + pathToFile, 'utf-8', function (err, data) {
    expect(err).to.be.null
    callback(data)
  })
  return basedir
}

var invoke = function (subcommand, argv, pathTo) {
  // pathTo is usually defined when the calling test has 'cd' to a different dir.
  var basedir = pathTo || path.join(process.cwd(), 'test/light-modules')

  var result = invokeMgnlSubcommand(subcommand, argv)
  // always convert to string as stderr may also be a buffer and then the assertion message would be unreadable
  expect(result.stderr.toString()).to.be.empty

  return basedir
}

exports.invoke = invoke
exports.invokeMgnlSubcommand = invokeMgnlSubcommand
exports.checkFileContains = checkFileContains
exports.invokeAndVerify = invokeAndVerify
