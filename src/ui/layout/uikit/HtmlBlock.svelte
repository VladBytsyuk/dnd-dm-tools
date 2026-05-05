<script lang="ts">
	import { registerHtmlLinkListener } from "src/domain/listeners/html_link_listener";
	import { handleHtml } from "src/domain/utils/utils";

    let { htmlContent, uiEventListener = undefined, class: className = "" } = $props();
    const linkListener = $derived(uiEventListener ? registerHtmlLinkListener(uiEventListener) : () => {});
</script>

<span
    class={className}
    use:linkListener
>
    {@html handleHtml(htmlContent)}
</span>
