/* eslint-env mocha */
describe('create-light-module', function () {
  var fs = require('fs-extra')
  var path = require('path')
  var Promise = require('bluebird')

  var testHelper = require('./testHelper')
  var invoke = testHelper.invoke
  var shell = require('shelljs')
  var expect = require('chai').expect

  var createLightModule = require('../lib/createLightModule.js')

  const mockFs = require('mock-fs')

  describe('unit', function () {
    beforeEach(() => {
      mockFs({ 'test/light-modules/footestcase/blerg': {} })
      fs.mkdirsSync('test/light-modules/footestcase/blerg')
    })

    afterEach(() => {
      mockFs.restore()
      fs.removeSync('test/light-modules/footestcase/blerg')
    })

    var config = {
      lightDevFoldersInModule: {
        i18n: 'blerg'
      }
    }

    it('createI18nProperties should create a file', function () {
      return createLightModule
        .createI18nProperties('test/light-modules/', 'footestcase', config)
        .then(function () {
          var readFile = Promise.promisify(fs.readFile)
          var propFile = path.join(
            __dirname,
            'light-modules/footestcase/blerg/footestcase-messages_en.properties'
          )

          return readFile(propFile, 'utf8')
        })
        .then(function (res) {
          expect(res).to.contain('# Please, see https')
        })
    })

    it('resolvepath: path and no module name', () => {
      const res = createLightModule.resolvePath({args: [], path: '/foo/bar/baz'})

      expect(res.lightModulesRoot).to.equal('/foo/bar')
      expect(res.moduleName).to.equal('baz')
    })

    it('resolvepath: path and module name', () => {
      const res = createLightModule.resolvePath({args: ['furbie'], path: '/foo/bar/baz'})

      expect(res.lightModulesRoot).to.equal('/foo/bar/baz')
      expect(res.moduleName).to.equal('furbie')
    })

    it('resolvepath: no path and module name', () => {
      const res = createLightModule.resolvePath({args: ['furbie']})

      expect(res.lightModulesRoot).to.equal(process.cwd())
      expect(res.moduleName).to.equal('furbie')
    })

    it('resolvepath: no path and no module name', () => {
      const res = createLightModule.resolvePath({args: []})

      expect(res.lightModulesRoot).to.equal(path.dirname(process.cwd()))
      expect(res.moduleName).to.equal(path.basename(process.cwd()))
    })
  })

  describe('integration', function () {
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

    it('should create a light module in the same folder if no arg is passed', function () {
      shell.cd('test/light-modules')
      testHelper.invoke('create-light-module', '', 'test/light-modules')
      expect(fs.existsSync(path.join(__dirname, 'light-modules', 'README.md'))).to.be.true
      shell.cd('../../')
    })

    it('should fail if path is non existent', function () {
      var result = testHelper.invokeMgnlSubcommand('create-light-module', 'foo -p baz/bar')
      expect(result.stderr.toString()).not.to.be.empty
    })

    it('should fail if module already exists', function () {
      fs.mkdirsSync('test/light-modules/foo')
      testHelper.invokeMgnlSubcommand('create-light-module', 'foo -p test/light-modules')
      expect(fs.existsSync(path.join(__dirname, 'light-modules', 'foo', 'README.md'))).to.be.true
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
})
