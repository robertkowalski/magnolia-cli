<!DOCTYPE html>
<html xml:lang="${cmsfn.language()}" lang="${cmsfn.language()}">
  <head>
    [@cms.page /]
  	<meta charset="utf-8" />
  	<meta name="viewport" content="width=device-width, initial-scale=1" />
  	<title>${content.windowTitle!content.title!}</title>
  	<meta name="description" content="${content.description!""}" />
    <meta name="keywords" content="${content.keywords!""}" />
    
    [#-- For loading resources you can link them manualy (e.g. line bellow) --]
      [#-- <link rel="stylesheet" type="text/css" href="${ctx.contextPath}/.resources/__lightDevModuleFolder__/webresources/css/bootstrap.css" media="all" /> --]
      [#-- <script src="${ctx.contextPath}/.resources/__lightDevModuleFolder__/webresources/js/jquery.js"></script> --]
  	[#-- or via theme --]
  	  [#-- [#assign site = sitefn.site()!] --]
      [#-- [#assign theme = sitefn.theme(site)!] --]
    	[#-- [#list theme.cssFiles as cssFile] --]
      [#--   [#if cssFile.conditionalComment?has_content]<!--[if ${cssFile.conditionalComment}]>[/#if] --]
      [#--     <link rel="stylesheet" type="text/css" href="${cssFile.link}" media="${cssFile.media}" /> --]
      [#--   [#if cssFile.conditionalComment?has_content]<![endif]-->[/#if] --]
      [#-- [/#list] --]
      [#-- [#list theme.jsFiles as jsFile] --]
      [#--   <script src="${jsFile.link}"></script> --]
      [#-- [/#list] --]
  	[#-- or use neat-resources/hcmcfn to load all css which match patern automatically (uncomment next line) or via theme --]
  	  [#-- ${hcmcfn.css(["__lightDevModuleFolder__/.*.css"])!} --]

  </head>
  <body class="__name__ ${cmsfn.language()}">

    <div class="container ">
      <h1>__name__ works!</h1>
    </div>

  	[#-- use neat-resources (hcmcfn) to load all js which match patern or link resources manually or via theme --]
    [#-- ${hcmcfn.js(["__lightDevModuleFolder__/.*.js"])!} --]
  </body>
</html>
