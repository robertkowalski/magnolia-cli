# Magnolia Light Development CLI tool #

[![Build Status](https://jenkins.magnolia-cms.com/job/build_npm-cli/badge/icon)](https://jenkins.magnolia-cms.com/job/build_npm-cli/)

An npm package providing a CLI tool to setup and facilitate [Light development with Magnolia](https://documentation.magnolia-cms.com/display/DOCS/Light+development+in+Magnolia).   
For a complete reference of the npm-cli please have a look at [Magnolia npm-cli documentation](https://documentation.magnolia-cms.com/display/DOCS/Magnolia+npm-cli).


## Installation ##
Before installation make sure you have [Node.js](https://nodejs.org) installed (recommended v 4.4.7+)

Install the package **globally**

#### Magnolia CLI is currently BETA ####
To install it, you need to specify the `@beta` tag like in the following snippet

`npm --registry=https://npm.magnolia-cms.com/repository/npm install @magnolia/cli@beta -g`

Omitting the `@beta` tag will install the *latest* version which, as long as `Magnolia cli` is not released as final, corresponds to the latest development snapshot.

`npm --registry=https://npm.magnolia-cms.com/repository/npm install @magnolia/cli -g`

Alternatively you can checkout the latest code, build it with `npm pack` and finally install it from locale source e.g.

`npm install /path/to/source/magnolia-cli-0.0.1.tgz -g`



## Commands ##
To invoke a command, execute `mgnl <command> [options]` on your shell.      

To see what commands are available simply enter `mgnl` or `mgnl -h`   

```

    add-availability      add component availability
    build                 scan a node_modules folder for Magnola light modules and extract them to a directory of choice
    create-component      create a component and optionally add availability for it
    create-light-module   create a light module
    create-page           create a page template
    jumpstart             prepare Magnolia CMS for light dev
    setup                 extract prototypes and package.json of CLI tools so that they can be customized
    help [cmd]            display help for [cmd]

```

To get help for any of the subcommands, simply enter `mgnl <subcommand> -h`.   

E.g. `mgnl create-light-module -h` will output:   

```
  Usage: mgnl-create-light-module <moduleName> [options]

  Creates a light module. Light modules are created under a 'root' folder which is observed by Magnolia for changes. The path to such folder is the value of 'magnolia.resources.dir' property at <magnoliaWebapp>/WEB-INF/config/default/magnolia.properties.

  Options:

    -h, --help         output usage information
    -V, --version      output the version number
    -p, --path <path>  The path to the light modules root folder. If no path is provided, then the current directory is assumed to be the light modules root folder and the module will be created here.   
```


## Bash autocompletion ##
The package provides a basic autocompletion feature for Bash shells. To enable it, add the following line to your ```.profile ``` (this may vary according to your OS and Node.js settings):   

Mac OS X
```
source /usr/local/lib/node_modules/@magnolia/cli/extra/mgnl-autocompletion.sh
```
Ubuntu
```
source /usr/lib/node_modules/@magnolia/cli/extra/mgnl-autocompletion.sh
```
