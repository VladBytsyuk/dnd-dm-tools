<script lang="ts">
	import type { Source } from "src/domain/models/common/Source";
	import type { Name } from "src/domain/models/common/Name";
	import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
	import UiCopyableText from "../atoms/UiCopyableText.svelte";
	import UiItemMetaRow from "../molecules/UiItemMetaRow.svelte";
	import UiImageGallery from "../molecules/UiImageGallery.svelte";

	export interface UiDetailLink {
		label: string;
		value: string;
		onClick?: () => void;
		ariaLabel?: string;
	}

	export interface UiDetailInfoBlock {
		label: string;
		value: string;
	}

	interface Props {
		name: Name;
		type?: string;
		source?: Source;
		onCopy: () => void;
		images?: string[];
		uiEventListener?: IUiEventListener;
		links?: UiDetailLink[];
		infoBlocks?: UiDetailInfoBlock[];
		className?: string;
	}

	let {
		name,
		type,
		source,
		onCopy,
		images,
		uiEventListener,
		links = [],
		infoBlocks = [],
		className = "",
	}: Props = $props();
</script>

<div class={`detail-header ${className}`.trim()}>
	<div class="detail-header__content">
		<div class="detail-header__name-container">
			<div class="detail-header__name-rus">
				<UiCopyableText
					text={name.rus}
					onClick={onCopy}
					className="detail-header__name-copy"
				/>
			</div>
			<div class="detail-header__name-eng">{name.eng}</div>
			{#each links as link}
				<div class="detail-header__link">
					<UiCopyableText
						text={link.value}
						onClick={() => link.onClick?.()}
						className="detail-header__link-copy"
						ariaLabel={link.ariaLabel ?? link.label}
					/>
				</div>
			{/each}
		</div>

		<UiItemMetaRow {type} {source} />

		{#if infoBlocks.length > 0}
			<div class="detail-header__details">
				{#each infoBlocks as block}
					<div class="detail-header__detail-block">
						<span class="detail-header__detail-label">{block.label}</span>
						<span class="detail-header__detail-value">{block.value}</span>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<UiImageGallery name={name.rus} {images} {uiEventListener} />
</div>

<style>
	.detail-header {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1em;
	}

	.detail-header__content {
		flex: 1 1 auto;
		min-width: 0;
	}

	.detail-header__name-rus {
		font-size: var(--dnd-ui-font-size-display);
		line-height: var(--dnd-ui-line-height-tight);
		font-weight: var(--dnd-ui-font-weight-bold);
		margin: 0 0 var(--dnd-ui-space-4);
		letter-spacing: 0.02em;
		color: var(--dnd-ui-text-secondary);
	}

	.detail-header__name-copy {
		width: fit-content;
	}

	.detail-header__name-eng {
		opacity: 0.75;
		font-size: var(--dnd-ui-font-size-lg);
		margin: 0 0 2px;
	}

	.detail-header__link {
		opacity: 0.5;
		font-size: var(--dnd-ui-font-size-sm);
		margin: 0 0 2px;
	}

	.detail-header__link-copy {
		justify-content: space-between;
	}

	.detail-header__details {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: var(--dnd-ui-space-8);
		margin-top: var(--dnd-ui-space-10);
	}

	.detail-header__detail-block {
		padding: var(--dnd-ui-space-10) var(--dnd-ui-space-12);
		background: var(--dnd-ui-pattern-subtle-bg);
		border-radius: var(--dnd-ui-radius-lg);
	}

	.detail-header__detail-label {
		display: block;
		font-size: var(--dnd-ui-font-size-xs);
		text-transform: uppercase;
		opacity: 0.7;
		margin-bottom: var(--dnd-ui-space-4);
	}

	.detail-header__detail-value {
		font-size: var(--dnd-ui-font-size-md);
	}
</style>
