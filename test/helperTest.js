/* eslint-env mocha */
describe('helper', function () {
  describe('#parseDefinitionReference()', function () {
    var helper = require('../bin/helper')
    var expect = require('chai').expect

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
  })
})
