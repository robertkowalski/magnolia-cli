var path = require('path')
var fs = require('fs-extra')
var util = require('util')
var helper = require('./helper.js')

var prototypesFolder = helper.resolveMgnlCliPrototypesPath()

var create = function (prototype, newFile, replace) {
  prototype = path.join(prototypesFolder, prototype)
  newFile = path.normalize(newFile)

  if (fs.existsSync(prototype)) {
    fs.copy(prototype, newFile, function (err) {
      if (err) {
        throw err
      }
      if (replace) {
        fs.readFile(newFile, 'utf-8', function (err, data) {
          if (err) throw err
          var newValue = data
          Object.keys(replace).forEach(function (change) {
            var replaceString = new RegExp(change, 'g')
            newValue = newValue.replace(replaceString, replace[change])
          })
          if (newValue) {
            fs.writeFile(newFile, newValue, 'utf-8', function (err, data) {
              if (err) throw err
            })
          }
        })
        helper.printInfo(util.format('%s created', newFile))
      }
    })
  } else {
    throw new Error(prototype + " doesn't exist")
  }
}

exports.create = create
