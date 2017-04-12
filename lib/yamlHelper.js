'use strict'
const yamlJs = require('yaml-js')
const jsdiff = require('diff')

function create (yamlStream) {
  this.rootYamlNode = yamlJs.compose(yamlStream)
  this.originalYaml = yamlStream

  this.hasNode = function (path) {
    return this.getYamlNodeByPath(path) != null
  }

  this.getYamlNodeByPath = function (path) {
    if (path === '/') {
      return this.rootYamlNode
    }
    const nodeNames = resolveNodeNames(path)
    const length = nodeNames.length
    let node = this.rootYamlNode
    for (let i = 0; i < length && node != null; ++i) {
      node = this.getChildNode(node, nodeNames[i])
    }
    return node
  }

  this.getChildNode = function (parentNode, nodeName) {
    const value = parentNode.value

    if (Array.isArray(value)) {
      const length = value.length
      for (let i = 0; i < length; ++i) {
        const key = value[i][0]
        if (key.value === nodeName) {
          return value[i][1]
        }
      }
    }

    return null
  }

  this.dump = function () {
    return this.dumpYamlNode(this.rootYamlNode)
  }

  this.dumpYamlNode = function (node) {
    const yaml = yamlJs.serialize(node, null, null, {
      default_style: false,
      default_flow_style: false
    })
    let diff = jsdiff.createPatch('yaml', this.originalYaml, yaml, 'old', 'new')
    // Put back comments (beginning with #)
    // See the bloody little whitespace, before the capture groups? Well, do NOT remove it or patch won't work!
    diff = diff.replace(/(-)(\s*#)/gm, ' $2')
    // and empty lines erased by yaml parser
    diff = diff.replace(/(-)(\s*\n|\r)/gm, ' $2')
    // FIXME try to find something better, if possible, than this workaround.
    // Problem is in some cases you may end up with a patch diff hunk like this @@ -11,4 +10,6 @@
    // which will result in a wrong patch apply and a borked definition file.
    // This workaround ensures diff hunks start always from the same line (capture group 4 replaces group 2)
    diff = diff.replace(/(@@\s+-)(\d+)(,\d+\s+\+)(\d+)(,\d+\s+@@)/gm, '$1$4$3$4$5')

    return jsdiff.applyPatch(this.originalYaml, diff)
  }

  this.injectSnippetAt = function (data, path) {
    let nodeNames = resolveNodeNames(path)

    if (nodeNames.length === 0) {
      return injectYamlData(this.rootYamlNode, data)
    } else {
      let yamlNode = this.rootYamlNode
      let hostYamlNode = this.rootYamlNode
      while ((yamlNode = this.getChildNode(hostYamlNode, nodeNames[0])) != null) {
        nodeNames = nodeNames.slice(1)
        hostYamlNode = yamlNode
      }

      injectYamlData(hostYamlNode, constructMissingDataNodes(data, nodeNames))
    }
  }

  function resolveNodeNames (path) {
    if (path === undefined || path === null) {
      return []
    }

    if (path.charAt(0) === '/') {
      path = path.substr(1)
    }

    return path.split('/')
  }

  function constructMissingDataNodes (data, nodeNames) {
    nodeNames.reverse().forEach((nodeName) => {
      const wrapper = {}
      wrapper[nodeName] = data
      data = wrapper
    })

    return data
  }

  function injectYamlData (hostNode, data) {
    const yamlDump = yamlJs.dump(data, null, null, {
      default_style: false,
      default_flow_style: false
    })
    const injectedNodeGraph = yamlJs.compose(yamlDump)

    hostNode.value.push(injectedNodeGraph.value[0])
  }

  return this
}

this.getScalarValue = function (scalarPropertyPath) {
  const pathMatcher = /^(.*)\/(.+?)$/.exec(scalarPropertyPath)

  const scalarName = pathMatcher[2]
  const parentPath = pathMatcher[1]
  const parentNode = this.getYamlNodeByPath(parentPath || '/')

  if (parentNode != null) {
    return this.getChildNode(parentNode, scalarName).value
  }

  return null
}

exports.create = create
