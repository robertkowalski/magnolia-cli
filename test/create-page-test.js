/* eslint-env mocha */
describe('create-page', function () {
  var fs = require('fs-extra')
  var path = require('path')

  var testHelper = require('./testHelper')
  var invoke = testHelper.invoke
  var shell = require('shelljs')

  var expect = require('chai').expect

  beforeEach(function () {
    // make dirs expected when validating module structure
    fs.mkdirsSync('test/light-modules/foo/templates/pages/')
    fs.mkdirsSync('test/light-modules/foo/dialogs/pages/')
    fs.mkdirsSync('test/light-modules/foo/templates/components')
    fs.mkdirsSync('test/light-modules/foo/dialogs/components')
  })

  afterEach(function () {
    fs.removeSync('test/light-modules')
  })

  it('should create a page template', function () {
    var basedir = invoke('create-page', 'myPage -p test/light-modules/foo')
    checkExpectations(path.join(basedir, 'foo'))
  })

  it('should create a page template from inside a light module without passing a path option', function () {
    shell.cd('test/light-modules/foo')
    var basedir = invoke('create-page', 'myPage', process.cwd())
    checkExpectations(basedir)
    shell.cd('../../../')
  })

  it('should build templateScript path correctly regardless of trailing slash in path', function () {
    // with trailing slash
    testHelper.invokeMgnlSubcommand('create-page', 'myPage -p test/light-modules/foo/')
    testHelper.checkFileContains('/foo/templates/components/text.yaml', ['templateScript: /foo/templates/pages/myPage.ftl'])

    // and without
    testHelper.invokeMgnlSubcommand('create-component', 'myPage -p test/light-modules/foo')
    testHelper.checkFileContains('/foo/templates/components/text.yaml', ['templateScript: /foo/templates/pages/myPage.ftl'])
  })

  it('should fail if no arg is passed', function () {
    var result = testHelper.invokeMgnlSubcommand('create-page', '')
    expect(result.stderr.toString()).not.to.be.empty
  })

  it('should fail if path is non existent', function () {
    var result = testHelper.invokeMgnlSubcommand('create-page', 'foo -p baz/bar')
    expect(result.stderr.toString()).not.to.be.empty
  })

  it('should fail if light module is not a valid one', function () {
    fs.mkdirsSync('test/light-modules/bogus/meh')
    var result = testHelper.invokeMgnlSubcommand('create-page', 'foo -p test/light-modules/bogus')
    expect(result.stderr.toString()).not.to.be.empty
  })

  it('should fail if page already exists', function () {
    var result = testHelper.invokeMgnlSubcommand('create-page', 'baz -p test/light-modules/foo')
    expect(result.stderr.toString()).to.be.empty

    result = testHelper.invokeMgnlSubcommand('create-page', 'baz -p test/light-modules/foo')
    expect(result.stderr.toString()).not.to.be.empty
  })

  it('should fail if page name contains slash', function () {
    var result = testHelper.invokeMgnlSubcommand('create-page', 'baz/bar -p test/light-modules/foo')
    expect(result.stderr.toString()).not.to.be.empty
  })

  function checkExpectations (ligthModulesbasedir) {
    ['/templates/pages/myPage.yaml', '/templates/pages/myPage.ftl', '/dialogs/pages/myPage.yaml'].forEach(function (item) {
      // console.log("Checking %s", ligthModulesbasedir + item)
      expect(fs.existsSync(ligthModulesbasedir + item)).to.be.true
    })
    testHelper.checkFileContains(ligthModulesbasedir + '/templates/pages/myPage.yaml', ['dialog: foo:pages/myPage', 'templateScript: /foo/templates/pages/myPage.ftl'])
    testHelper.checkFileContains(ligthModulesbasedir + '/templates/pages/myPage.yaml', ['dialog: foo:pages/myPage', 'templateScript: /foo/templates/pages/myPage.ftl'])
  }
})
