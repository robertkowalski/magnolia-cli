/* eslint-env mocha */
describe('yamlHelper', function () {
  const yamlHelper = require('../lib/yamlHelper')
  const expect = require('chai').expect

  it('should support Magnolia-specific !include directive', function () {
    var data =
    `form:
      label: Example page properties
      tabs:
        - name: tabText
          label: Texts and categories
          fields:
            - name: title
              class: info.magnolia.ui.form.field.definition.TextFieldDefinition
              label: Title and categories
              i18n: true
            # an include within a list, here adding a field
            - !include /documentation-examples-templates/dialogs/common/categorization-field.yaml
      # an include within a map, here adding a tab
      actions: !include /documentation-examples-templates/dialogs/common/actions-block.yaml`

    expect(function () {
      yamlHelper.create(data)
      yamlHelper.dump()
    }).to.not.throw(Error)

    data = '!include /foo/bar.yaml'
    expect(function () {
      yamlHelper.create(data)
      yamlHelper.dump()
    }).to.not.throw(Error)
  })

  it('should not remove YAML comments and empty lines', function () {
    const data =
    '#some comment\n' +
    '\n' + // and some new empty lines
    'class: info.magnolia.templating.definition.PageTemplateDefinition\n' +
    '  \n' +
    '# another lidl comment because we can\n' +
      'templateScript: /foo/templates/pages/baz.ftl\n' +
      'areas:\n' +
      '  fooArea:\n' +
      '    # indented multiline comment which \n' +
      '    # spans at least two lines\n' +
      '    templateScript: /foo/templates/pages/baz.ftl'

    yamlHelper.create(data)
    var componentAvailability = {}
    componentAvailability['comp'] = {id: 'quux:components/comp'}
    yamlHelper.injectSnippetAt(componentAvailability, '/areas/fooArea/availableComponents')

    expect(yamlHelper.dump()).to.be.equal(
        '#some comment\n' +
        '\n' +
        'class: info.magnolia.templating.definition.PageTemplateDefinition\n' +
        '  \n' +
        '# another lidl comment because we can\n' +
          'templateScript: /foo/templates/pages/baz.ftl\n' +
          'areas:\n' +
          '  fooArea:\n' +
          '    # indented multiline comment which \n' +
          '    # spans at least two lines\n' +
          '    templateScript: /foo/templates/pages/baz.ftl\n' +
          '    availableComponents:\n' +
          '      comp:\n' +
          '        id: quux:components/comp\n')
  })

  it('should append components correctly when having spaces or comments and more than one area', function () {
    const data =
      'title: hello\n' +
      'templateScript: /foo/templates/pages/baz.ftl\n' +
      '  \n' +
      'areas:\n' +
      '  fooArea:\n' +
      '    availableComponents:\n' +
      '      baz:\n' +
      '        id: foo:components/baz\n' +
      '      meh:\n' +
      '        id: foo:components/meh\n' +
      '  bazArea:\n' +
      '    availableComponents:\n' +
      '      qux:\n' +
      '        id: foo:components/qux\n'

    yamlHelper.create(data)
    var componentAvailability = {}
    componentAvailability['comp'] = {id: 'foo:components/comp'}
    yamlHelper.injectSnippetAt(componentAvailability, '/areas/bazArea/availableComponents')

    expect(yamlHelper.dump()).to.be.equal(
      'title: hello\n' +
      'templateScript: /foo/templates/pages/baz.ftl\n' +
      '  \n' +
      'areas:\n' +
      '  fooArea:\n' +
      '    availableComponents:\n' +
      '      baz:\n' +
      '        id: foo:components/baz\n' +
      '      meh:\n' +
      '        id: foo:components/meh\n' +
      '  bazArea:\n' +
      '    availableComponents:\n' +
      '      qux:\n' +
      '        id: foo:components/qux\n' +
      '      comp:\n' +
      '        id: foo:components/comp\n')
  })
})
