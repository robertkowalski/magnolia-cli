// XXX: Would be better to automatically read from bin directory somehow

const commands = {
  'jumpstart': {
    description: 'download and setup a Magnolia CMS instance for development.',
    options: ['-p', '--path',
      '-m', '--magnolia-version',
      '-i', '--install-sample-module',
      '-e', '--enterprise-edition'],
    customizable: true
  },
  'install': {
    description: 'install a light module from npm to the local Magnolia instance.'
  },
  'start': {
    description: 'start up a Magnolia CMS instance. To stop it, enter CTRL+C',
    options: ['-p', '--path',
      '-d', '--dont-ignore-open-files-check']
  },
  'add-availability': {
    description: 'add component availability.',
    options: ['-g', '--autogenerate',
      '-p', '--path']
  },
  'build': {
    description: 'scan a node_modules folder for npm packages with the keyword "magnolia-light-module" (in package.json) and extract them to a directory of choice.',
    options: ['-n', '--node-modules',
      '-p', '--path']
  },
  'create-component': {
    description: 'create a component and optionally add availability for it.',
    options: ['-a', '--available',
      '-g', '--autogenerate',
      '-p', '--path'],
    customizable: true
  },
  'create-light-module': {
    description: 'create a light module.',
    options: ['-p', '--path'],
    customizable: true
  },
  'create-page': {
    description: 'create a page template.',
    options: ['-p', '--path']
  },
  'customize-local-config': {
    description: 'extract "mgnl-cli-prototypes" folder and "mgnl-cli.json" file to customize CLI configuration.',
    options: ['-p', '--path']
  },
  'customise-local-config': {
    // even if noHelp === true, description is needed or apparently commander.js won't register the command
    description: 'Alias to customize-local-config',
    noHelp: true
  },
  'setup': {
    description: 'Replaced by customize-local-config',
    noHelp: true
  },
  'tab-completion': {
    description: 'install tab autocomplete feature for Bash, zsh or PowerShell',
    options: []
  },
  'help': {
    implicit: true
  },
  'search': {
    description: 'search a light module.',
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
