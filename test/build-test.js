/* eslint-env mocha */
describe('build', function () {
  var fs = require('fs-extra')

  var testHelper = require('./testHelper')
  var shell = require('shelljs')

  var expect = require('chai').expect

  beforeEach(function () {
    fs.mkdirsSync('test/destination/node_modules')
    fs.copySync('test/resources/a-light-module', 'test/destination/node_modules/a-light-module')
    fs.copySync('test/resources/not-a-light-module', 'test/destination/node_modules/not-a-light-module')
  })

  afterEach(function () {
    fs.removeSync('test/destination')
  })

  it('should extract light module to the default folder light-modules', function () {
    shell.cd('test/destination')

    invoke('build', '')

    expect(fs.existsSync('light-modules/a-light-module')).to.be.true
    expect(fs.existsSync('light-modules/not-a-light-module')).to.be.false

    shell.cd('../../')
  })

  it('should extract light module to the specified path', function () {
    shell.cd('test/destination')

    invoke('build', '-p foo')

    expect(fs.existsSync('foo/a-light-module')).to.be.true
    expect(fs.existsSync('foo/not-a-light-module')).to.be.false

    shell.cd('../../')
  })

  it('should extract light modules found by providing a path to node_modules', function () {
    shell.cd('test/destination')
    invoke('build', '-n ../resources')

    expect(fs.existsSync('light-modules/a-light-module')).to.be.true
    expect(fs.existsSync('light-modules/not-a-light-module')).to.be.false

    shell.cd('../../')
  })

  it('should extract light modules found by providing a path to node_modules and a path to destination folder', function () {
    shell.cd('test/destination')
    invoke('build', '-n ../resources -p foo')

    expect(fs.existsSync('foo/a-light-module')).to.be.true
    expect(fs.existsSync('foo/not-a-light-module')).to.be.false

    shell.cd('../../')
  })

  function invoke (subcommand, argv) {
    var result = testHelper.invokeMgnlSubcommand(subcommand, argv)
    // always convert to string as stderr may also be a buffer and then the assertion message would be unreadable
    expect(result.stderr.toString()).to.be.empty
  }
})
