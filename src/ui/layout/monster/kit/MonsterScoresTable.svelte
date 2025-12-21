<script lang="ts">
	import { calculateAndFormatModifier } from 'src/domain/modifier';
	import type { FullMonster } from '../../../../domain/models/monster/FullMonster';

    let { currentItem } = $props<{ currentItem: FullMonster; }>();
</script>
  
<div class="scores-table">
    {#each Object.entries({
        ["СИЛ"]: currentItem.ability.str,
        ["ЛОВ"]: currentItem.ability.dex,
        ["ТЕЛ"]: currentItem.ability.con,
        ["ИНТ"]: currentItem.ability.int,
        ["МУД"]: currentItem.ability.wiz,
        ["ХАР"]: currentItem.ability.cha
    }) as entry}
        <div class="scores-table-item">
        <div class="scores-table-item-title"><b>{entry[0]}</b></div>
        <div class="scores-table-item-value">
            <dice-roller label={entry[0]} formula={"к20+" + calculateAndFormatModifier(entry[1])}>
                {entry[1]} ({calculateAndFormatModifier(entry[1])})
            </dice-roller>
        </div>
        </div>
    {/each}
</div>


<style>
    .scores-table {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(40px, 1fr));
        gap: 0.25em;
        margin: 1em 0em;
        text-align: center;
        color: var(--text-color);
    }

    .scores-table-item {
        font-size: 12px;
        line-height: 1em;
        min-width: 0;
    }

    .scores-table-item-title {
        padding: 0.5em;
        background: var(--accent-bg);
        border-radius: 6px 6px 0px 0px;
    }

    .scores-table-item-value {
        padding: 0.5em;
        background: var(--accent-bg-sub);
        margin: 0px 0px 6px;;
        border-radius: 0px 0px 6px 6px;
    }
</style>
