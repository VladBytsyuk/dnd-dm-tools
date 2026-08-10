<script lang="ts">
	import { ArrowLeft } from "lucide-svelte";
	import CharacterSheetFullUi from "./CharacterSheetFullUi.svelte";
	import type { FullCharacterSheet } from "../../../domain/models/character/FullCharacterSheet";
	import {
		LSS_CHARACTER_IFRAME_ALLOW,
		LSS_CHARACTER_IFRAME_SANDBOX,
		createLssCharacterListIframeUrl,
	} from "../../../data/services/LssCharacterSheetService";

	interface Props {
		initialFullItem?: FullCharacterSheet;
		onBackToList?: () => void;
	}

	let { initialFullItem, onBackToList }: Props = $props();

	const listIframeUrl = createLssCharacterListIframeUrl();
	let listReloadKey = $state(0);

	function showList() {
		if (initialFullItem) {
			onBackToList?.();
			return;
		}
		listReloadKey += 1;
	}
</script>

<div class="character-sheet-panel">
	{#if initialFullItem}
		<CharacterSheetFullUi currentItem={initialFullItem} {onBackToList} />
	{:else}
		<div class="character-sheet-iframe-wrap">
			<button
				type="button"
				class="character-sheet-back"
				title="Назад к списку"
				aria-label="Назад к списку"
				onclick={showList}
			>
				<ArrowLeft size={18} aria-hidden="true" />
			</button>
			{#key listReloadKey}
				<iframe
					title="LongStoryShort: список персонажей"
					src={listIframeUrl}
					sandbox={LSS_CHARACTER_IFRAME_SANDBOX}
					allow={LSS_CHARACTER_IFRAME_ALLOW}
					referrerpolicy="no-referrer"
				></iframe>
			{/key}
		</div>
	{/if}
</div>

<style>
	.character-sheet-panel {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
		width: 100%;
		overflow: hidden;
		background: var(--background-primary);
	}

	.character-sheet-iframe-wrap {
		display: flex;
		position: relative;
		flex: 1 1 auto;
		min-height: 0;
		width: 100%;
		overflow: hidden;
	}

	.character-sheet-back {
		position: absolute;
		z-index: 2;
		top: 8px;
		left: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		padding: 0;
		border: 1px solid rgb(255 255 255 / 0.22);
		border-radius: 50%;
		background: rgb(0 0 0 / 0.38);
		color: white;
		box-shadow: 0 1px 8px rgb(0 0 0 / 0.28);
		backdrop-filter: blur(6px);
	}

	.character-sheet-back:hover,
	.character-sheet-back:focus-visible {
		background: rgb(0 0 0 / 0.52);
		color: white;
	}

	.character-sheet-back :global(svg) {
		stroke: currentColor;
	}

	iframe {
		width: 100%;
		height: 100%;
		flex: 1;
		min-height: 0;
		border: 0;
		border-radius: 0;
		background: var(--background-secondary);
	}
</style>
