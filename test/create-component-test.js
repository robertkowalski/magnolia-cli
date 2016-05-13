/* eslint-env mocha */
describe('create-component', function () {
  var fs = require('fs-extra')

  var testHelper = require('./testHelper')
  var invokeAndVerify = testHelper.invokeAndVerify
  var shell = require('shelljs')

  var expect = require('chai').expect

  beforeEach(function () {
    var emptyPage =
    'class: info.magnolia.templating.definition.PageTemplateDefinition\n' +
      'templateScript: /foo/templates/bar/baz.ftl'

    var pageWithAreas =
    'class: info.magnolia.templating.definition.PageTemplateDefinition\n' +
      'templateScript: /foo/templates/bar/baz.ftl\n' +
      'areas:\n' +
      '  fooArea:\n' +
      '    templateScript: /foo/templates/bar/baz.ftl'

    var emptyPageWithTaggedElement =
    'class: info.magnolia.templating.definition.PageTemplateDefinition\n' +
      "includedFile: !include 'foo/bar'\n" +
      'templateScript: /foo/templates/bar/baz.ftl'

    fs.outputFileSync('test/light-modules/quux/templates/pages/emptyPage.yaml', emptyPage)
    fs.outputFileSync('test/light-modules/foo/templates/pages/emptyPage.yaml', emptyPage)
    fs.outputFileSync('test/light-modules/foo/templates/pages/emptyPageWithTaggedElement.yaml', emptyPageWithTaggedElement)
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
    invokeAndVerify('create-component',
      'text -a emptyPage@fooArea -p  test/light-modules/foo',
      '/foo/templates/pages/emptyPage.yaml',
      function (data) {
        expect(data).to.be.equal(
          'class: info.magnolia.templating.definition.PageTemplateDefinition\n' +
          'templateScript: /foo/templates/bar/baz.ftl\n' +
          'areas:\n' +
          '  fooArea:\n' +
          '    availableComponents:\n' +
          '      text:\n' +
          '        id: foo:components/text\n')
        done()
      })
  })

  it('should create dialog definitions and files', function (done) {
    var basedir = invokeAndVerify('create-component',
      'text -p test/light-modules/foo/',
      '/foo/templates/components/text.yaml',
      function (data) {
        expect(data).to.be.equal(
          'title: text\n' +
          'renderType: freemarker\n' +
          'templateScript: /foo/templates/components/text.ftl\n' +
          'dialog: foo:components/text\n')
      })
    expect(fs.existsSync(basedir + '/foo/dialogs/components/text.yaml')).to.be.true
    expect(fs.existsSync(basedir + '/foo/templates/components/text.ftl')).to.be.true
    done()
  })

  it('should build templateScript path correctly regardless of trailing slash in path', function () {
    // with trailing slash
    testHelper.invokeMgnlSubcommand('create-component', 'text -p test/light-modules/foo/')
    testHelper.checkFileContains('/foo/templates/components/text.yaml', ['templateScript: /foo/templates/components/text.ftl'])

    // and without
    testHelper.invokeMgnlSubcommand('create-component', 'text -p test/light-modules/foo')
    testHelper.checkFileContains('/foo/templates/components/text.yaml', ['templateScript: /foo/templates/components/text.ftl'])
  })

  it('should create missing YAML entries and add availability for a default light module', function (done) {
    invokeAndVerify('create-component',
      'text -a emptyPage@fooArea -p test/light-modules/quux',
      '/quux/templates/pages/emptyPage.yaml',
      function (data) {
        expect(data).to.be.equal(
          'class: info.magnolia.templating.definition.PageTemplateDefinition\n' +
          'templateScript: /foo/templates/bar/baz.ftl\n' +
          'areas:\n' +
          '  fooArea:\n' +
          '    availableComponents:\n' +
          '      text:\n' +
          '        id: quux:components/text\n')
        done()
      })
  })

  it('should create missing YAML entries and add autogeneration', function (done) {
    invokeAndVerify('create-component',
      'text -g emptyPage@main -p test/light-modules/foo',
      '/foo/templates/pages/emptyPage.yaml',
      function (data) {
        expect(data).to.be.equal(
          'class: info.magnolia.templating.definition.PageTemplateDefinition\n' +
          'templateScript: /foo/templates/bar/baz.ftl\n' +
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
    invokeAndVerify('create-component',
      'text -a emptyPage@fooArea',
      '/foo/templates/pages/emptyPage.yaml',
      function (data) {
        expect(data).to.be.equal(
          'class: info.magnolia.templating.definition.PageTemplateDefinition\n' +
          'templateScript: /foo/templates/bar/baz.ftl\n' +
          'areas:\n' +
          '  fooArea:\n' +
          '    availableComponents:\n' +
          '      text:\n' +
          '        id: foo:components/text\n')
        done()
      })
    shell.cd('../../../')
  })

  it('should fail with no arg', function () {
    var result = testHelper.invokeMgnlSubcommand('create-component', '')
    expect(result.stderr.toString()).not.to.be.empty
  })

  it('should fail if path is non existent', function () {
    var result = testHelper.invokeMgnlSubcommand('create-component', 'text -a emptyPage@main -p baz/bar')
    expect(result.stderr.toString()).not.to.be.empty
  })

  it('should fail if area argument is malformed', function () {
    var result = testHelper.invokeMgnlSubcommand('create-component', 'text -a emptyPage -p test/light-modules/foo')
    expect(result.stderr.toString()).not.to.be.empty
  })

  it('should fail if light module is not a valid one', function () {
    fs.mkdirsSync('test/light-modules/bogus/meh')
    var result = testHelper.invokeMgnlSubcommand('create-component', 'text -a pages/emptyPage@main -p test/light-modules/bogus')
    expect(result.stderr.toString()).not.to.be.empty
  })

  it('should fail if called with both available and autogenerate options', function () {
    var result = testHelper.invokeMgnlSubcommand('create-component', 'text -a emptyPage@main -g emptyPage@main -p test/light-modules/foo')
    expect(result.stderr.toString()).not.to.be.empty
  })

  it('should fail if component already exists', function () {
    var result = testHelper.invokeMgnlSubcommand('create-component', 'text -p test/light-modules/foo')
    expect(result.stderr.toString()).to.be.empty

    result = testHelper.invokeMgnlSubcommand('create-component', 'text -p test/light-modules/foo')
    expect(result.stderr.toString()).not.to.be.empty
  })
})