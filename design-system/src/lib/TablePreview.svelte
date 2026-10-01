<script lang="ts">
	import "./table.css";

	const headers = ["КД", "Хиты", "Скорость", "СИЛ", "ЛОВ", "ТЕЛ", "ИНТ", "МДР"];
	const rows = [
		["15", "45", "30 фт.", "+2", "+1", "+3", "−1", "+0"],
		["13", "22", "40 фт.", "+0", "+3", "+1", "+2", "+1"],
		["17", "88", "25 фт.", "+4", "−1", "+3", "+0", "+2"],
		["12", "18", "30 фт.", "−1", "+2", "+0", "+1", "+3"],
		["16", "64", "35 фт.", "+3", "+1", "+2", "+0", "−1"],
	];
</script>

<table class="dnd-table" style="--dnd-table-accent: #d4d4d4">
	<thead>
		<tr>
			{#each headers as header}<th scope="col">{header}</th>{/each}
		</tr>
	</thead>
	<tbody>
		{#each rows as row}
			<tr>
				{#each row as cell}<td>{cell}</td>{/each}
			</tr>
		{/each}
	</tbody>
</table>
