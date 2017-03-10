/* eslint-env mocha */

var expect = require('chai').expect

const os = require('os')
const path = require('path')
const fs = require('fs')

const mockFs = require('mock-fs')
const mockRequire = require('mock-require')
const originalCommandExistsSync = require('command-exists').sync

const ENCODING = 'utf8'

const BASH_GLOBAL_DIR = path.join('/', 'etc', 'bash_completion.d')
const PS_DIR = path.join(os.homedir(), 'Documents', 'WindowsPowerShell')
const PS_PROFILE = path.join(os.homedir(), 'Documents', 'WindowsPowerShell', 'profile.ps1')
const PS_DIR_POSIX = path.join(os.homedir(), '.config', 'powershell')
const PS_PROFILE_POSIX = path.join(os.homedir(), '.config', 'powershell', 'profile.ps1')
const BASHRC = path.join(os.homedir(), '.bashrc')
const BASH_PROFILE = path.join(os.homedir(), '.bash_profile')
const PROFILE = path.join(os.homedir(), '.profile')
const ZSHRC = path.join(os.homedir(), '.zshrc')
const DOT_MGNL = path.join(os.homedir(), '.mgnl')

const MARKER = '# test comment'

const mockDirs = {}
mockDirs[PS_DIR] = {}
mockDirs[PS_DIR_POSIX] = {}
mockDirs[BASHRC] = MARKER
mockDirs[BASH_PROFILE] = MARKER
mockDirs[PROFILE] = MARKER
mockDirs[ZSHRC] = MARKER
mockDirs[BASH_GLOBAL_DIR] = {}

const noSudoMockDirs = {}
Object.assign(noSudoMockDirs, mockDirs)
noSudoMockDirs[BASH_GLOBAL_DIR] = mockFs.directory({
  mode: 292, // same as 0444 (readonly) - StandardJS just won't let us write numbers in hex
  items: {}
})

var powershellInstalled = true
mockRequire('command-exists', {
  sync: (command) =>
  command === 'powershell' ? powershellInstalled : originalCommandExistsSync(command)
})

const tabCompletion = require('../lib/tabCompletion')
const tabCompletionPowerShell = require('../lib/tabCompletionPowerShell')

describe('tabCompletion', () => {
  beforeEach(() => {
    mockFs(mockDirs)
  })

  afterEach(() => {
    mockFs.restore()
    mockRequire.stopAll()
  })

  describe('install', () => {
    it('should report success', () => {
      let success = tabCompletion.install()

      expect(success).to.be.true
    })

    describe('PowerShell', () => {
      beforeEach(() => {
        if (fs.existsSync(PS_PROFILE)) {
          fs.unlinkSync(PS_PROFILE)
        }
        if (fs.existsSync(PS_PROFILE_POSIX)) {
          fs.unlinkSync(PS_PROFILE_POSIX)
        }

        expect(fs.existsSync(PS_PROFILE)).not.to.be.true
        expect(fs.existsSync(PS_PROFILE_POSIX)).not.to.be.true
      })

      it('should report success', () => {
        const success = tabCompletionPowerShell.install()

        expect(success).to.be.true
      })

      it('should create a profile.ps1', () => {
        tabCompletion.install()

        expect(fs.existsSync(PS_PROFILE)).to.be.true
        expect(fs.existsSync(PS_PROFILE_POSIX)).to.be.true
        expect(fs.readFileSync(PS_PROFILE, ENCODING)).to.not.be.empty
        expect(fs.readFileSync(PS_PROFILE_POSIX, ENCODING)).to.not.be.empty
      })

      it('should include head and tail lines in profile.ps1 snippet', () => {
        tabCompletion.install()

        expect(fs.readFileSync(PS_PROFILE, ENCODING)).to.contain('# mgnl-tabcompletion-start')
        expect(fs.readFileSync(PS_PROFILE, ENCODING)).to.contain('# mgnl-tabcompletion-end')
        expect(fs.readFileSync(PS_PROFILE_POSIX, ENCODING)).to.contain('# mgnl-tabcompletion-start')
        expect(fs.readFileSync(PS_PROFILE_POSIX, ENCODING)).to.contain('# mgnl-tabcompletion-end')
      })

      it('should not alter snippet on second invocation', () => {
        tabCompletion.install()

        let contentAfterInstall = fs.readFileSync(PS_PROFILE, ENCODING)
        let contentAfterInstallPosix = fs.readFileSync(PS_PROFILE_POSIX, ENCODING)

        tabCompletion.install()

        expect(fs.readFileSync(PS_PROFILE, ENCODING)).to.equal(contentAfterInstall)
        expect(fs.readFileSync(PS_PROFILE_POSIX, ENCODING)).to.equal(contentAfterInstallPosix)
      })
    })

    describe('no PowerShell', () => {
      let _powershellInstalled = powershellInstalled

      beforeEach(() => {
        powershellInstalled = false
      })

      afterEach(() => {
        powershellInstalled = _powershellInstalled
      })

      it('should not create a profile.ps1', () => {
        tabCompletion.install()

        expect(fs.existsSync(PS_PROFILE)).to.be.false
      })
    })

    describe('bash, zsh', () => {
      describe('for user only', () => {
        beforeEach(() => {
          mockFs(noSudoMockDirs)
        })

        afterEach(() => {
          mockFs.restore()
        })

        it('should create file mgnl in ~/.mgnl directory', () => {
          tabCompletion.install()

          expect(fs.readdirSync(DOT_MGNL)).to.contain('mgnl')
        })

        it('should not touch existing .bashrc/.zshrc code', () => {
          tabCompletion.install()

          expect(fs.readFileSync(BASHRC, ENCODING)).to.contain(MARKER)
          expect(fs.readFileSync(BASH_PROFILE, ENCODING)).to.contain(MARKER)
          expect(fs.readFileSync(PROFILE, ENCODING)).to.contain(MARKER)
          expect(fs.readFileSync(ZSHRC, ENCODING)).to.contain(MARKER)
        })

        it('should add head/tail lines along with snippet', () => {
          tabCompletion.install()

          expect(fs.readFileSync(BASHRC, ENCODING)).to.contain('# mgnl-tabcompletion-start')
          expect(fs.readFileSync(BASHRC, ENCODING)).to.contain('# mgnl-tabcompletion-end')
          expect(fs.readFileSync(BASH_PROFILE, ENCODING)).to.contain('# mgnl-tabcompletion-start')
          expect(fs.readFileSync(BASH_PROFILE, ENCODING)).to.contain('# mgnl-tabcompletion-end')
          expect(fs.readFileSync(PROFILE, ENCODING)).to.contain('# mgnl-tabcompletion-start')
          expect(fs.readFileSync(PROFILE, ENCODING)).to.contain('# mgnl-tabcompletion-end')
          expect(fs.readFileSync(ZSHRC, ENCODING)).to.contain('# mgnl-tabcompletion-start')
          expect(fs.readFileSync(ZSHRC, ENCODING)).to.contain('# mgnl-tabcompletion-end')
        })
      })

      describe('globally', () => {
        it('should put a bash script to global autocomplete direcory', () => {
          tabCompletion.install()

          expect(fs.readFileSync(path.join(BASH_GLOBAL_DIR, 'mgnl'), ENCODING)).to.exist.and.to.not.be.empty
        })
      })
    })
  })

  describe('uninstall', () => {
    beforeEach(() => {
      tabCompletion.install()
    })

    describe('powershell', () => {
      it('should remove snippet (including head/tail) from profile.ps1', () => {
        tabCompletion.uninstall()

        expect(fs.readFileSync(PS_PROFILE, ENCODING)).to.not.contain('# mgnl-tabcompletion-start')
        expect(fs.readFileSync(PS_PROFILE, ENCODING)).to.not.contain('# mgnl-tabcompletion-end')
        expect(fs.readFileSync(PS_PROFILE_POSIX, ENCODING)).to.not.contain('# mgnl-tabcompletion-start')
        expect(fs.readFileSync(PS_PROFILE_POSIX, ENCODING)).to.not.contain('# mgnl-tabcompletion-end')
      })
    })

    describe('bash, zsh', () => {
      describe('for local user', () => {
        beforeEach(() => {
          mockFs(noSudoMockDirs)
          tabCompletion.install()
        })

        afterEach(() => {
          mockFs.restore()
        })

        let mgnlBashFile = path.join(DOT_MGNL, 'mgnl')

        it('should remove mgnl inside ~/.mgnl', () => {
          tabCompletion.uninstall()

          expect(fs.existsSync(mgnlBashFile)).to.be.false
        })

        it('should remove ~/.mgnl dir if empty', () => {
          tabCompletion.uninstall()

          expect(fs.existsSync(DOT_MGNL)).to.be.false
        })

        it('should not remove ~/.mgnl dir if there are other files', () => {
          let someOtherFile = path.join(DOT_MGNL, 'whatever.rar')
          fs.writeFileSync(someOtherFile, 'foo bar baz', ENCODING)

          tabCompletion.uninstall()

          expect(fs.existsSync(DOT_MGNL)).to.be.true
          expect(fs.existsSync(someOtherFile)).to.be.true
        })

        it('should remove snippet (includig head/tail) from .bashrc/.zshrc', () => {
          tabCompletion.uninstall()

          expect(fs.readFileSync(BASHRC, ENCODING)).to.not.contain('# mgnl-tabcompletion-start')
          expect(fs.readFileSync(BASHRC, ENCODING)).to.not.contain('# mgnl-tabcompletion-end')
          expect(fs.readFileSync(BASH_PROFILE, ENCODING)).to.not.contain('# mgnl-tabcompletion-start')
          expect(fs.readFileSync(BASH_PROFILE, ENCODING)).to.not.contain('# mgnl-tabcompletion-end')
          expect(fs.readFileSync(PROFILE, ENCODING)).to.not.contain('# mgnl-tabcompletion-start')
          expect(fs.readFileSync(PROFILE, ENCODING)).to.not.contain('# mgnl-tabcompletion-end')
          expect(fs.readFileSync(ZSHRC, ENCODING)).to.not.contain('# mgnl-tabcompletion-start')
          expect(fs.readFileSync(ZSHRC, ENCODING)).to.not.contain('# mgnl-tabcompletion-end')
        })

        it('should not touch foreign .bashrc/.zshrc', () => {
          tabCompletion.uninstall()

          expect(fs.readFileSync(BASHRC, ENCODING)).to.contain('# test comment')
          expect(fs.readFileSync(BASH_PROFILE, ENCODING)).to.contain('# test comment')
          expect(fs.readFileSync(PROFILE, ENCODING)).to.contain('# test comment')
          expect(fs.readFileSync(ZSHRC, ENCODING)).to.contain('# test comment')
        })
      })

      describe('globally', () => {
        it('should remove mgnl script from global autocomplete directory', () => {
          tabCompletion.uninstall()

          expect(fs.readdirSync(BASH_GLOBAL_DIR)).to.not.contain('mgnl')
        })
      })
    })
  })
})
