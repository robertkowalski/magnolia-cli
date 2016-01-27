#! /usr/bin/env node

var watch = require('watch');
var path = require('path');
var less = require('less');
var fs   = require('fs');

global.__base = __dirname + '/';
var buildBootstrap = require(__base + 'buildBootstrap');

var packageJson = require('../package.json');
var folderToWatch = path.normalize(packageJson.lightDevResourcesFolder + packageJson.lightDevModuleFolder + packageJson.lightDevFoldersInModule.cssWatch);
var buildedCss = path.normalize(packageJson.lightDevResourcesFolder + packageJson.lightDevModuleFolder + packageJson.lightDevFoldersInModule.css + "/bootstrap.css");

watch.watchTree(folderToWatch, function (f, curr, prev) {
    if (typeof f == "object" && prev === null && curr === null) {
	    buildBootstrap.buildLess();
      	console.log("'"+folderToWatch+"' is now watched for changes");
    } else if (prev === null) {
    	console.log("New file in '"+folderToWatch+"' detected.");
		buildBootstrap.buildLess();
    } else if (curr.nlink === 0) {
    	console.log("Some file was removed in '"+folderToWatch+"' detected.");
		buildBootstrap.buildLess();
    } else {
    	console.log("File changed in '"+folderToWatch+"' detected.");
		buildBootstrap.buildLess();
    }
})
