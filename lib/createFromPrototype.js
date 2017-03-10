const path = require('path')
const fs = require('fs-extra')
const helper = require('./helper.js')
const writeTemplate = require('./templates.js').writeTemplate
const log = helper.logger
const MgnlCliError = helper.MgnlCliError

const prototypesFolder = helper.resolveMgnlCliPrototypesPath()

const i18next = require('./bootstrap.js')()

function create (prototype, newFile, replace, cb) {
  prototype = path.join(prototypesFolder, prototype)
  newFile = path.normalize(newFile)

  if (!fs.existsSync(prototype)) {
    throw new MgnlCliError(
      i18next.t(
        'create-from-prototype--error-doesnt-exist',
        { file: prototype, interpolation: { escapeValue: false } }
      ),
      true
    )
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
      log.info(
        i18next.t(
          'create-from-prototype--info-created',
          { file: newFile, interpolation: { escapeValue: false } }
        )
      )
      if (cb) cb(null)
    })
  })
}

exports.create = create
