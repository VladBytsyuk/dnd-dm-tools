<script lang="ts">
	import HtmlBlock from "../../uikit/HtmlBlock.svelte";

	interface Props {
		title: string;
		content: string | any;
		collapsible?: boolean;
	}

	let { title, content, collapsible = false }: Props = $props();
	let isExpanded = $state(true);

	const htmlContent = $derived(() => {
		if (!content) return '';
		if (typeof content === 'string') return content;
		// Handle TextField with EditorState
		if (content.value && typeof content.value === 'object') {
			// For now, return empty - proper serialization would go here
			return '';
		}
		return String(content);
	});

	function toggleExpanded() {
		if (collapsible) {
			isExpanded = !isExpanded;
		}
	}
</script>

<div class="character-text-section">
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="section-header"
		class:clickable={collapsible}
		onclick={toggleExpanded}
		role={collapsible ? "button" : undefined}
		tabindex={collapsible ? 0 : undefined}
		onkeydown={collapsible ? (e) => { if (e.key === 'Enter' || e.key === ' ') toggleExpanded(); } : undefined}
	>
		<h3 class="section-title">{title}</h3>
		{#if collapsible}
			<span class="collapse-icon">{isExpanded ? '▼' : '▶'}</span>
		{/if}
	</div>
	{#if isExpanded}
		<div class="section-content">
			{#if htmlContent()}
				<HtmlBlock htmlContent={htmlContent()} />
			{:else}
				<div class="empty-state">Нет данных</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.character-text-section {
		margin-bottom: 16px;
		border: 1px solid var(--background-modifier-border);
		border-radius: 6px;
		background-color: var(--background-primary);
	}

	.section-header {
		padding: 12px 16px;
		border-bottom: 1px solid var(--background-modifier-border);
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: var(--background-secondary);
		border-radius: 6px 6px 0 0;
	}

	.section-header.clickable {
		cursor: pointer;
		user-select: none;
	}

	.section-header.clickable:hover {
		background-color: var(--background-modifier-hover);
	}

	.section-title {
		margin: 0;
		font-size: 14px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: var(--text-normal);
	}

	.collapse-icon {
		font-size: 12px;
		color: var(--text-muted);
		transition: transform 0.2s;
	}

	.section-content {
		padding: 12px 16px;
		font-size: 13px;
		line-height: 1.6;
		color: var(--text-normal);
	}

	.character-text-section .empty-state {
		/* Override Obsidian's global .empty-state styles */
		position: static !important;
		height: auto !important;
		width: auto !important;
		top: auto !important;
		inset-inline-start: auto !important;
		display: block !important;

		/* Our styles */
		color: var(--text-muted);
		font-style: italic;
		pointer-events: none;
	}
</style>
