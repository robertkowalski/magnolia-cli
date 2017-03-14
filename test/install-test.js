/* eslint-env mocha */

const install = require('../lib/install.js')

const mr = require('npm-registry-mock')
const expect = require('chai').expect
const fs = require('fs-extra')
const path = require('path')

describe('install light module', () => {
  let s

  beforeEach(() => {
    fs.mkdirsSync('test/light-modules/')
  })

  afterEach(() => {
    s && s.close && s.close()
    fs.removeSync('test/light-modules/')
  })

  it('installs a package', (done) => {
    mr({port: 1331}, (err, server) => {
      if (err) throw err
      s = server

      const opts = {
        lightModulesFolder: path.join(__dirname, 'light-modules'),
        registry: 'http://127.0.0.1:1331'
      }
      install(['underscore'], opts)
        .then(() => {
          expect(fs.existsSync(path.join(__dirname, 'light-modules', 'underscore', 'underscore.js'))).to.be.true
          done()
        })
    })
  })

  it('installs multiple packages', (done) => {
    mr({port: 1331}, (err, server) => {
      if (err) throw err
      s = server

      const opts = {
        lightModulesFolder: path.join(__dirname, 'light-modules'),
        registry: 'http://127.0.0.1:1331'
      }
      install(['underscore', 'async'], opts)
        .then(() => {
          expect(fs.existsSync(path.join(__dirname, 'light-modules', 'underscore', 'underscore.js'))).to.be.true
          expect(fs.existsSync(path.join(__dirname, 'light-modules', 'async', 'lib', 'async.js'))).to.be.true
          done()
        })
    })
  })
})
