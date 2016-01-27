#!/usr/bin/env node
/**
 * This file Copyright (c) 2015 Magnolia International
 * Ltd.  (http://www.magnolia-cms.com). All rights reserved.
 *
 *
 * This file is dual-licensed under both the Magnolia
 * Network Agreement and the GNU General Public License.
 * You may elect to use one or the other of these licenses.
 *
 * This file is distributed in the hope that it will be
 * useful, but AS-IS and WITHOUT ANY WARRANTY; without even the
 * implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE, TITLE, or NONINFRINGEMENT.
 * Redistribution, except as permitted by whichever of the GPL
 * or MNA you select, is prohibited.
 *
 * 1. For the GPL license (GPL), you can redistribute and/or
 * modify this file under the terms of the GNU General
 * Public License, Version 3, as published by the Free Software
 * Foundation.  You should have received a copy of the GNU
 * General Public License, Version 3 along with this program;
 * if not, write to the Free Software Foundation, Inc., 51
 * Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * 2. For the Magnolia Network Agreement (MNA), this file
 * and the accompanying materials are made available under the
 * terms of the MNA which accompanies this distribution, and
 * is available at http://www.magnolia-cms.com/mna.html
 *
 * Any modifications to this file must keep this entire header
 * intact.
 *
 */

// libraries import
fs = require('fs-extra');
path = require('path');

/**
 * Class that builds (=copies light modules from node_modules) to specified location.
 */
var LightModuleBuilder = (function () {

    var that;

    // constructor
    function LightModuleBuilder(module, outputPath, sourcePath) {
        this._module = module;
        this._outputPath = outputPath;
        this._sourcePath = sourcePath;
        that = this;
    }

    /**
     * Method for checking whether passed path is a directory or not.
     */
    LightModuleBuilder.prototype.isDirectory = function (filepath) {
        return fs.statSync(path.join(that._sourcePath, filepath)).isDirectory();
    };

    /**
     * Method for checking whether passed module is Magnolia ligt module or not.
     */
    LightModuleBuilder.prototype.isLightModule = function (modulePath) {
        var moduleFullPath = path.join(that._sourcePath, modulePath);
        if (fs.readdirSync(moduleFullPath).indexOf('package.json') > -1) {
            var json = JSON.parse(fs.readFileSync(path.join(moduleFullPath, 'package.json'), 'utf8'));
            if (json.keywords) {
                return json.keywords.indexOf('magnolia-light-module') > -1;
            }
        }
        return false;
    };

    /**
     * Reads and filters Magnolia light modules from source path.
     */
    LightModuleBuilder.prototype.getLightModules = function () {
        return fs.readdirSync(that._sourcePath).filter(that.isDirectory).filter(that.isLightModule);
    };

    /**
     * Builds Magnolia light modules and copies them into specified directory.
     */
    LightModuleBuilder.prototype.build = function () {
        var lightModules = that.getLightModules();
        if (lightModules.length < 1) {
          console.log("No Magnolia light modules found.");
          return;
        }
        console.log('Following Magnolia light modules were found [' + lightModules + '] and will be extracted to \'' + that._outputPath + '\' directory:');

        lightModules.forEach(function (lightModule) {
            var source = path.join(that._sourcePath, lightModule);
            var destination = path.join(that._outputPath, lightModule);
            if (fs.statSync(source).isDirectory()) {
                fs.copy(source, destination, function (error) {
                    if (error) {
                        return console.error('Error occured while extracting light module [' + lightModule + '].', error);
                    } else {
                        return console.log('Light module [' + lightModule + '] was extracted to [' + path.join(that._outputPath, lightModule) + '].');
                    }
                });
            }
        });
    };

    return LightModuleBuilder;
})();

// source path where to search for light modules
var sourcePath = 'node_modules';
// get output path from the input parameters
var outputPath = '';
if (process.env.npm_package_config_outputPath !== undefined && fs.statSync(process.env.npm_package_config_outputPath).isDirectory()) {
    outputPath = process.env.npm_package_config_outputPath;
} else {
    console.log('Output path is not specified or doesn\'t exist. Default folder [light-modules] will be used.');
    outputPath = 'light-modules';
}

var builder = new LightModuleBuilder(module, outputPath, sourcePath);
builder.build();