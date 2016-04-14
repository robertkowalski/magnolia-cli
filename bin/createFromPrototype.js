#! /usr/bin/env node

var path = require('path');
var fs = require('fs');
var fse = require('fs.extra');

var packageJson = require('../package.json');

var prototypesFolder = "./_prototypes";

var createFromPrototype = function(prototype,newFile,replace) {
	prototype = path.normalize(prototypesFolder+prototype);
	newFile = path.normalize(newFile);
	
	if(fs.existsSync(prototype)) {
		fse.copy(prototype, newFile, function (err) {
			if (err) {
			    throw err;
			}
			if(replace){
				fs.readFile(newFile, 'utf-8', function (err, data) {
			  	if (err) throw err;
			  	var newValue = data;
			  	Object.keys(replace).forEach(function(change) {
				  	var replaceString = new RegExp(change, 'g');
			  		newValue = newValue.replace( replaceString, replace[change]);
			  	});
			  	if(newValue) {
				  	fs.writeFile(newFile, newValue, 'utf-8', function (err, data) {
				  		if (err) throw err;
				  	});
			  	}
			});
			console.log("DONE: ","'"+newFile+"' created");

			}
		});
	} else {
		console.log("ERROR: ","'"+prototype+"' doesn't exists");
	}
};


var exports = module.exports = {
	createFromPrototype
};
