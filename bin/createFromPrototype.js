var path = require('path')
var fs = require('fs-extra')
var util = require('util')
var helper = require('./helper.js')

// npm global location for prototypes
var prototypesFolder = path.resolve(__dirname, '../_prototypes')

// a MGNLCLI_HOME env variable is set, use prototypes from there
if (process.env.MGNLCLI_HOME) {
  helper.printInfo(util.format('MGNLCLI_HOME env variable is set. Using prototypes from %s', process.env.MGNLCLI_HOME))
  prototypesFolder = path.join(process.env.MGNLCLI_HOME, '_prototypes')
}

var createFromPrototype = function (prototype, newFile, replace) {
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

exports.createFromPrototype = createFromPrototype
