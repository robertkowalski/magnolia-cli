/* eslint-env mocha */
describe('mgnl', function () {
  var testHelper = require('./testHelper')
  var expect = require('chai').expect

  it('should fail if invoked with a non existing command', function () {
    var result = testHelper.invokeMgnlSubcommand('do-baz', '')
    expect(result.stderr.toString()).not.to.be.empty
  })
})
