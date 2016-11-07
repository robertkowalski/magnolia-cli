/* eslint-env mocha */
describe('yamlHelper', function () {
  var yamlHelper = require('../bin/yamlHelper')

  var expect = require('chai').expect

  it('should support Magnolia-specific !include directive', function () {
    var data = `
    form:
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
      actions: !include /documentation-examples-templates/dialogs/common/actions-block.yaml
      `
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
})
