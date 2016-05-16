# Magnolia Light Development CLI tool #

[![Build Status](https://jenkins.magnolia-cms.com/job/build_npm-cli/badge/icon)](https://jenkins.magnolia-cms.com/job/build_npm-cli/)

An npm package providing a CLI tool to setup and facilitate light development with Magnolia

## Installation ##
Before installation make sure you have [Node.js](https://nodejs.org) installed

Install the package **globally**

`npm install magnolia-cli -g`

or build it with `npm pack` and then install it from locale source e.g.

`npm install /path/to/source/magnolia-cli-1.0.0.tgz -g`


## Commands ##

The Magnolia CLI uses a syntax similar to that of Git.
To invoke a command you do `mgnl <command> [options]`

To see what commands are available simply enter `mgnl` (or `mgnl -h`)

```
    create-light-module   Creates a light module
    create-page           Creates a page template
    create-component      Creates a component
    add-availability      Adds component availability
    setup                 Extracts prototypes and packge.json of CLI tools so that they can be customized
    jumpstart             Prepares Magnolia CMS for light dev
```

To get help for any of the subcommands, simply enter `mgnl help <subcommand>`. For instance, `mgnl help create-page` will output

```
Usage: mgnl create-page <templateName> [options]

  Creates a page template in a light module.

  Options:

    -h, --help         output usage information
    -V, --version      output the version number
    -p, --path <path>  The path to a light module. If no path is provided, then the current folder is assumed to be a light module and the page will be tentatively created there.
```

## Example ##
TODO
