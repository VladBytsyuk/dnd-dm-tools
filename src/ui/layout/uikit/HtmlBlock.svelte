<script lang="ts">
	import { registerHtmlLinkListener } from "src/domain/html_click";
	import { handleHtml } from "src/domain/utils";

    let { htmlContent, htmlLinkListener, ...others } = $props();
    const linkListener = registerHtmlLinkListener(htmlLinkListener);   
</script>

<span 
    class="{others.class || ''}"
    use:linkListener
>
    {@html handleHtml(htmlContent)}
</span>