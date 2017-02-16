const os = require('os')
const path = require('path')
const fs = require('fs-extra')

const FileSnippetManager = require('./FileSnippetManager')

const POSIX_CHECK_DIR_PATH = path.join(os.homedir(), '.config')
const POSIX_USER_PROFILE_PATH = path.join(os.homedir(), '.config', 'powershell', 'profile.ps1')
const WINDOWS_CHECK_DIR_PATH = path.join(os.homedir(), 'Documents')
const WINDOWS_USER_PROFILE_PATH = path.join(os.homedir(), 'Documents', 'WindowsPowerShell', 'profile.ps1')

const ENCODING = 'utf8'

const commands = require('../lib/commands')
const options = Object.keys(commands).map((item) => `'${item}'`).join(',')

const setupHead = '# mgnl-tabcompletion-start'
const setupTail = '# mgnl-tabcompletion-end'
// XXX: ValidateSet produces predefined, unadjustable error message for unexpected args
const script = `# set up tab autocompletion for mgnl command
$_mgnl = Get-Command mgnl | Select-Object -ExpandProperty Path
function mgnl {
  param (
    [ValidateSet(${options})]
    $command
  )
  & $_mgnl $command $args
}`

const posixSnippetManager = new FileSnippetManager(POSIX_USER_PROFILE_PATH, setupHead, setupTail)
const windowsSnippetManager = new FileSnippetManager(WINDOWS_USER_PROFILE_PATH, setupHead, setupTail)

// only installing for current user at the moment - global installation
// would depend on $PSHOME, which is highly platform- and setup-dependent
module.exports.install = () => !!(tryPosixInstall() | tryWindowsInstall())

function tryPosixInstall () {
  return tryInstall(POSIX_CHECK_DIR_PATH, POSIX_USER_PROFILE_PATH, posixSnippetManager)
}

function tryWindowsInstall () {
  return tryInstall(WINDOWS_CHECK_DIR_PATH, WINDOWS_USER_PROFILE_PATH, windowsSnippetManager)
}

function tryInstall (checkDirPath, filePath, snippetManager) {
  try {
    fs.accessSync(checkDirPath, fs.constants.W_OK)
  } catch (err) {
    return false
  }

  try {
    fs.mkdirsSync(path.join(filePath, '..'))
  } catch (err) {
    if (err) {
      return false
    }
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '', ENCODING)
  }

  snippetManager.tryRemove()
  return snippetManager.tryAppend(script)
}

module.exports.uninstall = () => !!(posixSnippetManager.tryRemove() | windowsSnippetManager.tryRemove())
