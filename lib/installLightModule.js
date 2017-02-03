const request = require('request')
const Promise = require('bluebird')
const log = require('npmlog')
const path = require('path')
const tar = require('tar')
const fse = require('fs-extra')
const zlib = require('zlib')
const fs = require('fs')

const MgnlCliError = require('./helper.js').MgnlCliError

const get = Promise.promisify(request.get)
const mkdirp = Promise.promisify(fse.mkdirp)

exports = (module.exports = installLightModule)

function installLightModule (moduleName, {lightModulesFolder}) {
  return new Promise((resolve, reject) => {

    const t = path.join(lightModulesFolder, moduleName + '.tgz')

    // todo: use tmp dir
    get({
      url: `https://registry.npmjs.org/${moduleName}/latest`,
      json: true
    })
    .then((res) => {
      if (!/2../.test(res.statusCode)) {
        throw new MgnlCliError(`Could not find the package ${moduleName}. Did you spell it wrong?`)
      }
      return res.body.dist.tarball
    })
    .then((tarballUrl) => {
      return download(tarballUrl, lightModulesFolder, t)
    })
    .then(() => {
      return extract(moduleName, t, lightModulesFolder)
    })
    .then(() => {
      return
    })
    .then(() => {
      log.info('', 'Extracted light module to:', lightModulesFolder)
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
        log.info('', 'Downloading', url)

        request.get({
          url: url
        })
        .pipe(tStream)
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
