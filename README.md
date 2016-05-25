# Magnolia Light Development CLI tool #

[![Build Status](https://jenkins.magnolia-cms.com/job/build_npm-cli/badge/icon)](https://jenkins.magnolia-cms.com/job/build_npm-cli/)

An npm package providing a CLI tool to setup and facilitate light development with Magnolia

## Installation ##
Before installation make sure you have [Node.js](https://nodejs.org) installed (recommended v 5.8.0+)

Install the package **globally**

`npm install magnolia-cli -g`

or build it with `npm pack` and then install it from locale source e.g.

`npm install /path/to/source/magnolia-cli-1.0.0.tgz -g` (not working yet, instead use one from Magnolia npm repository:
`npm --registry=https://npm.magnolia-cms.com/repository/npm install @magnolia/cli -g`)


## Usage ##
A) To create light module:
In your working directory do `mgnl create-light-module <light-module-name>`
Navigate to just created folder for your new light module na and continue with commands e.g. `mgnl create-page <page-tempalte-name>`
Or use `path` parameter `mgnl create-page <page-tempalte-name> -p <light-module-name>`

B) To download and setup Magnolia + create light module:
Start with `mgnl setup`, in your <workingDirectory> (recommend empty folder), which will expose you package.json file with basic configuration where you may change stuff like 'lightModuleName', folder structure of light module and much more.
Then do `mgnl jumpstart` which will download and extract Magnolia and automatically does also mgln create-light-module.
Then you can continue using commands for creating pages and components e.g. `mgnl create-page <page-tempalte-name>`


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


## Bash autocompletion ##
The package also provides a basic autocompletion feature for Bash shells. To enable it, add this to your ```.profile ```
```
source /usr/local/lib/node_modules/@magnolia/cli/extra/mgnl-autocompletion.sh
```


## Example ##
TODO
