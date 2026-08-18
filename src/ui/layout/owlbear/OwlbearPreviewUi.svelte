<script lang="ts">
	import type DndStatblockPlugin from "src/main";

	let { plugin }: { plugin: DndStatblockPlugin } = $props();
	const preview = $derived(plugin.getActiveOwlbearPreview());
</script>

<section class="owlbear-preview" aria-label="Превью Owlbear">
	{#if preview}
		<h2>{preview.name}</h2>
		<div class="owlbear-preview__image-wrap">
			<img src={preview.dataUrl} alt={preview.name} />
		</div>
	{:else}
		<p>Сейчас в Owlbear нет активного изображения.</p>
	{/if}
</section>

<style>
	.owlbear-preview { display: flex; flex: 1 1 auto; min-height: 0; flex-direction: column; gap: 12px; padding: 12px; }
	.owlbear-preview h2 { margin: 0; font-size: 1em; overflow-wrap: anywhere; }
	.owlbear-preview__image-wrap { display: flex; min-height: 0; flex: 1 1 auto; align-items: center; justify-content: center; overflow: auto; border-radius: 8px; background: var(--background-secondary); }
	.owlbear-preview img { display: block; max-width: 100%; max-height: 100%; object-fit: contain; }
</style>
