/* eslint-env mocha */
describe('helper', function () {
  var helper = require('../bin/helper')
  var expect = require('chai').expect
  var fs = require('fs-extra')
  var path = require('path')
  var shell = require('shelljs')

  var testHelper = require('./testHelper')

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
      expect(configJson.config.outputPath).to.be.equal('light-modules')
    })

    it('should return custom mgnl-cli.json if mgnl-cli.json is found', function () {
      testHelper.invokeMgnlSubcommand('setup', '-p test/destination')

      var customPackageJson = require(path.resolve('test/destination/mgnl-cli.json'))
      customPackageJson.config.outputPath = 'foobar'

      shell.cd('test/destination')

      var configJson = require(helper.resolveMgnlCliJsonPath())
      expect(configJson.config.outputPath).to.be.equal('foobar')

      shell.cd('../../')
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
      testHelper.invokeMgnlSubcommand('setup', '-p test/destination')
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
