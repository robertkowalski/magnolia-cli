/* eslint-env mocha */
describe('helper', function () {
  var helper = require('../bin/helper')
  var expect = require('chai').expect
  var fs = require('fs-extra')
  var path = require('path')
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

  describe('#requirePackageJson()', function () {
    beforeEach(function () {
      fs.mkdirsSync('test/destination')
    })

    afterEach(function () {
      fs.removeSync('test/destination')
    })

    it('should return default package.json if no MGNLCLI_HOME is set', function () {
      var packageJson = helper.requirePackageJson()
      expect(packageJson.config.outputPath).to.be.equal('light-modules')
    })

    it('should return custom package.json if MGNLCLI_HOME is set', function () {
      process.env.MGNLCLI_HOME = path.join(process.cwd(), 'test/destination')

      testHelper.invokeMgnlSubcommand('setup', '-p test/destination')

      fs.exists('./destination/package.json', function (err) {
        if (err) throw err
        var customPackageJson = require('./destination/package.json')
        customPackageJson.config.outputPath = 'foobar'

        var packageJson = helper.requirePackageJson()
        expect(packageJson.config.outputPath).to.be.equal('foobar')
        delete process.env.MGNLCLI_HOME
      })
    })
  })
})
