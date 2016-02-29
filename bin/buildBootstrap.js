#! /usr/bin/env node

var watch = require('watch');
var path = require('path');
var less = require('less');
var fs   = require('fs');

var packageJson = require('../package.json');

exports.buildLess = function() {
	var folderToWatch = path.normalize(packageJson.config.outputPath + "/"+ packageJson.lightModuleName + packageJson.lightDevFoldersInModule.cssWatch);
	var buildedCss = path.normalize(packageJson.config.outputPath + "/"+ packageJson.lightModuleName + packageJson.lightDevFoldersInModule.css + "/bootstrap.css");
  	var src = folderToWatch+"/bootstrap.less";
    less.render(fs.readFileSync(src).toString(), {
        filename: path.resolve(src), // <- here we go
    }, function(e, output) {
        fs.writeFile(buildedCss, output.css, 'utf8', function (err) {
		  if (err) throw err;
		  console.log("'"+buildedCss+"' built.");
		});
    });	
};


exports.buildLess();
