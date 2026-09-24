<script module lang="ts">
	export type TableValue = string | number;
</script>

<script lang="ts">
	import "./table.css";

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
							<input bind:value={values[columnIndex]} aria-label={`Заголовок столбца ${columnIndex + 1}`} />
						{:else}
							{values[columnIndex]}
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
								<input bind:value={values[cellIndex]} aria-label={`Ячейка ${cellIndex + 1}`} />
							{:else}
								{values[cellIndex]}
							{/if}
						{/if}
					</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>
