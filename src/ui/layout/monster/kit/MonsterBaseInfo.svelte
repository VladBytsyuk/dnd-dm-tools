<script lang="ts">
	import type { FullMonster } from '../../../../domain/models/monster/FullMonster';
	import type { IUiEventListener } from '../../../../domain/listeners/ui_event_listener';
	import Armor from './atoms/Armor.svelte';
	import Hits from './atoms/Hits.svelte';
	import Speed from './atoms/Speed.svelte';
	import SavingThrows from './atoms/SavingThrows.svelte';
	import Skills from './atoms/Skills.svelte';
	import StringField from './atoms/StringField.svelte';
	import Senses from './atoms/Senses.svelte';
	import ChallengeRating from './atoms/ChallengeRating.svelte';

    let { 
		currentItem,
        isInEditMode,
		uiEventListener,
	} = $props<{
        currentItem: FullMonster;
        isInEditMode: boolean;
        uiEventListener: IUiEventListener;
    }>();

    const notEmpty = (list: any[] | undefined): boolean => {
        return list !== undefined && list.length > 0;
    }
</script>

<div class="base-info-root">
    <ul class="base-info-line">
        {#if currentItem.armorClass}
            <li class="base-info-line-item">
                <Armor {currentItem} {isInEditMode} {uiEventListener} />
            </li>
        {/if}
        {#if currentItem.hits}
            <li class="base-info-line-item">
                <Hits {currentItem} {isInEditMode} {uiEventListener} />
            </li>
        {/if}
        {#if currentItem.speed && currentItem.speed.length >= 1}
            <li class="base-info-line-item">
                <Speed {currentItem} {isInEditMode} />
            </li>
        {/if}
    </ul>

    <div class="base-info-block">
        {#if isInEditMode || notEmpty(currentItem.savingThrows)}
            <div class="base-info-item">
                <SavingThrows {currentItem} {isInEditMode} />
            </div>
        {/if}

        {#if isInEditMode || notEmpty(currentItem.skills)}
            <div class="base-info-item">
                <Skills {currentItem} {isInEditMode} />
            </div>
        {/if}

        {#if isInEditMode || notEmpty(currentItem.damageVulnerabilities)}
            <div class="base-info-item">
                <StringField 
                    title="Уязвимость к урону" 
                    items={currentItem.damageVulnerabilities} 
                    {isInEditMode} 
                    onItemsChange={it => currentItem.damageVulnerabilities = it} />
            </div>
        {/if}

        {#if isInEditMode || notEmpty(currentItem.damageResistances)}
            <div class="base-info-item">
                <StringField 
                    title="Сопротивление к урону" 
                    items={currentItem.damageResistances} 
                    {isInEditMode} 
                    onItemsChange={it => currentItem.damageResistances = it} />
            </div>
        {/if}

        {#if isInEditMode || notEmpty(currentItem.damageImmunities)}
            <div class="base-info-item">
                <StringField 
                    title="Иммунитет к урону" 
                    items={currentItem.damageImmunities} 
                    {isInEditMode} 
                    onItemsChange={it => currentItem.damageImmunities = it} />
            </div>
        {/if}

        {#if isInEditMode || notEmpty(currentItem.conditionImmunities)}
            <div class="base-info-item">
                <StringField 
                    title="Иммунитет к состоянию" 
                    items={currentItem.conditionImmunities} 
                    {isInEditMode} 
                    onItemsChange={it => currentItem.conditionImmunities = it} />
            </div>
        {/if}

        {#if isInEditMode || notEmpty(currentItem.senses.senses)}
            <div class="base-info-item">
                <Senses {currentItem} {isInEditMode} />
            </div>
        {/if}

        {#if isInEditMode || notEmpty(currentItem.languages)}
            <div class="base-info-item">
                <StringField 
                    title="Языки" 
                    items={currentItem.languages} 
                    {isInEditMode} 
                    onItemsChange={it => currentItem.languages = it} />
            </div>
        {/if}

        {#if isInEditMode || notEmpty(currentItem.challengeRating)}
            <div class="base-info-item">
                <ChallengeRating {currentItem} {isInEditMode} />
            </div>
        {/if}
    </div>
</div>

<style>
    .base-info-line {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;            
        justify-content: flex-start; 
        align-items: center;
        gap: 0;                       
        list-style: none;
        padding: 0;
        margin: 0;
        overflow: hidden;         
        text-indent: 0 !important;     
    }

    ul.base-info-line,
    .base-info-line {
        padding-left: 0 !important;
        padding-inline-start: 0 !important;
        margin-left: 0 !important;
        margin-inline-start: 0 !important;
        list-style: none !important;
    }

    .base-info-line-item {
        display: inline-flex;
        align-items: center;
        gap: 0px;
        flex: 0 0 auto;
        min-width: 0;
        background: transparent;
        margin-left: 0 !important;
        padding-left: 0 !important;
    }

    .base-info-line-item + .base-info-line-item::before {
        content: "•";
        opacity: 0.5;
        padding: 0 8px;
    }

    .base-info-block {
        margin: 0.5em 0 0.5em
    }

    .base-info-item {
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        align-content: start;
        color: var(--text-color);
        gap: 4px;
        margin: 1px 0px 1px;
    }
</style>
