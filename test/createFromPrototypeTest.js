/* eslint-env mocha */

const fs = require('fs-extra')
const expect = require('chai').expect

const testHelper = require('./testHelper')
const createFromPrototype = require('../lib/createFromPrototype')

describe('createFromPrototype', () => {
  it('should use custom prototypes if found in current directory or parent', (done) => {
    fs.mkdirsSync('test/destination/test-module/templates/pages')
    const customPage = 'test/destination/test-module/templates/pages/custom.ftl'

    testHelper.invokeMgnlSubcommand('customize-local-config', '-p test/destination')

    function onCreatedCb () {
      fs.readFile(customPage, 'utf-8', (err, data) => {
        expect(err).to.be.null
        expect(data).to.be.contain('super-furbie')
        expect(data).to.be.contain('"furbie')
        fs.removeSync('test/destination')
        done()
      })
    }

    createFromPrototype.create('/page/template.ftl', customPage, {
      '__name__': 'furbie',
      '__lightDevModuleFolder__': 'super-furbie'
    }, onCreatedCb)
  })
})
