/* eslint-env mocha */
describe('createFromPrototype', function () {
  var fs = require('fs-extra')

  var testHelper = require('./testHelper')
  var createFromPrototype = require('../lib/createFromPrototype')

  var expect = require('chai').expect

  it('should use custom prototypes if found in current directory or parent', function (done) {
    fs.mkdirsSync('test/destination/test-module/templates/pages')
    var customPage = 'test/destination/test-module/templates/pages/custom.ftl'
    var customContent = 'Hi, I am a custom template!'

    testHelper.invokeMgnlSubcommand('setup', '-p test/destination')
    fs.writeFileSync('test/destination/mgnl-cli-prototypes/page/template.ftl', customContent, 'utf-8')

    createFromPrototype.create('/page/template.ftl', customPage)

    fs.readFile(customPage, 'utf-8', function (err, data) {
      expect(err).to.be.null
      expect(data).to.be.equal(customContent)
    })
    fs.removeSync('test/destination')
    done()
  })
})
