#! /usr/bin/env node

var path = require('path');
var fs = require('fs');
var YAML = require('yamljs');
var JYAML = require('json2yaml');

var packageJson = require('../package.json');

var userArgs = process.argv.slice(2);
var componentId = userArgs[0];
var availabilityPatern = userArgs[1];

/*
	Command should looks like: 'addAvailability <component_ID> available@<page_ID>@<area_name>'.
	Target area has to exists in page definition, however "availableComponents' in that area will be created by script if doesn't exists.
*/
function addAvailability() {

    if (availabilityPatern && componentId) {
        var componentPath = componentId.split(":");
        if (componentPath.length != 2) {
            console.log("something wrong with componentId, should looks like '" + packageJson.lightModuleName + ":components/myLink'");
        } else {
            //componentId is ok, continue with availabilityPaternjavascript
            var availabilityPath = availabilityPatern.split("@");
            if (availabilityPath.length != 3) {
                //failed on wrong availabilityPath
                console.log("something wrong with componentId, should looks like 'available@" + packageJson.lightModuleName + ":pages/myHome@main'");
            } else if ((availabilityPath[0] != "available") && (availabilityPath[0] != "autogenerate")) {
                //failed on availabilityPath doesn't begin with 'available'
                console.log("something wrong with componentId, should looks like 'available@" + packageJson.lightModuleName + ":pages/myHome@main'");
            } else if (availabilityPath[1].indexOf(":") == -1) {
                //failed on wrong with componentId
                console.log("something wrong with componentId, should looks like 'available@" + packageJson.lightModuleName + ":pages/myHome@main'");
            } else {
                //availabilityPatern is fine...
                var targetArea = availabilityPath[2];

                var pagePath = availabilityPath[1].split(":");
                if (pagePath.length != 2) {
                    //something wrong with pageId
                } else {
                    var templateDefinitionFile = packageJson.config.outputPath + "/" + pagePath[0] + "/templates/" + pagePath[1] + ".yaml";

                    templateDefinitionFile = path.normalize(templateDefinitionFile);
                    if (!fs.existsSync(templateDefinitionFile)) {
                        console.log("'" + templateDefinitionFile + "' page definition doesn't exist");
                    } else {
                        //page definition exists...
                        fs.readFile(templateDefinitionFile, 'utf-8', function (err, data) {
                            if (err) throw err;
                            var yamlData = data;
                            var modified = false;

                            jsonData = YAML.parse(yamlData);

                            if (!jsonData.areas) {
                                jsonData["areas"] = {};
                            }

                            if (!(targetArea in jsonData.areas)) {
                                jsonData.areas[targetArea] = {};
                                fs.appendFile(path.normalize(packageJson.config.outputPath + jsonData.templateScript), '\n\n[@cms.area name="' + targetArea + '"/]', function (err) {
                                    if (err) throw err;
                                });
                                console.log("new area '" + targetArea + "' added  in to '" + templateDefinitionFile + "'");
                            }

                            var replaceString = new RegExp(':|/', 'g');
                            var componentIdString = componentId.replace(replaceString, "-");

                            if (availabilityPath[0] == "available") {
                                var jsonArea = jsonData.areas[targetArea];
                                jsonArea = {
                                    "type": "list"
                                };

                                if (!("availableComponents" in jsonData.areas[targetArea])) {
                                    jsonData.areas[targetArea].availableComponents = {};
                                }
                                var jsonAC = jsonData.areas[targetArea].availableComponents;

                                if (!(componentIdString in jsonAC) && (jsonAC[componentIdString] = {})) {
                                    var jsonCom = jsonAC[componentIdString];
                                    jsonCom['id'] = componentId;
                                }
                                console.log("availability added");
                                modified = true;

                            } else if (availabilityPath[0] == "autogenerate") {

                                //TODO: so far it rewrites targetArea completely...

                                jsonData.areas[targetArea] = {
                                    "type": "single",
                                    "renderType": "freemarker"
                                };
                                jsonData.areas[targetArea].autoGeneration = {
                                    "generatorClass": "info.magnolia.rendering.generator.CopyGenerator"
                                };
                                jsonData.areas[targetArea].autoGeneration.content = {};
                                jsonData.areas[targetArea].autoGeneration.content[componentIdString] = {
                                    "nodeType": "mgnl:component",
                                    "templateId": componentId
                                };

                                console.log("autogenerated added");
                                modified = true;
                            }

                            if (modified === true) {

                                jsonDataString = JSON.stringify(jsonData);
                                newJsonData = JSON.parse(jsonDataString);
                                newyaml = JYAML.stringify(newJsonData);

                                // remove "---" from begining of yaml file, same as first two whitespaces on every line (unfortunately json2yaml adds them
                                newyaml = newyaml.replace(/---\n/g, '');
                                newyaml = newyaml.replace(/\s\s(\w+)/g, '$1');
                                newyaml = newyaml.replace(/"/g, '');

                                //console.log(newyaml);

                                fs.writeFile(templateDefinitionFile, newyaml, 'utf-8', function (err, data) {
                                    if (err) throw err;
                                });
                            }
                        });
                    }
                }
            }
        }

    } else {
        console.log("componentId or availabilityPatern is missing");
        console.log("please try again 'add-availability <component_ID> available@<page_ID>@<area_name>'");
        console.log("(e.g. 'add-availability " + packageJson.lightModuleName + ":components/myLink available@" + packageJson.lightModuleName + ":pages/myHome@main')");
    }
}

if (process.argv[1].indexOf('add-availability') > -1) {
    addAvailability();
}

var addAvailabilityWhenCreated = function (compId, availPatern) {
    componentId = compId;
    availabilityPatern = availPatern;
    addAvailability();
};

var exports = module.exports = {
    addAvailabilityWhenCreated
};
