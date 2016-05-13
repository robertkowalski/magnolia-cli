/* eslint-env mocha */
describe('jumpstart', function () {
  var downloadMagnolia = require('../bin/downloadMagnolia.js')
  var extractMagnolia = require('../bin/extractMagnolia.js')

  var fs = require('fs-extra')
  var expect = require('chai').expect

  it('should not download if magnolia-test.zip already exists', function () {
    downloadMagnolia.download('test/resources/', 'magnolia-test.zip')
    expect(fs.existsSync('test/resources/magnolia-test.zip')).to.be.true
  })

  it('should unzip to apache-tomcat', function () {
    expect(fs.existsSync('test/resources/apache-tomcat')).to.be.false

    extractMagnolia.extract('test/resources/', 'magnolia-test.zip')

    expect(fs.existsSync('test/resources/apache-tomcat')).to.be.true
    fs.removeSync('test/resources/apache-tomcat')
  })
})
