/* eslint-env mocha */
describe('jumpstart', function () {
  var downloadMagnolia = require('../bin/downloadMagnolia.js')
  var extractMagnolia = require('../bin/extractMagnolia.js')
  var testHelper = require('./testHelper')

  var fs = require('fs-extra')
  var expect = require('chai').expect
  var shell = require('shelljs')

  beforeEach(function () {
    fs.mkdir('test/destination')
    fs.copySync('test/resources/magnolia-test.zip', 'test/destination/magnolia.zip')
  })

  afterEach(function () {
    fs.removeSync('test/destination')
  })

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

  it('should not create a sample light-module if -i option is omitted.', function () {
    // WHEN
    shell.cd('test/destination')
    testHelper.invoke('jumpstart', '', 'test/destination')

    // THEN
    expect(fs.existsSync('apache-tomcat')).to.be.true
    expect(fs.existsSync('light-modules')).to.be.true
    expect(fs.readdirSync('light-modules').length === 0).to.be.true

    shell.cd('../../')
  })

  it('should create the sample light-module if -i option is given', function () {
    // WHEN
    shell.cd('test/destination')
    var lightModuleName = 'my-module'
    testHelper.invoke('jumpstart', '-i ' + lightModuleName, 'test/destination')

    // THEN
    var lightModulesSubDirs = fs.readdirSync('light-modules')
    expect(fs.existsSync('apache-tomcat')).to.be.true
    expect(fs.existsSync('light-modules')).to.be.true
    expect(lightModulesSubDirs.length === 1).to.be.true
    expect(lightModulesSubDirs.toString() === lightModuleName).to.be.true

    shell.cd('../../')
  })
})
