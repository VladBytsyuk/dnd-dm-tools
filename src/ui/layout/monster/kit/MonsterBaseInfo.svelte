<script lang="ts">
	import { formatModifier } from 'src/domain/modifier';
	import { diceRoller, joinList, joinSpeed, separate } from 'src/domain/utils/utils';
	import HtmlBlock from '../../uikit/HtmlBlock.svelte';
	import type { FullMonster } from '../../../../domain/models/monster/FullMonster';
	import type { IUiEventListener } from '../../../../domain/listeners/ui_event_listener';
	import { Footprints, Heart, Shield } from 'lucide-svelte';

    let { 
		currentItem, 
		uiEventListener,
	} = $props<{
        currentItem: FullMonster;
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
                <div class="base-info-line-item-icon">
                    <Shield size="12" />
                </div>
                <span class="base-info-line-item-value">
                    <b>{currentItem.armorClass}</b>&nbsp;
                    {#if currentItem.armors?.length}
                    ({joinList(currentItem.armors)})
                    {/if}
                </span>
            </li>
        {/if}

        {#if currentItem.hits}
            <li class="base-info-line-item">
                <div class="base-info-line-item-icon">
                    <Heart size="12" />
                </div>
                <span class="base-info-line-item-value">
                    <b>{currentItem.hits.average}</b>&nbsp;(<dice-roller label="Хиты" formula="{currentItem.hits.formula}{currentItem.hits.sign}{currentItem.hits.bonus}">{currentItem.hits.formula}{currentItem.hits.sign}{currentItem.hits.bonus}</dice-roller>)
                </span>
            </li>
        {/if}

        {#if currentItem.speed}
            <li class="base-info-line-item">
                <div class="base-info-line-item-icon">
                    <Footprints size="12" />
                </div>
                {#if currentItem.speed?.length}
                    <span class="base-info-line-item-value">{joinSpeed(currentItem.speed)}</span>
                {/if}
            </li>
        {/if}
    </ul>

    <!-- Base Info 2 -->
    <div class="base-info-block">
        {#if notEmpty(currentItem.savingThrows)}
        <div class="base-info-item">
            <span class="base-info-item-title">Спасброски</span> 
            <HtmlBlock class="base-info-item-value"
                htmlContent={
                    separate(currentItem.savingThrows.map((it: { name: string; value: number }) => 
                        diceRoller(`Спасбросок. ${it.name}`, `к20${formatModifier(it.value)}`, `${it.name} ${formatModifier(it.value)}`)
                    ))
                }
                uiEventListener={uiEventListener}
            />
        </div>
        {/if}

        {#if notEmpty(currentItem.skills)}
        <div class="base-info-item">
            <span class="base-info-item-title">Навыки</span> 
            <HtmlBlock
                class="base-info-item-value"
                htmlContent={
                    separate(currentItem.skills.map((it: { name: string; value: number }) => 
                        diceRoller(`Навык. ${it.name}`, `к20${formatModifier(it.value)}`, `${it.name} ${formatModifier(it.value)}`)
                    ))
                }
                uiEventListener={uiEventListener}
            />
        </div>
        {/if}

        {#if notEmpty(currentItem.damageVulnerabilities)}
        <div class="base-info-item">
            <span class="base-info-item-title">Уязвимость к урону</span> 
            <span class="base-info-item-value">{separate(currentItem.damageVulnerabilities)}</span>
        </div>
        {/if}

        {#if notEmpty(currentItem.damageResistances)}
        <div class="base-info-item">
            <span class="base-info-item-title">Сопротивление к урону</span> 
            <span class="base-info-item-value">{separate(currentItem.damageResistances)}</span>
        </div>
        {/if}

        {#if notEmpty(currentItem.damageImmunities)}
        <div class="base-info-item">
            <span class="base-info-item-title">Иммунитет к урону</span> 
            <span class="base-info-item-value">{separate(currentItem.damageImmunities)}</span>
        </div>
        {/if}

        {#if notEmpty(currentItem.conditionImmunities)}
        <div class="base-info-item">
            <span class="base-info-item-title">Иммунитет к состоянию</span> 
            <span class="base-info-item-value">{separate(currentItem.conditionImmunities)}</span>
        </div>
        {/if}

        {#if notEmpty(currentItem.senses)}
        <div class="base-info-item">
            <span class="base-info-item-title">Чувства</span> 
            <span class="base-info-item-value">
                {currentItem.senses.senses ? 
                    separate(currentItem.senses.senses.map((it: { name: string; value: number }) => `${it.name} ${it.value} фт.,`)) : 
                    ''}
                пассивная внимательность {currentItem.senses.passivePerception}
            </span>
        </div>
        {/if}

        {#if notEmpty(currentItem.languages)}
        <div class="base-info-item">
            <span class="base-info-item-title">Языки</span> 
            <span class="base-info-item-value">{separate(currentItem.languages)}</span>
        </div>
        {/if}

        {#if notEmpty(currentItem.challengeRating)}
        <div class="base-info-item">
            <span class="base-info-item-title">Опасность</span> 
            <span class="base-info-item-value">
                {currentItem.challengeRating + (currentItem.experience ? ` (${currentItem.experience} XP)` : '')}
            </span>
        </div>
        {/if}
    </div>
</div>

<style>
    .base-info-line {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;            
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
        padding-inline-start: 0 !important; /* важнее для современных тем */
        margin-left: 0 !important;
        margin-inline-start: 0 !important;
        list-style: none !important;
    }

    .base-info-line-item {
        display: inline-flex;
        align-items: center;
        gap: 4px;
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

    .base-info-line-item-icon {
        display: block;        /* убирает baseline-смещение */
        width: 14px;           /* подгони под дизайн */
        height: 14px;
        flex-shrink: 0;
    }

    .base-info-line-item-value {
        color: var(--text-color);
        opacity: 0.75;
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
	    text-overflow: ellipsis;
        line-height: 1;
        display: inline-flex;
        align-items: center;
    }

    .base-info-block {
        margin: 0.5em 0 0.5em
    }

    .base-info-item {
        color: var(--text-color);
        gap: 4px;
        margin: 4px 0px 4px;
    }

    .base-info-item-title {
        color: var(--text-color);
        font-size: 12.5px;
        line-height: 1.2em;
        font-weight: bold;
    }

    .base-info-item-value {
        color: var(--text-color);
        opacity: 0.75;
        font-size: 12.5px;
        line-height: 1.2em;
    }
</style>
