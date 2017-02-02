/* eslint-env mocha */
describe('helper', function () {
  var helper = require('../lib/helper')
  var expect = require('chai').expect
  const fs = require('fs-extra')
  var path = require('path')
  var shell = require('shelljs')

  const testHelper = require('./testHelper')
  const os = require('os')
  const getMagnoliaPropertiesLocation = helper.getMagnoliaPropertiesLocation
  const getLightModulesFolderFromTomcatLocation = helper.getLightModulesFolderFromTomcatLocation
  describe('getLightModulesFolderFromTomcatLocation', () => {
    const propertyFile = getMagnoliaPropertiesLocation(
      'test/fixtures/apache-tomcat',
      'magnoliaAuthor'
    )

    beforeEach(() => {
      fs.mkdirsSync(propertyFile.replace('magnolia.properties', ''))
      fs.writeFileSync(propertyFile, 'magnolia.resources.dir=/foo/bar/baz', 'utf-8')
    })

    afterEach(() => {
      fs.removeSync('test/fixtures')
    })

    it('gets the light module folder from the properties file', () => {
      expect(getLightModulesFolderFromTomcatLocation('test/fixtures')).to.equal('/foo/bar/baz')
    })

    it('works when no tomcat folder is specified, returns false', () => {
      expect(() => {
        getLightModulesFolderFromTomcatLocation(os.tmpDir())
      }).to.not.throw()

      expect(getLightModulesFolderFromTomcatLocation(os.tmpDir())).to.equal(false)
    })

    it('works with relative paths', () => {
      fs.writeFileSync(propertyFile, 'magnolia.resources.dir=../../../../../../foo', 'utf-8')
      expect(
        getLightModulesFolderFromTomcatLocation('test/fixtures')
      ).to.equal(
        path.join(__dirname, '/fixtures/apache-tomcat/foo')
      )
    })
  })

  describe('#parseDefinitionReference()', function () {
    it("should add default 'components/' part to component path if not specified", function () {
      var res = helper.parseDefinitionReference('text', 'foo')
      expect(res.path).to.be.equal('components/text')
    })

    it('should keep component path if specified', function () {
      var res = helper.parseDefinitionReference('meh/text', 'foo')
      expect(res.path).to.be.equal('meh/text')
    })

    it("should add default 'pages/' part to target page path if not specified", function () {
      var res = helper.parseDefinitionReference('hello@baz', 'foo')
      expect(res.path).to.be.equal('pages/hello')
    })

    it("should add default 'components/' and module name parts to component refId if not specified", function () {
      var res = helper.parseDefinitionReference('baz:text', 'foo')
      expect(res.refId).to.be.equal('baz:components/text')
    })

    it('should keep complete component refId as is', function () {
      var res = helper.parseDefinitionReference('baz:meh/text', 'foo')
      expect(res.refId).to.be.equal('baz:meh/text')
    })

    it('should parse an id containing the dash character', function () {
      var res = helper.parseDefinitionReference('qux-bar:components/text', 'foo')
      expect(res.refId).to.be.equal('qux-bar:components/text')
      expect(res.name).to.be.equal('text')

      res = helper.parseDefinitionReference('qux-bar:components/with-dash', 'foo')
      expect(res.refId).to.be.equal('qux-bar:components/with-dash')
      expect(res.name).to.be.equal('with-dash')

      res = helper.parseDefinitionReference('qux-bar:baz-bar/with-dash', 'foo')
      expect(res.refId).to.be.equal('qux-bar:baz-bar/with-dash')
      expect(res.name).to.be.equal('with-dash')
    })

    it('should match an id containing the dash character', function () {
      var res = helper.matchesDefinitionReferenceWithAreaPattern('meh/baz-bar@some-area', 'foo')
      expect(res).not.to.be.null

      res = helper.matchesDefinitionReferenceWithoutAreaPattern('meh/baz-bar', 'foo')
      expect(res).not.to.be.null
    })

    it('should throw an exception if definition id does not match pattern', function () {
      expect(function () { helper.parseDefinitionReference('meh:-;', 'foo') }).to.throw(Error)
    })
  })

  describe('#resolveMgnlCliJsonPath()', function () {
    beforeEach(function () {
      fs.mkdirsSync('test/destination')
    })

    afterEach(function () {
      fs.removeSync('test/destination')
    })

    it('should return default mgnl-cli.json if no mgnl-cli.json is found', function () {
      var configJson = require(helper.resolveMgnlCliJsonPath())
      expect(configJson.setupMagnolia.tomcatFolder).to.be.equal('apache-tomcat')
    })

    it('should return custom mgnl-cli.json if mgnl-cli.json is found', function () {
      testHelper.invokeMgnlSubcommand('customize-local-config', '-p test/destination')

      var customPackageJson = require(path.resolve('test/destination/mgnl-cli.json'))
      customPackageJson.setupMagnolia.tomcatFolder = 'foobar'

      shell.cd('test/destination')

      var configJson = require(helper.resolveMgnlCliJsonPath())
      expect(configJson.setupMagnolia.tomcatFolder).to.be.equal('foobar')

      shell.cd('../../')
    })
  })

  describe('#MgnlCliError', function () {
    var MgnlCliError = helper.MgnlCliError

    it('allows usage without new keyword', function () {
      try {
        throw MgnlCliError('foo', 'bar')
      } catch (e) {
        expect(e.displayHelp).to.be.equal('bar')
      }
    })
  })

  describe('#getModuleName', function () {
    var getModuleName = helper.getModuleName
    var ret = null

    if (process.platform === 'win32') {
      it('should get the name on win', function () {
        ret = getModuleName('C:\\foo\\bar\\')
        expect(ret).to.be.equal('bar')

        ret = getModuleName('C:\\foo')
        expect(ret).to.be.equal('foo')
      })
    }
    it('should get the name on posix', function () {
      ret = getModuleName('/foo/bar/')
      expect(ret).to.be.equal('bar')

      ret = getModuleName('/foo')
      expect(ret).to.be.equal('foo')
    })
  })

  describe('#stripLastSep', function () {
    var stripLastSep = helper.stripLastSep
    var ret = null

    if (process.platform === 'win32') {
      it('should strip last separator on win', function () {
        ret = stripLastSep('C:\\foo\\bar\\')
        expect(ret).to.be.equal('C:\\foo\\bar')

        ret = stripLastSep('C:\\foo\\bar')
        expect(ret).to.be.equal('C:\\foo\\bar')
      })
    }
    it('should strip last separator on posix', function () {
      ret = stripLastSep('/foo/bar/')
      expect(ret).to.be.equal('/foo/bar')
      ret = stripLastSep('/foo/bar')
      expect(ret).to.be.equal('/foo/bar')
    })
  })

  describe('#createDefinitionTemplatePath', function () {
    var createDefinitionTemplatePath = helper.createDefinitionTemplatePath
    var ret = null

    it('should create template path for definition', function () {
      ret = createDefinitionTemplatePath('foo/', '///bar', 'baz')
      expect(ret).to.be.equal('/foo/bar/baz.ftl')
    })
  })

  describe('#resolveMgnlCliPrototypesPath()', function () {
    beforeEach(function () {
      fs.mkdirsSync('test/destination')
    })

    afterEach(function () {
      fs.removeSync('test/destination')
    })

    it('should return default mgnl-cli-prototypes if no custom one is found', function () {
      var prototypes = helper.resolveMgnlCliPrototypesPath()
      fs.readFile(path.join(prototypes, '/page/definition.yaml'), 'utf-8', function (err, data) {
        if (err) throw err
        expect(data).not.to.contain('hello there!')
      })
    })

    it('should return custom mgnl-cli-prototypes if mgnl-cli-prototypes is found', function () {
      testHelper.invokeMgnlSubcommand('customize-local-config', '-p test/destination')
      shell.cd('test/destination')

      fs.writeFileSync('mgnl-cli-prototypes/page/definition.yaml', 'hello there!', 'utf-8')

      var prototypes = helper.resolveMgnlCliPrototypesPath()
      fs.readFile(path.join(prototypes, '/page/definition.yaml'), 'utf-8', function (err, data) {
        if (err) throw err
        expect(data).to.contain('hello there!')
      })

      shell.cd('../../')
    })
  })
})
