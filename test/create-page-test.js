/* eslint-env mocha */
describe('create-page', function () {
  var fs = require('fs-extra')
  var path = require('path')

  var testHelper = require('./testHelper')
  var invoke = testHelper.invoke
  var invokeAndVerify = testHelper.invokeAndVerify

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

  it('should create a page template', function (done) {
    var basedir = invoke('create-page', 'myPage -p test/light-modules/foo')

    checkExpectations(path.join(basedir, 'foo'), done)
  })

  it('should create a page template from inside a light module without passing a path option', function (done) {
    shell.cd('test/light-modules/foo')
    var basedir = invoke('create-page', 'myPage', process.cwd())

    checkExpectations(basedir, done)
    shell.cd('../../../')
  })

  it('should build templateScript path correctly with trailing slash in path', function (done) {
    invokeAndVerify('create-page',
      'myPage -p test/light-modules/foo/',
      '/foo/templates/pages/myPage.yaml',
      function (data) {
        expect(data).to.contain('templateScript: /foo/templates/pages/myPage.ftl')
        done()
      }
    )
  })

  it('should build templateScript path correctly without trailing slash in path', function (done) {
    invokeAndVerify('create-page',
      'myPage -p test/light-modules/foo',
      '/foo/templates/pages/myPage.yaml',
      function (data) {
        expect(data).to.contain('templateScript: /foo/templates/pages/myPage.ftl')
        done()
      }
    )
  })

  it('should build path to resources correctly without double slash', function (done) {
    invokeAndVerify('create-page',
      'myPage -p test/light-modules/foo',
      '/foo/templates/pages/myPage.ftl',
      function (data) {
        expect(data).not.to.contain('${ctx.contextPath}/.resources//foo/')
        done()
      }
    )
  })

  it('should build path for resfn correctly with module name prepended with slash', function (done) {
    invokeAndVerify('create-page',
      'myPage -p test/light-modules/foo',
      '/foo/templates/pages/myPage.ftl',
      function (data) {
        expect(data).to.contain('resfn.css(["/foo/.*css"])')
        expect(data).to.contain('resfn.js(["/foo/.*js"])')
        done()
      }
    )
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

  function checkExpectations (ligthModulesbasedir, cb) {
    [
      '/templates/pages/myPage.yaml',
      '/templates/pages/myPage.ftl',
      '/dialogs/pages/myPage.yaml'
    ].forEach(function (item) {
      // console.log('Checking %s', ligthModulesbasedir + item)
      expect(fs.existsSync(ligthModulesbasedir + item)).to.be.true
    })

    testHelper.checkFileContains(
      ligthModulesbasedir + '/templates/pages/myPage.yaml',
      ['dialog: foo:pages/myPage', 'templateScript: /foo/templates/pages/myPage.ftl'],
      cb
    )
  }
})
