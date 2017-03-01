var request = require('request')

var count = 0
var newLine = '\n'
var newTab = '\t'

function search (query) {
  return new Promise(function (resolve, reject) {
    request({
      uri: 'https://api.npms.io/v2/search?q=' + query + '+keywords:magnolia-light-module',
      json: true
    }, function (error, response, body) {
      if (error) {
        throw error
      }
      var output = ''

      var totalValue = body.total
      if (totalValue === 1 || totalValue === 0) {
        output += totalValue + ' result found' + newLine
      } else {
        output += totalValue + ' results found' + newLine
      }
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
