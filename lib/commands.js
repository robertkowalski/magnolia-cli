// XXX: Would be better to automatically read from bin directory somehow
const commands = {
  'jumpstart': {
    description: 'download and setup a Magnolia CMS instance for development.',
    options: ['-p', '--path',
              '-m', '--magnolia-version',
              '-i', '--install-sample-module',
              '-e', '--enterprise-edition']
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
              '-p', '--path']
  },
  'create-light-module': {
    description: 'create a light module.',
    options: ['-p', '--path']
  },
  'create-page': {
    description: 'create a page template.',
    options: ['-p', '--path']
  },
  'setup': {
    description: 'extract "mgnl-cli-prototypes" folder and "mgnl-cli.json" file to have a custom configuration.',
    options: ['-p', '--path']
  },
  'tab-completion': {
    description: 'install tab autocomplete feature for Bash, zsh or PowerShell',
    options: []
  },
  'help': {
    implicit: true
  }
}

module.exports = commands
