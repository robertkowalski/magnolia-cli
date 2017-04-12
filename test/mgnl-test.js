/* eslint-env mocha */
describe('mgnl', function () {
  const testHelper = require('./testHelper')
  const expect = require('chai').expect

  it('should fail if invoked with a non existing command', function () {
    const result = testHelper.invokeMgnlSubcommand('do-baz', '')
    expect(result.stderr.toString()).not.to.be.empty
  })
})
