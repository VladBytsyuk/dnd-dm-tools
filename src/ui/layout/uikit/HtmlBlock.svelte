<script lang="ts">
	import { registerHtmlLinkListener } from "src/domain/listeners/html_link_listener";
	import { handleHtml } from "src/domain/utils";

    let { htmlContent, uiEventListener, ...others } = $props();
    const linkListener = registerHtmlLinkListener(uiEventListener);   
</script>

<span 
    class="{others.class || ''}"
    use:linkListener
>
    {@html handleHtml(htmlContent)}
</span>