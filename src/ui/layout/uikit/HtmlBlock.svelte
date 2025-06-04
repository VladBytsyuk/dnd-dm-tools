<script lang="ts">
	import { registerHtmlLinkListener } from "src/domain/html_click";
	import { handleHtml } from "src/domain/utils";

    let { htmlContent, htmlLinkListener } = $props();
    const linkListener = registerHtmlLinkListener(htmlLinkListener);   
</script>

<span use:linkListener>{@html handleHtml(htmlContent)}</span>