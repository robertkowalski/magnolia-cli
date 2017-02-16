/* eslint-env mocha */
describe('customize-local-config', function () {
  var fs = require('fs-extra')

  var testHelper = require('./testHelper')
  var shell = require('shelljs')

  var expect = require('chai').expect

  beforeEach(function (done) {
    fs.mkdirs('test/destination', done)
  })

  afterEach(function (done) {
    fs.remove('test/destination', done)
  })

  it('should extract prototypes and mgnl-cli.json to destination path', function (done) {
    invoke('customize-local-config', '-p test/destination')

    expect(fs.existsSync('test/destination/mgnl-cli-prototypes')).to.be.true
    expect(fs.existsSync('test/destination/mgnl-cli.json')).to.be.true
    done()
  })

  it('should extract prototypes and mgnl-cli.json to current folder if no path option is given', function (done) {
    shell.cd('test/destination')

    invoke('customize-local-config', '')

    expect(fs.existsSync('mgnl-cli-prototypes')).to.be.true
    expect(fs.existsSync('mgnl-cli.json')).to.be.true

    shell.cd('../../')
    done()
  })

  it('should not overwrite existing files', function (done) {
    invoke('customize-local-config', '-p test/destination')

    var customConfigJson = require('./destination/mgnl-cli.json')
    customConfigJson.setupMagnolia.tomcatFolder = 'foobar'

    invoke('customize-local-config', '-p test/destination')
    expect(customConfigJson.setupMagnolia.tomcatFolder).to.be.equal('foobar')
    done()
  })

  it('should fail if path is non existent', function () {
    var result = testHelper.invokeMgnlSubcommand('customize-local-config', '-p baz/bar')
    expect(result.stderr.toString()).not.to.be.empty
  })

  function invoke (subcommand, argv) {
    var result = testHelper.invokeMgnlSubcommand(subcommand, argv)
    // always convert to string as stderr may also be a buffer and then the assertion message would be unreadable
    expect(result.stderr.toString()).to.be.empty
  }
})
