const fs = require('fs')
const Promise = require('bluebird')
const log = require('./helper').logger
const i18next = require('./bootstrap.js')()
const getMagnoliaPropertiesLocation = require('./helper').getMagnoliaPropertiesLocation

exports.replaceInConfig = replaceInConfig
function replaceInConfig (config, props) {
  Object.keys(props).forEach((key) => {
    log.info(key + '=' + props[key])
    const regex = '(' + key.replace(/\./g, '\\.') + ')(\s*=\s*)(.+)'
    const replacement = '$1$2' + props[key]

    config = config.replace(new RegExp(regex), replacement)
  })

  return config
}

exports.replacePropertiesInFile = replacePropertiesInFile
function replacePropertiesInFile (file, props) {
  const exists = Promise.promisify(fs.stat)
  const readFile = Promise.promisify(fs.readFile)
  const writeFile = Promise.promisify(fs.writeFile)

  return exists(file)
    .then((exists) => {
      if (!exists) {
        log.info(
          i18next.t(
            'edit-properties--info-file-not-found-skipping',
            { file: file, interpolation: { escapeValue: false } }
          )
        )

        return
      }

      return readFile(file, 'utf8')
    })
    .then((content) => {
      log.info(
        i18next.t(
          'edit-properties--info-changing-properties-at',
          { file: file, interpolation: { escapeValue: false } }
        )
      )

      return replaceInConfig(content, props)
    })
    .then((newContent) => {
      return writeFile(file, newContent, 'utf8')
    })
}

exports.editProperties = editProperties
function editProperties (config) {
  return new Promise((resolve, reject) => {
    if (!config.setupMagnolia.webapps) {
      log.info(i18next.t('edit-properties--info-no-properties-config-found'))
      return resolve()
    }

    log.info(i18next.t('edit-properties--info-replacing-properties'))

    const pathToConfig = getMagnoliaPropertiesLocation(
      config.setupMagnolia.tomcatFolder,
      'magnoliaAuthor'
    )

    return replacePropertiesInFile(pathToConfig, config.setupMagnolia.webapps.magnoliaAuthor)
      .then(resolve)
  })
}
