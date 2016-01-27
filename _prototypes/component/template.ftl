[#compress]
<div class="__name__">
	
	[#if content.title?has_content]
		<h2>${content.title!}</h2>
	[/#if]
	
	
	[#if content.desc?has_content]
		<p>${content.desc!}</p>
	[/#if]
	
	
	[#if content.internalLink?has_content]
		[#assign target = cmsfn.contentById(content.internalLink, "website")!]
		<a href='${ctx.contextPath}/${cmsfn.link(target)!}' class='btn btn-link'>${target.title!target.@name}</a>
	[/#if]
	
	
	[#if content.image?has_content]
		[#assign image = damfn.getAsset(content.image)]
		<img src='${image.link!}' class='img-responsive' alt='image'>
	[/#if]
	
	
	[#if content.categories?has_content && content.categories?size > 0]
		[#list content.categories as item]
			[#assign category = cmsfn.contentById(item, "category")!]
			<span class="label label-default">${category.name!category.@name!}</span> 
		[/#list]
	[/#if]
	
</div>
[/#compress]