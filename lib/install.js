const Promise = require('bluebird')
const log = require('./helper').logger
const path = require('path')
const tar = require('tar')
const fs = require('fs-extra')
const zlib = require('zlib')
const osenv = require('osenv')
const i18next = require('./bootstrap.js')()

const MgnlCliError = require('./helper.js').MgnlCliError

function noop () {}
const silentLogger = {
  error: noop, warn: noop, info: noop, verbose: noop,
  silly: noop, http: noop, pause: noop, resume: noop
}

const RegClient = require('npm-registry-client')
const client = new RegClient({
  log: silentLogger
})

const get = Promise.promisify(client.get, { context: client })
const mkdirp = Promise.promisify(fs.mkdirp)
const remove = Promise.promisify(fs.remove)

exports = (module.exports = install)

function install (moduleNames, { lightModulesFolder, registry = 'https://registry.npmjs.org' }) {
  const chain = moduleNames.map((module) => {
    return installModule(module, { lightModulesFolder, registry })
  })

  return Promise.all(chain)
}

function installModule (moduleName, { lightModulesFolder, registry }) {
  return new Promise((resolve, reject) => {
    const tempTarball = path.join(osenv.tmpdir(), moduleName + '.tgz')

    get(`${registry}/${moduleName}/latest`, { timeout: 1000 })
      .catch((err) => {
        if (err.statusCode === 404) {
          const errMsg = i18next.t(
            'mgnl-install--error-not-found',
            { moduleName: moduleName, interpolation: { escapeValue: false } }
          )
          throw new MgnlCliError(errMsg)
        }
      })
      .then((data, raw, res) => {
        return data.dist.tarball
      })
      .then((tarballUrl) => {
        return download(tarballUrl, lightModulesFolder, tempTarball)
      })
      .then(() => {
        return extract(moduleName, tempTarball, lightModulesFolder)
      })
      .then(() => {
        return remove(tempTarball)
      })
      .then(() => {
        log.info(
          i18next.t(
            'mgnl-install--info-installed',
            { lightModulesFolder: lightModulesFolder, interpolation: { escapeValue: false } }
          )
        )
        resolve()
      })
  })
}

function download (url, dir, target) {
  return new Promise((resolve, reject) => {
    mkdirp(dir)
      .then(() => {
        const tStream = fs.createWriteStream(target)

        tStream.on('close', () => {
          resolve()
        })
        .on('error', reject)

        log.info(
          i18next.t(
            'mgnl-install--info-downloading',
            { url: url, interpolation: { escapeValue: false } }
          )
        )

        client.fetch(url, { timeout: 1000 }, (er, response) => {
          if (er) throw er
          response.pipe(tStream)
        })
      })
  })
}

function extract (moduleName, tarball, target) {
  return new Promise((resolve, reject) => {
    const p = path.join(target, moduleName)

    const extractor = tar
      .Extract({path: p, strip: 1})
      .on('error', reject)
      .on('end', resolve)

    fs.createReadStream(tarball)
      .on('error', reject)
      .pipe(zlib.Unzip())
      .pipe(extractor)
  })
}
