<script module lang="ts">
	export type TableValue = string | number | { text: string; html: string };
</script>

<script lang="ts">
	import "./table.css";
	import { sanitizeRichHtml } from "./sanitizeRichHtml";

	type Props = {
		columns?: number;
		values?: TableValue[];
		accentColor?: string;
		theme?: "dark" | "light";
		editable?: boolean;
	};

	let {
		columns = 1,
		values = $bindable<TableValue[]>([]),
		accentColor = "#d4d4d4",
		theme = "dark",
		editable = false,
	}: Props = $props();

	let columnCount = $derived(Math.max(1, Math.floor(columns)));
	let bodyRowCount = $derived(Math.ceil(Math.max(0, values.length - columnCount) / columnCount));
</script>

<table
	class="dnd-table"
	data-theme={theme}
	style:--dnd-table-accent={accentColor}
	aria-label="Таблица"
>
	<thead>
		<tr>
			{#each Array(columnCount) as _, columnIndex}
				<th scope="col">
					{#if values[columnIndex] !== undefined}
						{#if editable}
							<input bind:value={values[columnIndex]} placeholder="Заголовок" aria-label={`Заголовок столбца ${columnIndex + 1}`} />
						{:else}
							{@const value = values[columnIndex]}
							{#if typeof value === "object"}{@html sanitizeRichHtml(value.html)}{:else}{value}{/if}
						{/if}
					{/if}
				</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each Array(bodyRowCount) as _, rowIndex}
			<tr>
				{#each Array(columnCount) as _, columnIndex}
					{@const cellIndex = columnCount + rowIndex * columnCount + columnIndex}
					<td>
						{#if values[cellIndex] !== undefined}
							{#if editable}
								<input bind:value={values[cellIndex]} placeholder="Значение" aria-label={`Ячейка ${cellIndex + 1}`} />
							{:else}
								{@const value = values[cellIndex]}
								{#if typeof value === "object"}{@html sanitizeRichHtml(value.html)}{:else}{value}{/if}
							{/if}
						{/if}
					</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>
