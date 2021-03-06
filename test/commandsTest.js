/* eslint-env mocha */

const expect = require('chai').expect
const commands = require('../lib/commands.js')

describe('commands', function () {
  describe('getCustomizableCommandNames', function () {
    it('should return customizable command names only', function () {
      const result = commands.getCustomizableCommandNames()

      expect(result).to.contain('jumpstart', 'create-page', 'create-component', 'create-light-module')
    })
  })

  describe('getAllCommandNames', function () {
    it('should return all command names', function () {
      const result = commands.getAllCommandNames()

      expect(result).to.contain(
        'jumpstart',
        'start',
        'add-availability',
        'build',
        'create-component',
        'create-light-module',
        'create-page',
        'customize-local-config',
        'customise-local-config',
        'setup',
        'tab-completion',
        'help',
        'search')
    })
  })
})
