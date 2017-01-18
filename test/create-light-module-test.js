/* eslint-env mocha */
describe('create-light-module', function () {
  var fs = require('fs-extra')
  var path = require('path')

  var testHelper = require('./testHelper')
  var invoke = testHelper.invoke

  var shell = require('shelljs')

  var expect = require('chai').expect

  beforeEach(function () {
    fs.mkdirsSync('test/light-modules')
  })

  afterEach(function () {
    fs.removeSync('test/light-modules')
  })

  it('should create a light module', function () {
    var lightModulesbasedir = invoke('create-light-module', 'foo -p test/light-modules')
    checkExpectations(lightModulesbasedir)
  })

  it('should create a light module passing an absolute path option', function () {
    var lightModulesbasedir = invoke('create-light-module', 'foo -p ' + path.join(process.cwd(), 'test/light-modules'))
    checkExpectations(lightModulesbasedir)
  })

  it('should create a light module in the current dir without passing a path option', function () {
    shell.cd('test/light-modules')
    var lightModulesbasedir = invoke('create-light-module', 'foo', process.cwd())
    checkExpectations(lightModulesbasedir)
    shell.cd('../../')
  })

  it('should fail if no arg is passed', function () {
    var result = testHelper.invokeMgnlSubcommand('create-light-module', '')
    expect(result.stderr.toString()).not.to.be.empty
  })

  it('should fail if path is non existent', function () {
    var result = testHelper.invokeMgnlSubcommand('create-light-module', 'foo -p baz/bar')
    expect(result.stderr.toString()).not.to.be.empty
  })

  it('should fail if module already exists', function () {
    fs.mkdirsSync('test/light-modules/foo')
    var result = testHelper.invokeMgnlSubcommand('create-light-module', 'foo -p test/light-modules')
    expect(result.stderr.toString()).not.to.be.empty
  })

  it('prints help how to continue', function () {
    var result = testHelper.invokeMgnlSubcommand('create-light-module', 'apple -p test/light-modules')

    expect(result.stdout.toString())
      .to.contain('In order to add a page, run mgnl create-page $YOUR_PAGE_NAME -p')
  })

  function checkExpectations (lightModulesbasedir) {
    ['/foo/templates/pages', '/foo/templates/components', '/foo/dialogs/pages', '/foo/dialogs/components', '/foo/decorations', '/foo/i18n/foo-messages_en.properties'].forEach(function (item) {
      // console.log("Checking %s", lightModulesbasedir + item)
      expect(fs.existsSync(lightModulesbasedir + item)).to.be.true
    })
  }
})
