/* eslint-env mocha */
describe('jumpstart', function () {
  var downloadMagnolia = require('../lib/downloadMagnolia.js')
  var extractMagnolia = require('../lib/extractMagnolia.js')
  var jumpstart = require('../lib/jumpstart.js')
  var testHelper = require('./testHelper')

  var fs = require('fs-extra')
  var expect = require('chai').expect
  var shell = require('shelljs')
  var path = require('path')

  beforeEach(function () {
    fs.mkdir('test/destination')
    fs.copySync('test/resources/magnolia-test.zip', 'test/destination/magnolia.zip')
  })

  afterEach(function () {
    fs.removeSync('test/destination')
  })

  it('should not download if magnolia-test.zip already exists', function () {
    var creds = {username: '', password: ''}

    downloadMagnolia.download('test/resources/', 'magnolia-test.zip', creds, function () {
      expect(fs.existsSync('test/resources/magnolia-test.zip')).to.be.true
    })
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
    testHelper.invokeMgnlSubcommand('jumpstart', '')

    // THEN
    expect(fs.existsSync('apache-tomcat')).to.be.true
    expect(fs.existsSync('light-modules')).to.be.true
    expect(fs.readdirSync('light-modules').length === 0).to.be.true

    shell.cd('../../')
  }).timeout(10000)

  it('should print the next steps, even with no additional jars for download.', function () {
    var config = require('../lib/config/mgnl-cli.json')
    expect(Object.keys(config.setupMagnolia.downloadJars).length).to.equal(0)

    // WHEN
    var wd = path.join(process.cwd(), 'test/destination')
    shell.cd(wd)

    var result = testHelper.invokeMgnlSubcommand('jumpstart', 'test/destination')

    // THEN
    expect(result.stdout.toString()).to.contain('Magnolia will be ready after')
    shell.cd('../../')
  })

  it('should create the sample light-module if -i option is given', function () {
    // WHEN
    shell.cd('test/destination')
    var lightModuleName = 'my-module'
    testHelper.invokeMgnlSubcommand('jumpstart', '-i ' + lightModuleName)

    // THEN
    var lightModulesSubDirs = fs.readdirSync('light-modules')
    expect(fs.existsSync('apache-tomcat')).to.be.true
    expect(fs.existsSync('light-modules')).to.be.true
    expect(lightModulesSubDirs.length === 1).to.be.true
    expect(lightModulesSubDirs.toString() === lightModuleName).to.be.true

    shell.cd('../../')
  })

  it('should fail if no credentials are provided to download an EE bundle', function () {
    // GIVEN
    var dummyProgram = {
      enterpriseEdition: [],
      outputHelp: function () {}
    }

    // WHEN THEN
    expect(function () {
      jumpstart.validateAndResolveArgs(dummyProgram)
    }).to.throw(Error)
  })

  it('should not fail if credentials are provided to download an EE bundle', function () {
    // GIVEN
    var dummyProgram = {
      enterpriseEdition: []
    }

    var dummyCredentials = {
      username: 'foo',
      password: 'bar',
      type: 'Baz'
    }

    // WHEN THEN
    expect(function () {
      jumpstart.validateAndResolveArgs(dummyProgram, dummyCredentials)
    }).to.not.throw(Error)
  })

  it('should not require credentials to download a CE bundle', function () {
    // GIVEN
    var dummyProgram = {
    }

    // WHEN THEN
    expect(function () {
      jumpstart.validateAndResolveArgs(dummyProgram)
    }).to.not.throw(Error)
  })
})
