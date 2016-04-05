# Magnolia Light Development CLI tool #

Description TBD




## Instalation ##
Before installation make sure you have right Node.js installed (tested with 5.4.1, one of dependent tools had issue to work with 5.6 so 5.4.1 is really recommended)
```
node -v
v5.4.1
```

Then navigate to your <yourWorkingDirectory> and run ('magnolia-cli' is not on npm repository yet, so pls use second way)
```
npm install magnolia-cli
```
or instal it from locale source e.g.
```
npm install magnolia-cli-1.0.0.tgz
```
After this first step installation (which is like reconfiguration for CLI tool) navigate into /cli folder
```
cd cli
```
and run second step installation plus link script to be executable (have to do it with sudo permissions)

```
npm install && sudo npm link
```




## Configuration ##
Found `package.json` file in `cli` folder and open it to edit.

As you can see there is a lot of stuff already preconfigured to happens during build (npm start). But lets describe some of them:




## Build ##
From now all command for CLI tool _has to be executed from `cli` folder_.

Once you checked or edited `package.json` file you can build/start project using command:

```
npm start
```

After this you should have folder structure like this (may be different if you edit `package.json`)
```
<yourWorkingDirectory>
    - apache-tomcat
    - cli
    - light-modules
```

If you change some configuration in `package.json` file later you can repeat 'npm start' command. Or execute just specific command like:

```
npm run mgnlbuild
npm run donwloadMagnolia
npm run unzipMagnolia
npm run editMagnoliaProperties
npm run downloadJars
npm run createFolders
npm run copyResources
```
Don't forget they will always do stuff based on current configuration in `package.json` file, so it may override some of your manual changes in project. 




## Example ##
* start Magnolia from 'apache-tomcat/bin' (better in new terminal window), follow up and finish installation
* create new page using command `addPage myHome` (in 'cli' folder, same for all other steps)
* go to Magnolia > pages app, add new page with 'myHome' template
* create new component using `addComp textImage available@sampleModule:pages/myHome@main`
* on 'myHome' page you may now add 'textImage' component into main area
* you may also create new component without availability just using `addComp image` and add availability later
* or you may create component and make him autogenerated on page `addComp footer autogenerate@sampleModule:pages/myHome@footer`
* to add availability to anything use command like `addAvailability mtk:components/html available@sampleModule:pages/myHome@main` 
* if 'start' script includes './bin/watchBootstrap.js' then less files are watched for changes, so go to '/light-modules/sampleModule/webresources/css/bootstrap-less' open for instance 'scaffolding.less' and add there this code `footer { background-color: @gray-dark; color: #fff;}` (you should also have footer area rendered in <footer></footer> in main.ftl)