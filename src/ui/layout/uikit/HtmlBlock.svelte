<script lang="ts">
	import { registerHtmlLinkListener } from "src/domain/listeners/html_link_listener";
	import { handleHtml } from "src/domain/utils/utils";

    let { htmlContent, uiEventListener = undefined, ...others } = $props();
    const linkListener = uiEventListener ? registerHtmlLinkListener(uiEventListener) : () => {};
</script>

<span
    class="{others.class || ''}"
    use:linkListener
>
    {@html handleHtml(htmlContent)}
</span>