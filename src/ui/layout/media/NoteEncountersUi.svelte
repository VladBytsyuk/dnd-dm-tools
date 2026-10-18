<script lang="ts">
	import { MarkdownRenderChild, MarkdownRenderer, type App } from "obsidian";
	let { app, encounters, sourcePath }: { app: App; encounters: string[]; sourcePath: string } = $props();

	function renderEncounter(host: HTMLElement, value: { markdown: string; sourcePath: string }) {
		let dispose = () => {};
		function render(next: typeof value) {
			dispose();
			const target = document.createElement("div");
			host.replaceChildren(target);
			const child = new MarkdownRenderChild(target);
			let active = true;
			child.load();
			dispose = () => { active = false; child.unload(); };
			void MarkdownRenderer.render(app, next.markdown, target, next.sourcePath, child)
				.catch((error) => { if (active) target.textContent = error instanceof Error ? error.message : "Не удалось отобразить энкаунтер."; })
				.finally(() => { if (!active) child.unload(); });
		}
		render(value);
		return { update: render, destroy() { dispose(); } };
	}
</script>

<div class="note-encounters">
	{#each encounters as markdown, index (`${index}:${markdown}`)}
		<div class="encounter-block" use:renderEncounter={{ markdown, sourcePath }}></div>
	{/each}
</div>

<style>
	.note-encounters { display: flex; flex-direction: column; gap: 6px; width: 100%; min-width: 0; }
	.encounter-block { width: 100%; min-width: 0; overflow-x: auto; }
	.encounter-block :global(.tracker) { width: 100%; }
</style>
