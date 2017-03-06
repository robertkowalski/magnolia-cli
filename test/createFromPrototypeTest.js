/* eslint-env mocha */

const fs = require('fs-extra')
const expect = require('chai').expect

const testHelper = require('./testHelper')
const createFromPrototype = require('../lib/createFromPrototype')

describe('createFromPrototype', () => {

  it('should use custom prototypes if found in current directory or parent', (done) => {
    fs.mkdirsSync('test/destination/test-module/templates/pages')
    const customPage = 'test/destination/test-module/templates/pages/custom.ftl'
    const customContent = 'Hi, I am a custom template!'

    testHelper.invokeMgnlSubcommand('customize-local-config', '-p test/destination')
    fs.writeFileSync('test/destination/mgnl-cli-prototypes/page/template.ftl', customContent, 'utf-8')

    createFromPrototype.create('/page/template.ftl', customPage)

    fs.readFile(customPage, 'utf-8', (err, data) => {
      expect(err).to.be.null
      expect(data).to.be.equal(customContent)
    })
    fs.removeSync('test/destination')
    done()
  })
})
