# Magnolia Light Development CLI tool #

An npm package providing a CLI tool to setup and facilitate light development with Magnolia


## Installation ##
Before installation make sure you have  Node.js version 5.+ installed
```
node -v
```

Then navigate to your <yourWorkingDirectory> and run (`magnolia-cli` is not on npm repository yet, so pls use second way)
```
npm install magnolia-cli
```
or install it from locale source e.g.
```
npm install magnolia-cli-1.0.0.tgz
```
After this first step installation (which is like reconfiguration for CLI tool) navigate into `/cli` folder
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
('-s' is optional parameter to run start silently)
```
npm start -s
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
**Don't forget they will always do stuff based on current configuration in `package.json` file, so it may override some of your previous changes in project.** 


## Commands ##
Add/create page template (will create page yaml file, main.ftl and page dialog)
```
create-page myHome
```

Add/create component template (will create component yaml file, component  ftl and component dialog)
```
create-component image
```

Same as above plus will set this component available on 'myHome' page in 'main' area (if area or availability configuration doesn't exist's in 'myHome' page, will create it as well)
```
create-component textImage --available@pages/myHome@main
create-component textImage --available@sampleModule:pages/myHome@main
```

Same as above, just will do 'autogeneration' instead of availability
```
create-component footer --autogenerate@sampleModule:pages/myHome@footer
```

Make component 'html' available at 'myHome' in 'main' area
```
add-availability components/text --available@pages/myHome@main
add-availability mtk:components/link --available@pages/myHome@main
```


## Bootstrap less + watch ##
If 'start' script includes 'watchBootstrap' then `less` files are watched for changes and if you do any change in bootstrap less files (by default in <lightModule>/webresources/css/bootstrap-less) botstrap.css file should be imediately recompiled, so only what you ahve to do is to reload a page in browser. 