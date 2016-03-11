<!DOCTYPE html>
<html xml:lang="${cmsfn.language()}" lang="${cmsfn.language()}">
  <head>
    [@cms.page /]
  	<meta charset="utf-8" />
  	<meta name="viewport" content="width=device-width, initial-scale=1" />
  	<title>${content.windowTitle!content.title!}</title>
  	<meta name="description" content="${content.description!""}" />
  	<meta name="keywords" content="${content.keywords!""}" />    
  	
  	[#-- use hcmcfn or link resources manualy --]
  	${hcmcfn.css(["__lightDevModuleFolder__/.*.css"])}

  </head>
  <body class="__name__ ${cmsfn.language()}">
  
    <div class="container ">
    	<h1>__name__ works! </h1>
    
    </div>
  
  	[#-- use hcmcfn or link resources manualy --]
    ${hcmcfn.js(["__lightDevModuleFolder__/.*.js"])}
  </body>
</html>
