#! /usr/bin/env node

var path = require('path');
var fs = require('fs');
var YAML = require('yamljs');

var packageJson = require('../package.json');

var userArgs = process.argv.slice(2);
var componentId = userArgs[0];
var availabilityPatern = userArgs[1];

/*
	Command should looks like: 'add-availability <component_ID> --available@<page_ID>@<area_name>'.
*/

function testComponentId(compId){
  if(compId){
    if (compId.split(":").length == 1) {
      compId = packageJson.lightModuleName+":"+compId;
      return compId;
    } else if (compId.split(":").length == 2) {
      return compId;
    } else {
      return false;
      console.log("ERROR: ","Too many ':' in componentId, should looks like '"+packageJson.lightModuleName+":components/myLink' or 'components/myLink'");
    }
  } else {
    return false;
    console.log("ERROR: ","'componentId' is missing'");
  }
}

function addAvailability() {	
  componentId = testComponentId(componentId);	
	if(availabilityPatern && componentId) {

		var availabilityPath = availabilityPatern.split("@");		
		var availabilityId = testComponentId(availabilityPath[1]);
			
		if( availabilityPath.length != 3) {
			//failed on wrong availabilityPath
			console.log("ERROR: ","Too many or too low '@' in availability/autogenerate patern, should looks like '--available@"+packageJson.lightModuleName+":pages/myHome@main'");
		} else if ((availabilityPath[0]!="--available") && (availabilityPath[0]!="--autogenerate")) {
			//failed on availabilityPath doesn't begin with 'available'
			console.log("ERROR: ","Second parameter should start with '--available' or '--autogenerate', e.g. '--available@"+packageJson.lightModuleName+":pages/myHome@main'");
		} else if (!availabilityId) {
			//failed on wrong with componentId
		} else {
			//availabilityPatern is fine...
			var targetArea = availabilityPath[2];
			var pagePath = availabilityId.split(":");
			if(pagePath.length != 2){
				//something wrong with pageId
				console.log("ERROR: ","Something wrong with pageId, should looks like '--available@"+packageJson.lightModuleName+":pages/myHome@main'");
			} else {
				var templateDefinitionFile = packageJson.config.outputPath + "/" + pagePath[0] + "/templates/" + pagePath[1] + ".yaml";
				
				templateDefinitionFile = path.normalize(templateDefinitionFile);
				if(!fs.existsSync(templateDefinitionFile)) {
					console.log("ERROR: ","'"+templateDefinitionFile+"' page definition doesn't exist");
				} else {
					//page definition exists...
					fs.readFile(templateDefinitionFile, 'utf-8', function (err, data) {
						if (err) throw err;
						var yamlData = data;
						var modified = false;
					
						jsonData = YAML.parse(yamlData);
					  
            if(!jsonData.areas){
                jsonData["areas"] = {};
            }
						
						if(!(targetArea in jsonData.areas)) {
							jsonData.areas[targetArea] = {};
							fs.appendFile(path.normalize(packageJson.config.outputPath + jsonData.templateScript), '\n\n[@cms.area name="'+targetArea+'"/]', 
							              function (err) {
                              if (err) throw err;
                            });
                            console.log("DONE: ","New area '"+targetArea+"' at the end of '"+templateDefinitionFile+"'");
            } 
                          
            var replaceString = new RegExp(':|/', 'g');
            var componentIdString = componentId.replace(replaceString,"-");

            if (availabilityPath[0]=="--available") {
                var jsonArea = jsonData.areas[targetArea];
                jsonArea = {"type":"list"};
                
                if (!("availableComponents" in jsonData.areas[targetArea])) {
                    jsonData.areas[targetArea].availableComponents = {};
                } 
                var jsonAC = jsonData.areas[targetArea].availableComponents;
                
                if(!(componentIdString in jsonAC) && (jsonAC[componentIdString] = {})) {
                    var jsonCom = jsonAC[componentIdString];
                    jsonCom['id'] = componentId;
                }
                console.log("DONE: ","Availability for '"+componentId+"' added into '"+templateDefinitionFile+"'");
                modified = true;

            } else if (availabilityPath[0]=="--autogenerate") {

                //TODO: so far it rewrites targetArea completely...

                jsonData.areas[targetArea] = {"type":"single","renderType":"freemarker"};
                jsonData.areas[targetArea].autoGeneration = {"generatorClass": "info.magnolia.rendering.generator.CopyGenerator"};
                jsonData.areas[targetArea].autoGeneration.content = {};
                jsonData.areas[targetArea].autoGeneration.content[componentIdString] = {"nodeType": "mgnl:component","templateId": componentId};

                console.log("DONE: ","Autogenerate for '"+componentId+"' added into '"+templateDefinitionFile+"'");
                modified = true;
              }
						
						if (modified === true){	
							newyaml = YAML.stringify(jsonData,10)
							
							// remove "---" from begining of yaml file, same as first two whitespaces on every line (unfortunately json2yaml adds them
							newyaml = newyaml.replace(/---\n/g,'');
							newyaml = newyaml.replace(/\s\s(\w+)/g,'$1');
							newyaml = newyaml.replace(/"/g,'');
							
              fs.writeFile(templateDefinitionFile, newyaml, 'utf-8', function (err, data) {
                  if (err) throw err;
              });
						}
					});
				}
			}
		}

    } else {
		  console.log("ERROR: ","componentId or availabilityPatern is missing");
	}
}

if(process.argv[1].indexOf('add-availability') > -1) {
  addAvailability();
}

var addAvailabilityWhenCreated = function (compId,availPatern) {
	componentId = compId;
	availabilityPatern = availPatern;
	addAvailability();
};

var exports = module.exports = {
	addAvailabilityWhenCreated
};