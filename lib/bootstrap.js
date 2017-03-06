const i18next = require('i18next')
const Backend = require('i18next-sync-fs-backend')
const path = require('path')

function bootstrap () {
  return i18next
    .use(Backend)
    .init({
      // debug: true,
      joinArrays: '\n',
      fallbackLng: 'en',
      lng: 'en',
      initImmediate: false, // sync init
      backend: {
        loadPath: path.join(__dirname, 'locales') + '/{{lng}}/{{ns}}.json'
      }
    })
}

module.exports = bootstrap
