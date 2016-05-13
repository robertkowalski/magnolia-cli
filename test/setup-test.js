/* eslint-env mocha */
describe('setup', function () {
  var fs = require('fs-extra')

  var testHelper = require('./testHelper')
  var shell = require('shelljs')

  var expect = require('chai').expect

  it('should extract prototypes to destination path', function () {
    fs.mkdirsSync('test/destination')

    invoke('setup', '-p test/destination')

    expect(fs.existsSync('test/destination/_prototypes')).to.be.true

    fs.removeSync('test/destination')
  })

  it('should extract prototypes to current folder if no path option is given', function () {
    fs.mkdirsSync('test/destination')
    shell.cd('test/destination')

    invoke('setup', '')

    expect(fs.existsSync('_prototypes')).to.be.true

    shell.cd('../../')
    fs.removeSync('test/destination')
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
