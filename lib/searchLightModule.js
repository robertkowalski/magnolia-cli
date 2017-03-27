const request = require('request')
const i18next = require('./bootstrap.js')()

var count = 0
var newLine = '\n'
var newTab = '\t'

function search (query) {
  return new Promise((resolve, reject) => {
    request({
      uri: 'https://api.npms.io/v2/search?q=' + query + '+keywords:magnolia-light-module',
      json: true
    }, (error, response, body) => {
      if (error) {
        throw error
      }
      let output = ''

      var totalValue = body.total

      output += i18next.t(
        'mgnl-search--info-results-found',
        { count: totalValue }
      )

      output += newLine

      var results = body.results
      for (var packageJson in results) {
        if (results.hasOwnProperty(packageJson)) {
          var receivedPackage = results[packageJson].package
          count++
          output += newLine
          output += count + ') ' + receivedPackage.name
          output += newLine + newTab
          output += receivedPackage.date.substring(0, 10)
          output += ' '
          output += receivedPackage.version
          output += newLine + newTab
          output += receivedPackage.description
          output += newLine + newTab
          if (receivedPackage.publisher) {
            output += receivedPackage.publisher.username
          }
          output += newLine
        }
      }
      resolve(output)
    })
  })
}

exports.search = search
