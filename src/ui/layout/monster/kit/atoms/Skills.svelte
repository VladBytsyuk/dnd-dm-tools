<script lang="ts">
	import { Plus, X } from 'lucide-svelte';
	import type { FullMonster } from 'src/domain/models/monster/FullMonster.ts';
	import { formatModifier } from 'src/domain/modifier';
	import { EmptySkill } from 'src/domain/models/common/Skill';
	import IconButton from 'src/ui/layout/uikit/IconButton.svelte';

    let { currentItem, isInEditMode } = $props<{ 
        currentItem: FullMonster, 
        isInEditMode: boolean,
    }>();

    const addSkill = () => currentItem.skills ? currentItem.skills.push(EmptySkill()) : currentItem.skills = [EmptySkill()];
    const removeSkill = (index: number) => currentItem.skills.splice(index, 1);
</script>

<div class="skills">
    <span class="title">Навыки</span>
    {#if isInEditMode}
        {#each currentItem.skills as skill, index}
            <input class="value inputlike" bind:value={skill.name} />
            <input class="value inputlike" bind:value={skill.value} />
            <IconButton icon={X} size={8} hint="Удалить {skill.name}" onClick={() => removeSkill(index)}/>
        {/each}
        <IconButton icon={Plus} size={12} hint="Добавить навык" onClick={addSkill}/>
    {:else}
        {#each currentItem.skills as skill, index}
            <dice-roller
                label="Навык. {skill.name}"
                formula="к20{formatModifier(skill.value)}"
            >
                {skill.name} {formatModifier(skill.value)}
            </dice-roller>
            {#if index !== (currentItem.skills.length - 1)},&nbsp;{/if}
        {/each}
    {/if}
</div>

<style>
    .skills {
        display: flex;
        flex-wrap: wrap;
        align-content: start;
        align-items: baseline;
        color: var(--text-color);
        gap: 0px;
    }

    .title {
        color: var(--text-color);
        font-size: 12.5px;
        line-height: 1.2em;
        font-weight: bold;
        margin-right: 4px;
    }

    .value {
        color: var(--text-color);
        opacity: 0.75;
        font-size: 12.5px;
        line-height: 1.2em;
    }

	.inputlike {
        flex: 1 1 auto;
	    min-width: 0;
		border: 1px solid transparent;
		background: transparent;
		color: var(--text-normal);
		border-radius: 8px;
        text-align: center;
        field-sizing: content;
        max-width: 160px;
		outline: none;
		border-color: var(--interactive-accent);
		background: var(--background-secondary);
        text-overflow: ellipsis;
	}
</style>
