var path = require('path')
var fs = require('fs-extra')
var helper = require('./helper.js')
var writeTemplate = require('./templates.js').writeTemplate
var log = helper.logger

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

      log.info('%s created', newFile)
      if (cb) cb(null)
    })
  })
}

exports.create = create
