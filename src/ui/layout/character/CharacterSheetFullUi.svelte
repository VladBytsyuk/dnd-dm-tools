<script lang="ts">
	import { ArrowLeft } from "lucide-svelte";
	import { Notice } from "obsidian";
	import type { FullCharacterSheet } from "../../../domain/models/character";
	import type { IUiEventListener } from "../../../domain/listeners/ui_event_listener";
	import type { CharacterSheetRepository } from "../../../data/repositories/CharacterSheetRepository";
	import type DndStatblockPlugin from "../../../main";
	import {
		LSS_CHARACTER_IFRAME_ALLOW,
		LSS_CHARACTER_IFRAME_SANDBOX,
		createLssCharacterIframeUrl,
	} from "../../../data/services/LssCharacterSheetService";
	import { copyCharacterSheetToClipboard } from "../../../data/clipboard";

	interface Props {
		currentItem: FullCharacterSheet;
		uiEventListener?: IUiEventListener;
		repository?: CharacterSheetRepository;
		plugin?: DndStatblockPlugin;
		onBackToList?: () => void;
	}

	let { currentItem, onBackToList }: Props = $props();

	const name = $derived(currentItem.name.rus || currentItem.name.eng || "Персонаж");
	const iframeUrl = $derived(createLssCharacterIframeUrl(currentItem.url));
	const dndUrl = $derived(`dnd:${currentItem.url}`);
	const markdownLink = $derived(`[${escapeMarkdownLinkLabel(name)}](dnd:${currentItem.url})`);

	function escapeMarkdownLinkLabel(value: string): string {
		return value
			.replace(/\\/g, "\\\\")
			.replace(/\[/g, "\\[")
			.replace(/\]/g, "\\]");
	}

	async function copyNoteLink() {
		try {
			await navigator.clipboard.writeText(markdownLink);
			new Notice("Ссылка на персонажа скопирована.");
		} catch (error) {
			console.error("Failed to copy character sheet note link:", error);
			new Notice("Не удалось скопировать ссылку на персонажа.");
		}
	}

	function copyEncounterParticipant() {
		const copied = copyCharacterSheetToClipboard(currentItem);
		if (!copied) {
			new Notice("Не удалось добавить персонажа в столкновение: не хватает HP, КД или инициативы.");
		}
	}
</script>

<div class="character-sheet-full">
	<div class="character-sheet-toolbar">
		<div class="character-sheet-title">
			<div class="character-sheet-name">{name}</div>
			<a class="character-sheet-link" href={dndUrl}>{currentItem.url}</a>
		</div>
		<div class="character-sheet-actions">
			<button type="button" onclick={copyNoteLink}>Скопировать ссылку</button>
			<button type="button" onclick={copyEncounterParticipant}>В столкновение</button>
		</div>
	</div>

	<div class="character-sheet-iframe-wrap">
		<button
			type="button"
			class="character-sheet-back"
			title="Назад к списку"
			aria-label="Назад к списку"
			onclick={() => onBackToList?.()}
		>
			<ArrowLeft size={18} aria-hidden="true" />
		</button>
		<iframe
			title={`LongStoryShort: ${name}`}
			src={iframeUrl}
			sandbox={LSS_CHARACTER_IFRAME_SANDBOX}
			allow={LSS_CHARACTER_IFRAME_ALLOW}
			referrerpolicy="no-referrer"
		></iframe>
	</div>
</div>

<style>
	.character-sheet-full {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
		width: 100%;
		overflow: hidden;
		background: var(--background-primary);
	}

	.character-sheet-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 8px 0 12px;
		flex-shrink: 0;
	}

	.character-sheet-title {
		min-width: 0;
	}

	.character-sheet-name {
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.character-sheet-link {
		display: block;
		font-size: 0.85em;
		color: var(--text-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.character-sheet-actions {
		display: flex;
		flex: 0 0 auto;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: 8px;
	}

	.character-sheet-actions button {
		flex-shrink: 0;
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
