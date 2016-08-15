/* eslint-env mocha */
describe('setup', function () {
  var fs = require('fs-extra')

  var testHelper = require('./testHelper')
  var shell = require('shelljs')

  var expect = require('chai').expect

  beforeEach(function () {
    fs.mkdirsSync('test/destination')
  })

  afterEach(function () {
    fs.removeSync('test/destination')
  })

  it('should extract prototypes and mgnl-cli.json to destination path', function () {
    invoke('setup', '-p test/destination')

    expect(fs.existsSync('test/destination/mgnl-cli-prototypes')).to.be.true
    expect(fs.existsSync('test/destination/mgnl-cli.json')).to.be.true
  })

  it('should extract prototypes and mgnl-cli.json to current folder if no path option is given', function () {
    shell.cd('test/destination')

    invoke('setup', '')

    expect(fs.existsSync('mgnl-cli-prototypes')).to.be.true
    expect(fs.existsSync('mgnl-cli.json')).to.be.true

    shell.cd('../../')
  })

  it('should not overwrite existing files', function () {
    invoke('setup', '-p test/destination')

    var customConfigJson = require('./destination/mgnl-cli.json')
    customConfigJson.lightModuleName = 'foobar'

    invoke('setup', '-p test/destination')
    expect(customConfigJson.lightModuleName).to.be.equal('foobar')
  })

  it('should fail if path is non existent', function () {
    var result = testHelper.invokeMgnlSubcommand('setup', '-p baz/bar')
    expect(result.stderr.toString()).not.to.be.empty
  })

  function invoke (subcommand, argv) {
    var result = testHelper.invokeMgnlSubcommand(subcommand, argv)
    // always convert to string as stderr may also be a buffer and then the assertion message would be unreadable
    expect(result.stderr.toString()).to.be.empty
  }
})
