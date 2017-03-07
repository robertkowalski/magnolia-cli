/* eslint-env mocha */

var expect = require('chai').expect
var testHelper = require('./testHelper')
var searchFunction = require('../lib/searchLightModule.js')
var nock = require('nock')

describe('search function integration test', function () {
  it('should find 0 result', function () {
    var result = testHelper.invokeMgnlSubcommand('search', '')
    expect(result.stdout.toString()).to.contain('0 result found')
  })
})

describe('search function unit test', function () {
  it('should find 1 result', function (done) {
    nock('https://api.npms.io').get('/v2/search?q=foo+keywords:magnolia-light-module')
        .reply(200,
      {'total': 1,
        'results': [{'package': {'name': 'language-switcher-magnolia',
          'version': '1.0.5',
          'description': 'Language Switcher - Component template for Magnolia CMS',
          'keywords': ['magnolia-light-module', 'magnolia-component', 'language-switcher'],
          'date': '2017-02-25T16:18:21.055Z',
          'links': {'npm': 'https://www.npmjs.com/package/language-switcher-magnolia',
            'homepage': 'https://github.com/magnolia-cms/language-switcher-magnolia#readme',
            'repository': 'https://github.com/magnolia-cms/language-switcher-magnolia',
            'bugs': 'https://github.com/magnolia-cms/language-switcher-magnolia/issues'},
          'publisher': {'username': 'magnolia', 'email': 'npmjs@magnolia-cms.com'},
          'maintainers': [{'username': 'magnolia', 'email': 'npmjs@magnolia-cms.com'}]},
          'score': {'final': 0.3935883692141957, 'detail': {'quality': 0.5236202692489591, 'popularity': 0.015890242087800776, 'maintenance': 0.6598305820250794}},
          'searchScore': 3.158504e-7}]
      })

    searchFunction.search('foo').then(function (result) {
      expect(result).to.contain('1 result found')
      done()
    })
  })
})
