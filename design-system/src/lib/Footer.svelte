<script lang="ts">
	import "@fontsource/golos-text/400.css";

	type Props = {
		text?: string;
		editable?: boolean;
		theme?: "dark" | "light";
		fields?: { label: string; value: string; placeholder: string; onChange: (value: string) => void }[];
	};

	let { text = $bindable(""), editable = false, theme = "dark", fields = [] }: Props = $props();
</script>

<footer data-theme={theme}>
	{#if editable && fields.length}
		<div class="footer-fields">
			{#each fields as field (field.label)}
				<label>{field.label}<input value={field.value} placeholder={field.placeholder} aria-label={field.label} oninput={(event) => field.onChange(event.currentTarget.value)} /></label>
			{/each}
		</div>
	{:else if editable}
		<input bind:value={text} placeholder="Дополнительная информация" aria-label="Текст подвала" />
	{:else}
		{text}
	{/if}
</footer>

<style>
	footer {
		width: 100%;
		min-width: 0;
		color: rgb(255 255 255 / 70%);
		font-family: "Golos Text", sans-serif;
		font-size: 12px;
		font-weight: 400;
		line-height: 15px;
		overflow-wrap: anywhere;
	}

	footer[data-theme="light"] { color: rgb(31 41 55 / 70%); }
	.footer-fields { display: flex; width: 100%; min-width: 0; }
	.footer-fields label { display: flex !important; flex-flow: row nowrap !important; align-items: center; gap: 6px; min-width: 0; white-space: nowrap; }
	footer .footer-fields input { flex: 1 1 auto; width: auto; }

	footer input {
		width: 100%;
		min-width: 0;
		padding: 0;
		border: 0;
		border-radius: 0;
		appearance: none;
		background: transparent;
		color: inherit;
		font-family: inherit;
		font-size: inherit;
		font-weight: inherit;
		line-height: inherit;
		text-align: inherit;
	}

	footer input:focus-visible {
		outline: 1px solid currentcolor;
		outline-offset: 2px;
	}
	footer input::placeholder { color: currentcolor; opacity: 0.65; }
</style>
