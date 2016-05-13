/* eslint-env mocha */
describe('createFromPrototype', function () {
  var fs = require('fs-extra')

  var testHelper = require('./testHelper')
  var path = require('path')
  var createFromPrototype = require('../bin/createFromPrototype')

  var expect = require('chai').expect

  it('should use custom prototypes if MGNLCLI_HOME env variable is defined', function (done) {
    fs.mkdirsSync('test/destination/test-module/templates/pages')
    process.env.MGNLCLI_HOME = path.join(process.cwd(), 'test/destination')
    var customPage = 'test/destination/test-module/templates/pages/custom.ftl'
    var customContent = 'Hi, I am a custom template!'

    testHelper.invokeMgnlSubcommand('setup', '-p test/destination')
    fs.writeFileSync('test/destination/_prototypes/page/template.ftl', customContent, 'utf-8')

    createFromPrototype.createFromPrototype('/page/template.ftl', customPage)

    fs.readFile(customPage, 'utf-8', function (err, data) {
      expect(err).to.be.null
      expect(data).to.be.equal(customContent)
    })
    delete process.env.MGNLCLI_HOME
    fs.removeSync('test/destination')
    done()
  })
})
