const path = require('path')
const fs = require('fs')
const Promise = require('bluebird')
const log = require('npmlog')

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
        log.info("'%s' not found. Skipping it...", file)
        return
      }

      return readFile(file, 'utf8')
    })
    .then((content) => {
      log.info('Changing magnolia.properties at ', file, ' as follows:')

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
      log.info('No properties configuration found')
      return resolve()
    }

    log.info('Replacing Magnolia properties to prepare it for light development...')

    const instance = 'magnoliaAuthor'
    const pathToConfig = path.join(
      config.setupMagnolia.tomcatFolder,
      'webapps',
      instance,
      'WEB-INF',
      'config',
      'default',
      'magnolia.properties'
    )

    return replacePropertiesInFile(pathToConfig, config.setupMagnolia.webapps.magnoliaAuthor)
      .then(resolve)
  })
}
