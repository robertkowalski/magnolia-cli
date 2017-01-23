var fs = require('fs')

exports.writeTemplate = writeTemplate
function writeTemplate (source, target, tokens, cb) {
  fs.readFile(source, 'utf-8', function (err, data) {
    if (err) return cb(err)

    var res = renderTemplate(data, tokens)
    writeData(target, res, cb)
  })

  function writeData (target, data, cb) {
    fs.writeFile(target, data, 'utf-8', function (err) {
      if (err) return cb(err)

      cb(null)
    })
  }
}

exports.renderTemplate = renderTemplate
function renderTemplate (template, tokens) {
  Object.keys(tokens).forEach(function (change) {
    var regex = new RegExp(change, 'g')
    template = template.replace(regex, tokens[change])
  })

  return template
}
