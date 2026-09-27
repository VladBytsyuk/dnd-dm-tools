<script lang="ts">
	import { copyDmScreenItem } from "src/data/clipboard";
	import { FullItemHeader, TextBlock } from "@dnd-dm-tools/design-system";
	import { resolveDndEntityLink } from "src/domain/listeners/html_link_listener";
	import HtmlBlock from "../uikit/HtmlBlock.svelte";
	import UiCopyableText from "../uikit/atoms/UiCopyableText.svelte";
	import UiItemMetaRow from "../uikit/molecules/UiItemMetaRow.svelte";

    // ---- props ----
    let { currentItem, uiEventListener, redesigned = false, theme = "dark", sectionName } = $props<{
        currentItem: any;
        uiEventListener: any;
        redesigned?: boolean;
        theme?: "dark" | "light";
        sectionName?: string;
    }>();

    function imageSource(value?: string): string | undefined {
        if (!value) return undefined;
        const trimmed = value.trim();
        return trimmed.startsWith("<svg")
            ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(trimmed)}`
            : trimmed;
    }

    function handleEntityLink(link: { href: string }) {
        const result = resolveDndEntityLink(uiEventListener, link.href);
        if (result) return result;
    }
</script>

{#if redesigned}
<article class="dm-screen-detail redesigned">
    <header class="detail-header">
        <FullItemHeader
            russianName={currentItem.name.rus}
            englishName={currentItem.name.eng}
            entityLink={currentItem.url}
            info={sectionName || currentItem.group ? `Раздел: ${sectionName || currentItem.group}` : undefined}
            source={currentItem.source}
            {theme}
        />
        {#if imageSource(currentItem.icon)}
            <img class="detail-icon" src={imageSource(currentItem.icon)} alt={currentItem.name.rus} />
        {/if}
    </header>
    {#if currentItem.description}
        <section class="detail-content">
            <TextBlock html={currentItem.description} onEntityLinkClick={handleEntityLink} {theme} />
        </section>
    {/if}
</article>
{:else}
<div class="item">
    {#if currentItem.name}
    <div class="item-header-box">
        <div class="item-header-title">
            <UiCopyableText
                text={currentItem.name.rus}
                onClick={() => copyDmScreenItem(currentItem)}
                className="item-header-copy"
            />
            <span class="item-header-subtitle">[{currentItem.name.eng}]</span>
        </div>
    </div>
    {/if}
    <div class="item-content">
        {#if currentItem.parent && currentItem.source}
        <UiItemMetaRow
            type={currentItem.parent ? `Раздел: ${currentItem.parent.name.rus}` : undefined}
            source={currentItem.source}
            className="item-content-source"
        />
        {/if}
        {#if currentItem.description}
        <div class="item-content-text">
            <HtmlBlock htmlContent={currentItem.description} uiEventListener={uiEventListener} />
        </div>
        {/if}
    </div>
</div>
{/if}

<style>
    .item {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        overflow: hidden;
        border-radius: var(--dnd-ui-radius-lg);
        background: var(--dnd-ui-surface-panel-strong);
    }

    .item-header-box {
        align-items: center;
        padding: 1em;
        background-color: var(--dnd-ui-surface-muted-strong);
    }

    .item-header-title {
        font-size: var(--dnd-ui-font-size-xl);
        font-weight: var(--dnd-ui-font-weight-bold);
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }

    .item-header-subtitle {
        font-size: 0.8em;
        font-weight: normal;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        opacity: 0.8;
        margin-top: 0.2em;
    }

    .item-content {
        flex: 1;
        padding: 1em;
        background-color: var(--dnd-ui-surface-base);
        overflow-y: auto;
    }

    .item-content-text {
        margin-top: 1em;
    }

    .dm-screen-detail.redesigned {
        box-sizing: border-box;
        display: grid;
        gap: var(--dnd-ui-space-12);
        width: 100%;
        min-width: 0;
        padding: var(--dnd-ui-space-16);
		border-radius: var(--dnd-ui-radius-lg);
        background:
            linear-gradient(rgb(48 48 48 / 40%), rgb(48 48 48 / 40%)),
            linear-gradient(105deg, var(--ds-dm-screen) 0%, var(--ds-dm-screen-sub) 100%);
        color: var(--dnd-ui-text-primary);
    }

	.detail-header { display: grid; grid-template-columns: minmax(0, 1fr) minmax(64px, 20%); align-items: stretch; gap: var(--dnd-ui-space-12); min-width: 0; min-height: 88px; }
	.detail-icon {
		display: block;
		width: 100%;
		height: 100%;
		min-height: 88px;
		object-fit: contain;
	}
	.detail-content { min-width: 0; color: var(--dnd-ui-text-primary); line-height: 1.5; }
	@media (max-width: 420px) { .detail-header { grid-template-columns: minmax(0, 1fr) 64px; } }
</style>
