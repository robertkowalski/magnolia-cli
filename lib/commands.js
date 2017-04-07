// XXX: Would be better to automatically read from bin directory somehow

const i18next = require('./bootstrap.js')()

const commands = {
  'jumpstart': {
    description: i18next.t('commands-jumpstart-description'),
    options: ['-p', '--path',
      '-m', '--magnolia-version',
      '-i', '--install-sample-module',
      '-e', '--enterprise-edition'],
   // a customizable command is one which can be affected when customising prototypes
   // and mgnl-cli.json
    customizable: true
  },
  'start': {
    description: i18next.t('commands-start-description'),
    options: ['-p', '--path',
      '-d', '--dont-ignore-open-files-check']
  },

  'add-availability': {
    description: i18next.t('commands-add-availability-description'),
    options: ['-g', '--autogenerate',
      '-p', '--path']
  },
  'build': {
    description: i18next.t('commands-build-description'),
    options: ['-n', '--node-modules',
      '-p', '--path']
  },
  'create-component': {
    description: i18next.t('commands-create-component-description'),
    options: [
      '-a', '--available',
      '-g', '--autogenerate',
      '-p', '--path',
      '-P', '--prototype'
    ],
    customizable: true
  },
  'create-light-module': {
    description: i18next.t('commands-create-light-module-description'),
    options: ['-p', '--path'],
    customizable: true
  },
  'create-page': {
    description: i18next.t('commands-create-page-description'),
    options: [
      '-P', '--prototype',
      '-p', '--path'
    ],
    customizable: true
  },
  'customize-local-config': {
    description: i18next.t('commands-customize-local-config'),
    options: ['-p', '--path']
  },
  'customise-local-config': {
    // even if noHelp === true, description is needed or apparently commander.js won't register the command
    description: i18next.t('commands-customise-local-config'),
    noHelp: true
  },
  'help': {
    implicit: true
  },
  'install': {
    description: i18next.t('commands-install-description')
  },
  'search': {
    description: i18next.t('commands-search-description'),
    options: []
  },
  'setup': {
    description: i18next.t('commands-setup-description'),
    noHelp: true
  },
  'tab-completion': {
    description: i18next.t('commands-tab-completion-description'),
    options: []
  }
}

function getCustomizableCommandNames () {
  var customizable = []
  for (let key in commands) {
    if (commands[key].customizable) {
      customizable.push(key)
    }
  }
  return customizable
}

function getAllCommandNames () {
  var all = []
  for (let key in commands) {
    all.push(key)
  }
  return all
}

exports.commands = commands
exports.getCustomizableCommandNames = getCustomizableCommandNames
exports.getAllCommandNames = getAllCommandNames
