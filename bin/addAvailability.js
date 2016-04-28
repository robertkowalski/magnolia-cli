#! /usr/bin/env node

var path = require('path');
var fs = require('fs');
var yaml = require('./yamlHelper');
var packageJson = require('../package.json');

/**
 * Command should look like: 'add-availability <component_ID> --available@<page_ID>@<area_name>'.
 */
function addAvailability(args, callback) {
    if (!args.isValid) {
        console.log("ERROR: ","componentId or availabilityPattern is missing or not specified correctly...");
    }

    if (!fs.existsSync(args.templateDefinitionFilePath)) {
        console.log("'" + args.templateDefinitionFilePath + "' page definition doesn't exist");
    } else {
        //page definition exists...
        fs.readFile(args.templateDefinitionFilePath, 'utf-8', function (err, data) {
            if (err) throw err;
            modifyYamlConfiguration(yaml.create(data), args, callback);
        });
    }
}

function modifyYamlConfiguration(yaml, args, callback) {
    if (!yaml.hasNode("/areas/" + args.targetArea)) {
        var templateScript = yaml.getScalarValue('/templateScript');
        fs.appendFile(path.normalize(packageJson.config.outputPath + templateScript), '\n\n[@cms.area name="' + args.targetArea + '"/]', rethrowOnError);
        console.log("DONE: ","New area '" + args.targetArea + "' at the end of '" + args.templateDefinitionFilePath + "'");
    }
    
    if (args.isAvailability ? injectComponentAvailability(yaml, args) : injectAutoGeneration(yaml, args)) {
        fs.writeFile(args.templateDefinitionFilePath, yaml.dump(), 'utf-8', function (err) {
            callback(err);
        });
    }
}

function injectComponentAvailability(yamlHelper, args) {
    var availableComponentsPath = '/areas/' + args.targetArea + '/availableComponents';

    if (!yamlHelper.hasNode(availableComponentsPath + '/' + args.component.name)) {
        var componentAvailability = {};
        componentAvailability[args.component.name] = {id: args.component.refId};

        yamlHelper.injectSnippetAt(componentAvailability, availableComponentsPath);
        console.log("DONE: ","Availability for '" + args.component.refId + "' added into '" + args.templateDefinitionFilePath + "'");
        return true;
    }

    return false;
}

function injectAutoGeneration(yamlHelper, args) {
    var areaAutoGenerationPath = '/areas/' + args.targetArea + '/autoGeneration';
    if (!yamlHelper.hasNode(areaAutoGenerationPath)) {
        var autoGeneration = {
            generatorClass: "info.magnolia.rendering.generator.CopyGenerator",
            content: {}
        };

        autoGeneration.content[args.component.name] = {
            nodeType: "mgnl:component",
            templateId: args.component.refId
        };

        yamlHelper.injectSnippetAt(autoGeneration, areaAutoGenerationPath);

        console.log("DONE: ","Autogenerate for '" + args.component.refId + "' added into '" + args.templateDefinitionFilePath + "'");
        return true;
    } else {
        console.log("INFO: autogeneration is already configured");
    }

    return false;
}

function rethrowOnError(err) {
    if (err) throw err;
}

if (process.argv[1].indexOf('add-availability') > -1) {
    addAvailability(require('./argumentParser').parseArguments(process.argv.slice(2)));
}

module.exports = {
    addAvailability
};















