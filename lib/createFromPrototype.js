const path = require('path')
const fs = require('fs-extra')
const helper = require('./helper.js')
const writeTemplate = require('./templates.js').writeTemplate
const log = helper.logger
const MgnlCliError = helper.MgnlCliError

const prototypesFolder = helper.resolveMgnlCliPrototypesPath()

function create (prototype, newFile, replace, cb) {
  prototype = path.join(prototypesFolder, prototype)
  newFile = path.normalize(newFile)

  if (!fs.existsSync(prototype)) {
    throw new MgnlCliError(prototype + " doesn't exist. Please ensure that your mgnl-cli-prototypes folder contains this file.")
  }

  fs.copy(prototype, newFile, (err) => {
    if (err) {
      throw err
    }
    if (!replace) {
      return
    }

    writeTemplate(prototype, newFile, replace, (err) => {
      if (err) throw err

      log.info('%s created', newFile)
      if (cb) cb(null)
    })
  })
}

exports.create = create
