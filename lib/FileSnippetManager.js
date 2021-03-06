const fs = require('fs')
const log = require('../lib/helper').logger
const i18next = require('./bootstrap.js')()

/**
 * Manager for a part of a file, marked by a head and a tail line, without altering any
 * other content of that file.
 */
class FileSnippetManager {
  constructor (filePath, headLine, tailLine, encoding = 'utf8') {
    this.filePath = filePath
    this.headLine = headLine
    this.tailLine = tailLine
    this.encoding = encoding
  }

  snippetRegex () {
    return `\n${this.headLine}[\\s\\S]*${this.tailLine}\n\n`
  }

  fullSnippet (content) {
    return `\n${this.headLine}\n${content}\n${this.tailLine}\n\n`
  }

  tryAppend (content) {
    try {
      fs.accessSync(this.filePath, fs.constants.W_OK)
    } catch (err) {
      if (err) {
        return false
      }
    }

    const fullSnippet = this.fullSnippet(content)
    fs.appendFileSync(this.filePath, fullSnippet)
    log.silly(`Wrote snippet: ${fullSnippet}`)

    log.info(
      i18next.t(
        'file-snippet-manager--info-appended-to',
        { path: this.filePath, interpolation: { escapeValue: false } }
      )
    )

    return true
  }

  tryRemove () {
    try {
      fs.accessSync(this.filePath, fs.constants.W_OK)
    } catch (err) {
      return false
    }

    const data = fs.readFileSync(this.filePath, this.encoding)

    const replacedData = data.replace(new RegExp(this.snippetRegex(), 'g'), '')

    if (data !== replacedData) {
      log.info(
        i18next.t(
          'file-snippet-manager--info-removed-from',
          { path: this.filePath, interpolation: { escapeValue: false } }
        )
      )
    }

    fs.writeFileSync(this.filePath, replacedData, this.encoding)

    return true
  }
}

module.exports = FileSnippetManager
