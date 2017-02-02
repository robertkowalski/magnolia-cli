const request = require('request')
const Promise = require('bluebird')
const log = require('npmlog')
const path = require('path')
const tar = require('tar')
const fse = require('fs-extra')
const zlib = require('zlib')
const fs = require('fs')

const get = Promise.promisify(request.get)
const mkdirp = Promise.promisify(fse.mkdirp)

exports = (module.exports = installLightModule)

function installLightModule (moduleName) {
  return new Promise((resolve, reject) => {

    // fixme
    //const p = path.join(process.cwd(), 'tmp')
    const p = '/Users/robert/magnolia/light-modules'
    const t = path.join(p, moduleName + '.tgz')

    // todo: use tmp dir
    get({
      url: `https://registry.npmjs.org/${moduleName}/latest`,
      json: true
    })
    .then((res) => {
      return res.body.dist.tarball
    })
    .then((tarballUrl) => {
      return download(tarballUrl, p, t)
    })
    .then(() => {
      return extract(moduleName, t, p)
    })
    .then(() => {
      return
    })
    .then(() => {
      log.info('', 'Extracted light module to:', p)
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
