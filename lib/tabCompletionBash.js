// Actually, this file handles bash and zsh, but what's in a name?

const os = require('os')
const path = require('path')
const fs = require('fs')
const FileSnippetManager = require('./FileSnippetManager')
const i18next = require('./bootstrap.js')()
const log = require('./helper.js').logger

const GLOBAL_FILE_DIR_PATH = path.join('/', 'etc', 'bash_completion.d')
const GLOBAL_FILE_PATH = path.join(GLOBAL_FILE_DIR_PATH, 'mgnl')
const USER_FILE_DIR_PATH = path.join(os.homedir(), '.mgnl')
const USER_FILE_PATH = path.join(USER_FILE_DIR_PATH, 'mgnl')
const USER_BASH_FILES = [path.join(os.homedir(), '.bashrc'),
  path.join(os.homedir(), '.bash_profile'),
  path.join(os.homedir(), '.profile')]
const USER_ZSHRC = path.join(os.homedir(), '.zshrc')

const ENCODING = 'utf8'

const commands = require('../lib/commands').commands
// Only suggest commands there are shown in the help
const commandList = Object.keys(commands).filter((key) => !commands[key].noHelp).join(' ')

let optionCases = ''
for (let key of Object.keys(commands)) {
  if (!commands[key].options) {
    continue
  }

  let optionList = commands[key].options.filter((o) => o.length > 2).join(' ')
  optionCases += `
  ${key})
  options="${optionList}";;`
}
const script = `# This file contains command line auto-complete (on tab) configuration for the mgnl command

_mgnl()
{
  local cur prev
  COMPREPLY=()
  cur="\${COMP_WORDS[COMP_CWORD]}"
  prev="\${COMP_WORDS[COMP_CWORD-1]}"
  command="\${COMP_WORDS[1]}"

  options="${commandList}"

  if [[ $cur == -* ]]
  then
    case $command in
      ${optionCases}
    esac
  else
    if [[ -n $command && $cur != $command ]] # there is a command already
    then
      return 0
    fi
  fi

  COMPREPLY=( $(compgen -W "\${options}" -- \${cur}) )
  return 0
}
complete -o default -F _mgnl mgnl
`

const importHead = '# mgnl-tabcompletion-start'
const importTail = '# mgnl-tabcompletion-end'
const bashrcSnippetManagers = USER_BASH_FILES.map((file) => new FileSnippetManager(file, importHead, importTail))
const zshrcSnippetManager = new FileSnippetManager(USER_ZSHRC, importHead, importTail)

const bashrcImport = `# load mgnl command tab completion
source ~/.mgnl/mgnl`
const zshrcImport = `# load mgnl command tab completion
autoload bashcompinit
bashcompinit
source ~/.mgnl/mgnl`

module.exports.install = () => {
  const globalSuccess = installGlobally()
  return globalSuccess || installForUser()
}

function installGlobally () {
  try {
    fs.accessSync(GLOBAL_FILE_DIR_PATH, fs.constants.W_OK)
    fs.writeFileSync(GLOBAL_FILE_PATH, script, ENCODING)
    return true
  } catch (err) {
    // we cannot write there (might even not exist)
    return false
  }
}

function installForUser () {
  try {
    fs.accessSync(os.homedir(), fs.constants.W_OK)
  } catch (err) {
    log.error(
      i18next.t(
        'mgnl-tab-completion--bash--permission-error',
        {
          GLOBAL_FILE_DIR_PATH: GLOBAL_FILE_DIR_PATH,
          USER_FILE_DIR_PATH: USER_FILE_DIR_PATH,
          interpolation: { escapeValue: false }
        }
      )
    )
    return false
  }

  if (!fs.existsSync(USER_FILE_DIR_PATH)) {
    fs.mkdirSync(USER_FILE_DIR_PATH)
  }
  fs.writeFileSync(USER_FILE_PATH, script, ENCODING)

  removeExistingImports()
  let success = false
  success |= bashrcSnippetManagers.map((manager) => manager.tryAppend(bashrcImport)).reduce((a, b) => a || b)
  success |= zshrcSnippetManager.tryAppend(zshrcImport)
  return success
}

module.exports.uninstall = () => {
  let success = false
  success |= tryDelete(GLOBAL_FILE_PATH)
  success |= tryDelete(USER_FILE_PATH)

  success &= removeExistingImports()

  try {
    fs.accessSync(USER_FILE_DIR_PATH, fs.access.W_OK)

    if (!fs.readdirSync(USER_FILE_DIR_PATH).length) {
      tryDelete(USER_FILE_DIR_PATH)
    }
  } catch (err) { }

  return success
}

function removeExistingImports () {
  let success = false
  success |= bashrcSnippetManagers.map((manager) => manager.tryRemove()).reduce((a, b) => a || b)
  success |= zshrcSnippetManager.tryRemove()
  return success
}

function tryDelete (itemPath) {
  try {
    fs.accessSync(itemPath, fs.constants.W_OK)
  } catch (err) {
    return false
  }

  if (fs.lstatSync(itemPath).isDirectory()) {
    fs.rmdirSync(itemPath)
  } else {
    fs.unlinkSync(itemPath)
  }
  return true
}
