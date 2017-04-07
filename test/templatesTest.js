/* eslint-env mocha */

const expect = require('chai').expect
const path = require('path')
const fs = require('fs')
const fse = require('fs-extra')

const templates = require('../lib/templates.js')

describe('templates', function () {
  describe('renderTemplate', function () {
    it('should replace multiple, equal tokens', function () {
      const template = '__a__ __b__ foo __a__ _b __b__'

      const result = templates.renderTemplate(template, {
        '__a__': 'cheese',
        '__b__': 'burrito'
      })

      expect(result).to.equal('cheese burrito foo cheese _b burrito')
    })
  })

  describe('writeTemplate', function () {
    const fixturesDir = path.join(__dirname, 'tmp')

    beforeEach(function () {
      fse.mkdir(fixturesDir)
    })

    afterEach(function () {
      fse.removeSync(fixturesDir)
    })

    it('should write rendered templates', function (done) {
      const template = path.join(__dirname, 'resources', 'README.md.tpl')
      const tokens = {
        '__food__': 'cheese',
        '__fruit__': 'apple'
      }

      const target = path.join(fixturesDir, 'README.md')

      templates.writeTemplate(template, target, tokens, function (err) {
        if (err) return done(err)
        fs.readFile(target, function (er, data) {
          if (er) return done(er)
          expect(data.toString()).to.equal('cheese test apple\n')
          done()
        })
      })
    })
  })
})
