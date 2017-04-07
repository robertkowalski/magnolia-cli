const spawnSync = require('child_process').spawnSync
const path = require('path')
const fs = require('fs-extra')
const expect = require('chai').expect

function invokeMgnlSubcommand (subcommand, argv, opts) {
  const split = argv.split(/(\s+)/).filter(function (el) { return el.trim() && el.length !== 0 })
  const args = [path.join(__dirname, '../bin/mgnl.js'), subcommand].concat(split)
  const obj = spawnSync('node', args, opts)

  return obj
}

function checkFileContains (file, values, cb) {
  fs.readFile(file, 'utf-8', function (err, data) {
    expect(err).to.be.null
    values.forEach(function (value) {
      expect(data).to.contain(value)
    })

    cb(null)
  })
}

const invokeAndVerify = function (subcommand, argv, pathToFile, callback, pathToModule) {
  // pathToModule is usually defined when the calling test has 'cd' to a different dir.
  const basedir = invoke(subcommand, argv, pathToModule)

  fs.readFile(basedir + pathToFile, 'utf-8', function (err, data) {
    expect(err).to.be.null
    callback(data)
  })
  return basedir
}

var invoke = function (subcommand, argv, pathTo) {
  // pathTo is usually defined when the calling test has 'cd' to a different dir.
  const basedir = pathTo || path.join(process.cwd(), 'test/light-modules')

  const result = invokeMgnlSubcommand(subcommand, argv)
  // always convert to string as stderr may also be a buffer and then the assertion message would be unreadable
  expect(result.stderr.toString()).to.be.empty

  return basedir
}

exports.invoke = invoke
exports.invokeMgnlSubcommand = invokeMgnlSubcommand
exports.checkFileContains = checkFileContains
exports.invokeAndVerify = invokeAndVerify
