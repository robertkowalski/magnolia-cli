#! /usr/bin/env node

var watch = require('watch');
var path = require('path');
var less = require('less');
var fs   = require('fs');

global.__base = __dirname + '/';
var buildBootstrap = require(__base + 'buildBootstrap');

var packageJson = require('../package.json');
var folderToWatch = path.normalize(packageJson.config.outputPath + "/"+ packageJson.lightModuleName + packageJson.lightDevFoldersInModule.cssWatch);
var buildedCss = path.normalize(packageJson.config.outputPath + "/"+ packageJson.lightModuleName + packageJson.lightDevFoldersInModule.css + "/bootstrap.css");

watch.watchTree(folderToWatch, function (f, curr, prev) {
    if (typeof f == "object" && prev === null && curr === null) {
	    buildBootstrap.buildLess();
      console.log("DONE ","'"+folderToWatch+"' is now watched for changes");
    } else if (prev === null) {
    	console.log("WATCH: ","New file in '"+folderToWatch+"'.");
      buildBootstrap.buildLess();
    } else if (curr.nlink === 0) {
    	console.log("WATCH: ","Some file was removed in '"+folderToWatch+"'.");
      buildBootstrap.buildLess();
    } else {
    	console.log("WATCH: ","File changed in '"+folderToWatch+"'.");
      buildBootstrap.buildLess();
    }
})
