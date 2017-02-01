// XXX: Would be better to automatically read from bin directory somehow
const commands = {
  'jumpstart': {
    description: 'download and setup a Magnolia CMS instance for development.'
  },
  'start': {
    description: 'start up a Magnolia CMS instance. To stop it, enter CTRL+C'
  },
  'add-availability': {
    description: 'add component availability.'
  },
  'build': {
    description: 'scan a node_modules folder for npm packages with the keyword "magnolia-light-module" (in package.json) and extract them to a directory of choice.'
  },
  'create-component': {
    description: 'create a component and optionally add availability for it.'
  },
  'create-light-module': {
    description: 'create a light module.'
  },
  'create-page': {
    description: 'create a page template.'
  },
  'setup': {
    description: 'extract "mgnl-cli-prototypes" folder and "mgnl-cli.json" file to have a custom configuration.'
  },
  'help': {
    implicit: true
  }
}

module.exports = commands
