<script lang="ts">
	import type { FullMonster } from '../../../../domain/models/monster/FullMonster';
	import MonsterScoresTableItem from './MonsterScoresTableItem.svelte';

    let { 
        currentItem, 
        isInEditMode 
    } = $props<{ 
        currentItem: FullMonster;
        isInEditMode: boolean;
    }>();
</script>
  
<div class="scores-table">
    <MonsterScoresTableItem title="СИЛ" value={currentItem.ability.str} {isInEditMode} />
    <MonsterScoresTableItem title="ЛОВ" value={currentItem.ability.dex} {isInEditMode} />
    <MonsterScoresTableItem title="ТЕЛ" value={currentItem.ability.con} {isInEditMode} />
    <MonsterScoresTableItem title="ИНТ" value={currentItem.ability.int} {isInEditMode} />
    <MonsterScoresTableItem title="МУД" value={currentItem.ability.wiz} {isInEditMode} />
    <MonsterScoresTableItem title="ХАР" value={currentItem.ability.cha} {isInEditMode} />
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
</style>
