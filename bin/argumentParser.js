#! /usr/bin/env node

var packageJson  = require('../package.json');
var path = require('path');

var WRONG_COMPONENT_MODIFICATION_ARG = "something wrong with action arguments, should look like '--available@" + packageJson.lightModuleName + ":pages/myHome@main'";

var parseArguments = function(argv) {
    var args = {isValid: false};

    if (argv.length != 2) {
        console.log('Incorrect amount of arguments, expected 2, but got ' + argv.length);
        return args;
    }

    args.component = parseDefinitionReference(argv[0]);

    // verify correctness of action
    var actionMatcher = /^\-\-(available|autogenerate)@([\w\/:]+)@(\w+)$/.exec(argv[1]);

    if (!actionMatcher) {
        console.log(WRONG_COMPONENT_MODIFICATION_ARG);
        return args;
    }

    args.isAvailability = actionMatcher[1] == 'available';
    args.isAutoGeneration = actionMatcher[1] == 'autogenerate';
    args.targetPage = parseDefinitionReference(actionMatcher[2]);
    args.targetArea = actionMatcher[3];
    args.templateDefinitionFilePath = path.normalize(packageJson.config.outputPath + "/" + args.targetPage.module + "/templates/" + args.targetPage.path + ".yaml");
    args.isValid = true;

    return args;
};

function parseDefinitionReference(definitionId) {
    // parse definition reference string, expect it to be in a form of [<module>:][<relative_path>/]<name>
    var refIdMatcher = /^(?:(\w+):)?([\w\/]+\/)?(\w+)$/.exec(definitionId);
    if (refIdMatcher) {
        // if 'module' is not provided - use the pre-configured light-module name 
        var module = refIdMatcher[1] ? refIdMatcher[1] : packageJson.lightModuleName;
        // if no slashes occur in the path/name string - assume path to be equal to the name 
        var path = refIdMatcher[2] ? refIdMatcher[2] + refIdMatcher[3] : refIdMatcher[3];
        return {
            module: module,
            path: path,
            name: refIdMatcher[3],
            refId: module + ':' + path
        }
    }
} 

module.exports = {
    parseArguments
};

