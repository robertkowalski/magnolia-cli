/* eslint-env mocha */
describe('add-availability', function () {
  const fs = require('fs-extra')
  const path = require('path')

  const testHelper = require('./testHelper')
  const invokeAndVerify = testHelper.invokeAndVerify
  const shell = require('shelljs')

  const expect = require('chai').expect

  beforeEach(function () {
    const noAreaPage =
    'class: info.magnolia.templating.definition.PageTemplateDefinition\n' +
      'templateScript: /foo/templates/pages/baz.ftl'

    const pageWithAreas =
    'class: info.magnolia.templating.definition.PageTemplateDefinition\n' +
      'templateScript: /foo/templates/pages/baz.ftl\n' +
      'areas:\n' +
      '  fooArea:\n' +
      '    templateScript: /foo/templates/pages/baz.ftl'

    const noAreaPageWithTaggedElement =
    'class: info.magnolia.templating.definition.PageTemplateDefinition\n' +
      "includedFile: !include 'foo/bar'\n" +
      'templateScript: /foo/templates/pages/baz.ftl'

    fs.outputFileSync('test/light-modules/quux/templates/pages/emptyPage.yaml', '')
    fs.outputFileSync('test/light-modules/quux/templates/pages/noAreaPage.yaml', noAreaPage)
    fs.outputFileSync('test/light-modules/foo/templates/pages/noAreaPage.yaml', noAreaPage)
    fs.outputFileSync('test/light-modules/foo/templates/pages/baz.ftl', '<h1>Hello</h1>')
    fs.outputFileSync('test/light-modules/foo/templates/pages/noAreaPageWithTaggedElement.yaml', noAreaPageWithTaggedElement)
    fs.outputFileSync('test/light-modules/foo/templates/pages/pageWithAreas.yaml', pageWithAreas)
    // also make dirs expected when validating module structure
    fs.mkdirsSync('test/light-modules/foo/templates/components')
    fs.mkdirsSync('test/light-modules/quux/templates/components')
    fs.mkdirsSync('test/light-modules/foo/dialogs/components')
    fs.mkdirsSync('test/light-modules/quux/dialogs/components')
  })

  afterEach(function () {
    fs.removeSync('test/light-modules')
  })

  it('should create missing YAML entries and add availability', function (done) {
    invokeAndVerify('add-availability',
      'text noAreaPage@fooArea -p  test/light-modules/foo',
      '/foo/templates/pages/noAreaPage.yaml',
      function (data) {
        expect(data).to.be.equal(
          'class: info.magnolia.templating.definition.PageTemplateDefinition\n' +
          'templateScript: /foo/templates/pages/baz.ftl\n' +
          'areas:\n' +
          '  fooArea:\n' +
          '    availableComponents:\n' +
          '      text:\n' +
          '        id: foo:components/text\n')
        done()
      })
  })

  it('should create missing YAML entries and add availability for a component with an id containing the dash character', function (done) {
    invokeAndVerify('add-availability',
      'qux-bar:components/text noAreaPage@fooArea -p  test/light-modules/foo',
      '/foo/templates/pages/noAreaPage.yaml',
      function (data) {
        expect(data).to.be.equal(
          'class: info.magnolia.templating.definition.PageTemplateDefinition\n' +
          'templateScript: /foo/templates/pages/baz.ftl\n' +
          'areas:\n' +
          '  fooArea:\n' +
          '    availableComponents:\n' +
          '      text:\n' +
          '        id: qux-bar:components/text\n')
        done()
      })
  })

  it('should create missing YAML entries and add availability for a default light module', function (done) {
    invokeAndVerify('add-availability',
      'text noAreaPage@fooArea -p test/light-modules/quux',
      '/quux/templates/pages/noAreaPage.yaml',
      function (data) {
        expect(data).to.be.equal(
          'class: info.magnolia.templating.definition.PageTemplateDefinition\n' +
          'templateScript: /foo/templates/pages/baz.ftl\n' +
          'areas:\n' +
          '  fooArea:\n' +
          '    availableComponents:\n' +
          '      text:\n' +
          '        id: quux:components/text\n')
        done()
      })
  })

  it('should create missing YAML entries and add availability despite custom tags', function (done) {
    invokeAndVerify('add-availability',
      'text noAreaPageWithTaggedElement@fooArea -p test/light-modules/foo',
      '/foo/templates/pages/noAreaPageWithTaggedElement.yaml',
      function (data) {
        expect(data).to.be.equal(
          'class: info.magnolia.templating.definition.PageTemplateDefinition\n' +
          "includedFile: !include 'foo/bar'\n" +
          'templateScript: /foo/templates/pages/baz.ftl\n' +
          'areas:\n' +
          '  fooArea:\n' +
          '    availableComponents:\n' +
          '      text:\n' +
          '        id: foo:components/text\n')
        done()
      }
    )
  })

  it('should add component availability to existing area', function (done) {
    invokeAndVerify('add-availability',
      'text pageWithAreas@fooArea -p test/light-modules/foo',
      '/foo/templates/pages/pageWithAreas.yaml',
      function (data) {
        expect(data).to.be.equal(
          'class: info.magnolia.templating.definition.PageTemplateDefinition\n' +
          'templateScript: /foo/templates/pages/baz.ftl\n' +
          'areas:\n' +
          '  fooArea:\n' +
          '    templateScript: /foo/templates/pages/baz.ftl\n' +
          '    availableComponents:\n' +
          '      text:\n' +
          '        id: foo:components/text\n')
        done()
      }
    )
  })

  it('should create missing YAML entries and add autogeneration', function (done) {
    invokeAndVerify('add-availability',
      'text noAreaPage@main -p test/light-modules/foo -g',
      '/foo/templates/pages/noAreaPage.yaml',
      function (data) {
        expect(data).to.be.equal(
          'class: info.magnolia.templating.definition.PageTemplateDefinition\n' +
          'templateScript: /foo/templates/pages/baz.ftl\n' +
          'areas:\n' +
          '  main:\n' +
          '    autoGeneration:\n' +
          '      generatorClass: info.magnolia.rendering.generator.CopyGenerator\n' +
          '      content:\n' +
          '        text:\n' +
          '          nodeType: mgnl:component\n' +
          '          templateId: foo:components/text\n')
        done()
      }
    )
  })

  it('should create missing YAML entries and add availability from inside a light module without passing a path option', function (done) {
    shell.cd('test/light-modules/foo')
    invokeAndVerify('add-availability',
      'text noAreaPage@fooArea',
      '/templates/pages/noAreaPage.yaml',
      function (data) {
        expect(data).to.be.equal(
          'class: info.magnolia.templating.definition.PageTemplateDefinition\n' +
          'templateScript: /foo/templates/pages/baz.ftl\n' +
          'areas:\n' +
          '  fooArea:\n' +
          '    availableComponents:\n' +
          '      text:\n' +
          '        id: foo:components/text\n')
        done()
      }, process.cwd())
    shell.cd('../../../')
  })

  it('should create missing YAML entries and add availability when run from parent folder of light module', function (done) {
    shell.cd('test/light-modules/')
    invokeAndVerify('add-availability',
      'text noAreaPage@fooArea -p foo/',
      '/templates/pages/noAreaPage.yaml',
      function (data) {
        expect(data).to.be.equal(
          'class: info.magnolia.templating.definition.PageTemplateDefinition\n' +
          'templateScript: /foo/templates/pages/baz.ftl\n' +
          'areas:\n' +
          '  fooArea:\n' +
          '    availableComponents:\n' +
          '      text:\n' +
          '        id: foo:components/text\n')
        done()
      }, path.join(process.cwd(), 'foo'))
    shell.cd('../../')
  })

  it('should add area to template script if not yet added', function (done) {
    invokeAndVerify('add-availability',
      'text noAreaPage@fooArea -p test/light-modules/foo',
      '/foo/templates/pages/baz.ftl',
      function (data) {
        expect(data).to.contain('[@cms.area name="fooArea"/]')
        done()
      }
    )
  })

  it('should not add area to template script if already added', function (done) {
    invokeAndVerify('add-availability',
      'text pageWithAreas@fooArea -p test/light-modules/foo',
      '/foo/templates/pages/baz.ftl',
      function (data) {
        expect(data).to.not.contain('[@cms.area name="fooArea"/]')
        done()
      }
    )
  })

  it('should default to [main] area if none was specified', function (done) {
    invokeAndVerify('add-availability',
      'text noAreaPage -p test/light-modules/foo',
      '/foo/templates/pages/baz.ftl',
      function (data) {
        expect(data).to.contain('[@cms.area name="main"/]')
        done()
      }
    )
  })

  it('should fail with less than two args', function () {
    const result = testHelper.invokeMgnlSubcommand('add-availability', 'text')
    expect(result.stderr.toString()).not.to.be.empty
  })

  it('should fail if path is non existent', function () {
    const result = testHelper.invokeMgnlSubcommand('add-availability', 'components/text noAreaPage@main -p baz/bar')
    expect(result.stderr.toString()).not.to.be.empty
  })

  it('should fail if area argument is malformed', function () {
    const result = testHelper.invokeMgnlSubcommand('add-availability', 'text noAreaPage@ -p test/light-modules/foo')
    expect(result.stderr.toString()).not.to.be.empty
  })

  it('should fail if light module is not a valid one', function () {
    fs.mkdirsSync('test/light-modules/bogus/meh')
    const result = testHelper.invokeMgnlSubcommand('add-availability', 'text noAreaPage@main -p test/light-modules/bogus')
    expect(result.stderr.toString()).not.to.be.empty
  })

  it('should fail gracefully if page is empty', function () {
    const result = testHelper.invokeMgnlSubcommand('add-availability', 'text emptyPage -p test/light-modules/quux')
    expect(result.stderr.toString()).to.contain('page definition seems to be empty')
  })
})
