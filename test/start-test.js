/* eslint-env mocha */
describe('start', function () {
  const fs = require('fs-extra')

  const testHelper = require('./testHelper')

  const expect = require('chai').expect

  beforeEach(function () {
    fs.mkdirsSync('test/destination/apache-tomcat')
  })

  afterEach(function () {
    fs.removeSync('test/destination')
  })

  it('should fail if apache-tomcat folder is not a valid one', function () {
    const result = testHelper.invokeMgnlSubcommand('start', '-p test/destination')

    expect(result.stderr.toString()).to.contain('magnolia_control.sh does not exist')
  })
})
