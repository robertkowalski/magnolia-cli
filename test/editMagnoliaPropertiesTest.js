/* eslint-env mocha */

const fs = require('fs')
const path = require('path')

const Promise = require('bluebird')
const fse = require('fs-extra')
const expect = require('chai').expect

const readFile = Promise.promisify(fs.readFile)

const editMagnoliaProperties = require('../lib/editMagnoliaProperties')

describe('editMagnoliaProperties', function () {
  describe('replaceInConfig', () => {
    it('replaces props in strings', () => {
      const config = [
        '# Switch to false to enhance the performance of the javascript generation and similar',
        'magnolia.develop=false',
        'magnolia.resources.dir=${magnolia.home}/logs'
      ].join('\n')

      const props = {
        'magnolia.develop': true,
        'magnolia.update.auto': true,
        'magnolia.resources.dir': '/Users/robert/magnolia/light-modules'
      }

      const res = editMagnoliaProperties.replaceInConfig(config, props)
      expect(res).to.contain('magnolia.develop=true')
      expect(res).to.contain('magnolia.resources.dir=/Users/robert/magnolia/light-modules')
    })
  })

  describe('replacePropertiesInFile', () => {
    it('replaces props in files', () => {
      fse.mkdirsSync('test/destination/')
      const magnoliaPropertiesPath = 'test/destination/apache-tomcat/webapps/magnoliaAuthor/WEB-INF/config/default/magnolia.properties'
      fse.copySync('test/resources/magnolia.properties', path.join(magnoliaPropertiesPath, ''))

      const props = {
        'magnolia.develop': true,
        'magnolia.update.auto': true,
        'magnolia.resources.dir': '/Users/robert/magnolia/light-modules'
      }

      return editMagnoliaProperties
        .replacePropertiesInFile(magnoliaPropertiesPath, props)
        .then(() => {
          return readFile(magnoliaPropertiesPath, 'utf8')
        })
        .then((content) => {
          expect(content).to.contain('magnolia.develop=true')
          expect(content).to.contain('magnolia.update.auto=true')
          expect(content).to.contain('magnolia.resources.dir=/Users/robert/magnolia/light-modules')
        })
    })
  })
})
