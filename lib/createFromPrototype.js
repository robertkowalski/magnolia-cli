var path = require('path')
var fs = require('fs-extra')
var util = require('util')
var helper = require('./helper.js')
var writeTemplate = require('./templates.js').writeTemplate

var prototypesFolder = helper.resolveMgnlCliPrototypesPath()

function create (prototype, newFile, replace, cb) {
  prototype = path.join(prototypesFolder, prototype)
  newFile = path.normalize(newFile)

  if (!fs.existsSync(prototype)) {
    throw new Error(prototype + " doesn't exist")
  }

  fs.copy(prototype, newFile, function (err) {
    if (err) {
      throw err
    }
    if (!replace) {
      return
    }

    writeTemplate(prototype, newFile, replace, function (err) {
      if (err) throw err

      helper.printInfo(util.format('%s created', newFile))
      if (cb) cb(null)
    })
  })
}

exports.create = create
