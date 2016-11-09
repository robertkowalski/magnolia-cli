/* eslint-env mocha */
describe('editMagnoliaProperties', function () {
  var fs = require('fs-extra')
  var shell = require('shelljs')
  var expect = require('chai').expect

  var editMagnoliaProperties = require('../lib/editMagnoliaProperties')

  it('should edit magnolia.properties', function (done) {
    fs.mkdirsSync('test/destination/')
    var magnoliaPropertiesPath = 'test/destination/apache-tomcat/webapps/magnoliaAuthor/WEB-INF/config/default/magnolia.properties'
    fs.copySync('test/resources/magnolia.properties', magnoliaPropertiesPath)

    shell.cd('test/destination')

    editMagnoliaProperties.editProperties()

    fs.readFile(magnoliaPropertiesPath, 'utf-8', function (err, data) {
      expect(err).to.be.null
      // here we expect only the properties found by default at mgnl-cli.json to be changed
      expect(data).to.contain('magnolia.develop=true')
      expect(data).to.contain('magnolia.auto.update=true')
    })

    shell.cd('../..')
    fs.removeSync('test/destination')
    done()
  })
})
