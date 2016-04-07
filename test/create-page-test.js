/* eslint-env mocha */
describe('create-page', function () {
  var fs = require('fs-extra')

  var testHelper = require('./testHelper')
  var shell = require('shelljs')
  var path = require('path')

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
    var ligthModulesbasedir = invoke('create-page', 'myPage -p test/light-modules/foo')
    checkExpectations(ligthModulesbasedir)
  })

  it('should create a page template from inside a light module without passing a path option', function () {
    shell.cd('test/light-modules/foo')
    var ligthModulesbasedir = invoke('create-page', 'myPage')
    checkExpectations(ligthModulesbasedir)
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
    ['/foo/templates/pages/myPage.yaml', '/foo/templates/pages/myPage.ftl', '/foo/dialogs/pages/myPage.yaml'].forEach(function (item) {
      // console.log("Checking %s", ligthModulesbasedir + item)
      expect(fs.existsSync(ligthModulesbasedir + item)).to.be.true
    })
    testHelper.checkFileContains(ligthModulesbasedir + '/foo/templates/pages/myPage.yaml', ['dialog: foo:pages/myPage', 'templateScript: /foo/templates/pages/myPage.ftl'])
    testHelper.checkFileContains(ligthModulesbasedir + '/foo/templates/pages/myPage.yaml', ['dialog: foo:pages/myPage', 'templateScript: /foo/templates/pages/myPage.ftl'])
  }

  function invoke (subcommand, argv) {
    var basedir = process.cwd()
    if (!basedir.endsWith('/npm-cli')) {
      basedir = path.resolve(basedir, '../../../')
    }
    basedir = path.join(basedir, 'test/light-modules')

    var result = testHelper.invokeMgnlSubcommand(subcommand, argv)
    // always convert to string as stderr may also be a buffer and then the assertion message would be unreadable
    expect(result.stderr.toString()).to.be.empty

    return basedir
  }
})
