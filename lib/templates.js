const fs = require('fs')

exports.writeTemplate = writeTemplate
function writeTemplate (source, target, tokens, cb) {
  fs.readFile(source, 'utf-8', (err, data) => {
    if (err) return cb(err)

    const res = renderTemplate(data, tokens)
    writeData(target, res, cb)
  })

  function writeData (target, data, cb) {
    fs.writeFile(target, data, 'utf-8', (err) => {
      if (err) return cb(err)

      cb(null)
    })
  }
}

exports.renderTemplate = renderTemplate
function renderTemplate (template, tokens) {
  Object.keys(tokens).forEach((change) => {
    const regex = new RegExp(change, 'g')
    template = template.replace(regex, tokens[change])
  })

  return template
}
