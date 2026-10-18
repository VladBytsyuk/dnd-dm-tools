<script lang="ts">
	import { showClipboardNotice } from "src/data/clipboard";
	import { FullDmScreen } from "@dnd-dm-tools/design-system";
	import { resolveDndEntityLink } from "src/domain/listeners/html_link_listener";
	import { theme as appTheme, Theme } from "src/ui/theme";

    // ---- props ----
    let { currentItem, uiEventListener, theme: themeProp, sectionName } = $props<{
        currentItem: any;
        uiEventListener: any;
        theme?: "dark" | "light";
        sectionName?: string;
    }>();
    const theme: "dark" | "light" = $derived(themeProp ?? ($appTheme === Theme.Dark ? "dark" : "light"));

    function handleEntityLink(link: { href: string }) {
        const result = resolveDndEntityLink(uiEventListener, link.href);
        if (result) return result;
    }

	function showCopyNotice(text: string) {
		showClipboardNotice(text);
	}
</script>

<FullDmScreen
	russianName={currentItem.name.rus}
	englishName={currentItem.name.eng}
	entityLink={currentItem.url}
	section={sectionName || currentItem.group}
	source={currentItem.source}
	icon={currentItem.icon}
	html={currentItem.description}
	onEntityLinkClick={handleEntityLink}
	onCopyText={showCopyNotice}
	{theme}
/>
