<script lang="ts">
    import type { FullRace } from 'src/domain/models/race/FullRace';
    import type { IUiEventListener } from 'src/domain/listeners/ui_event_listener';
    import HeaderFullUi from '../uikit/HeaderFullUi.svelte';
    import HtmlBlock from '../uikit/HtmlBlock.svelte';

    interface Props {
        currentItem: FullRace,
        uiEventListener: IUiEventListener,
    }
    let { currentItem, uiEventListener }: Props = $props();

    // Format abilities as a readable string
    const abilitiesText = currentItem.abilities
        .map(a => a.value !== 0 ? `${a.name}: ${a.value > 0 ? '+' : ''}${a.value}` : a.name)
        .join(', ');

    // Format speed as a readable string
    const speedText = currentItem.speed
        .filter(s => s.value && s.value > 0)
        .map(s => s.name ? `${s.name}: ${s.value} фт.` : `${s.value} фт.`)
        .join(', ');

    // Format skills
    const hasSkills = currentItem.skills && currentItem.skills.length > 0;

    // Get image for header
    const images = currentItem.image ? [currentItem.image] : undefined;

    // Copy to clipboard
    const copyToClipboard = () => {
        const text = `\`\`\`race\n${currentItem.url}\n\`\`\``;
        navigator.clipboard.writeText(text);
    };
</script>

<div class="full-item">
    <HeaderFullUi
        name={currentItem.name}
        type={currentItem.type.name}
        source={currentItem.source}
        onClick={copyToClipboard}
        {images}
        {uiEventListener}
    />

    <div class="race-details">
        {#if abilitiesText}
            <div class="race-details__row">
                <span class="race-details__label">Характеристики:</span>
                <span class="race-details__value">{abilitiesText}</span>
            </div>
        {/if}

        {#if currentItem.size}
            <div class="race-details__row">
                <span class="race-details__label">Размер:</span>
                <span class="race-details__value">{currentItem.size}</span>
            </div>
        {/if}

        {#if speedText}
            <div class="race-details__row">
                <span class="race-details__label">Скорость:</span>
                <span class="race-details__value">{speedText}</span>
            </div>
        {/if}

        {#if hasSkills}
            <div class="race-details__skills">
                <span class="race-details__label">Особенности:</span>
                <ul class="race-details__skills-list">
                    {#each currentItem.skills as skill}
                        <li>
                            <strong>{skill.name}</strong>
                            {#if skill.description}
                                <HtmlBlock htmlContent={skill.description} {uiEventListener} />
                            {/if}
                        </li>
                    {/each}
                </ul>
            </div>
        {/if}
    </div>

    {#if currentItem.description}
        <div class="race-details__content">
            <HtmlBlock htmlContent={currentItem.description} {uiEventListener} />
        </div>
    {/if}

    {#if currentItem.subraces && currentItem.subraces.length > 0}
        <div class="race-details__subraces">
            <h3>Разновидности</h3>
            {#each currentItem.subraces as subrace}
                <details class="race-details__subrace">
                    <summary class="race-details__subrace-header">
                        <span class="race-details__subrace-chevron"></span>
                        <span class="race-details__subrace-title">{subrace.name.rus}</span>
                        <span class="race-details__subrace-eng">[{subrace.name.eng}]</span>
                    </summary>
                    <div class="race-details__subrace-content">
                        {#if subrace.abilities && subrace.abilities.length > 0}
                            <div class="race-details__row">
                                <span class="race-details__label">Характеристики:</span>
                                <span class="race-details__value">
                                    {subrace.abilities
                                        .map(a => a.value !== 0 ? `${a.name}: ${a.value > 0 ? '+' : ''}${a.value}` : a.name)
                                        .join(', ')}
                                </span>
                            </div>
                        {/if}

                        {#if subrace.skills && subrace.skills.length > 0}
                            <ul class="race-details__skills-list">
                                {#each subrace.skills as skill}
                                    <li>
                                        <strong>{skill.name}</strong>
                                        {#if skill.description}
                                            <HtmlBlock htmlContent={skill.description} {uiEventListener} />
                                        {/if}
                                    </li>
                                {/each}
                            </ul>
                        {/if}

                        {#if subrace.description}
                            <div class="race-details__subrace-description">
                                <HtmlBlock htmlContent={subrace.description} {uiEventListener} />
                            </div>
                        {/if}
                    </div>
                </details>
            {/each}
        </div>
    {/if}
</div>

<style>
    .race-details {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
        background: #ffffff14;
        border-radius: 8px;
        margin-bottom: 1em;
    }

    .race-details__row {
        display: flex;
        gap: 8px;
    }

    .race-details__label {
        font-weight: bold;
        flex-shrink: 0;
    }

    .race-details__value {
        flex: 1;
    }

    .race-details__skills {
        margin-top: 8px;
    }

    .race-details__skills-list {
        margin: 8px 0 0 0;
        padding-left: 20px;
    }

    .race-details__skills-list li {
        margin-bottom: 8px;
    }

    .race-details__content {
        margin-bottom: 1em;
    }

    .race-details__subraces {
        margin-top: 1em;
        padding-top: 1em;
        border-top: 1px solid #ffffff30;
    }

    .race-details__subraces h3 {
        margin-bottom: 1em;
    }

    .race-details__subrace {
        background: #ffffff0a;
        border-radius: 8px;
        margin-bottom: 1em;
        overflow: hidden;
    }

    .race-details__subrace-header {
        display: flex;
        align-items: baseline;
        gap: 8px;
        padding: 12px;
        cursor: pointer;
        user-select: none;
        transition: background 0.2s ease;
        list-style: none;
    }

    .race-details__subrace-header::-webkit-details-marker {
        display: none;
    }

    .race-details__subrace-header:hover {
        background: #ffffff14;
    }

    .race-details__subrace[open] .race-details__subrace-header {
        background: #ffffff14;
        border-bottom: 1px solid #ffffff20;
    }

    .race-details__subrace-chevron {
        display: inline-block;
        width: 0;
        height: 0;
        border-left: 5px solid currentColor;
        border-top: 4px solid transparent;
        border-bottom: 4px solid transparent;
        transition: transform 0.2s ease;
        flex-shrink: 0;
        margin-top: 4px;
    }

    .race-details__subrace[open] .race-details__subrace-chevron {
        transform: rotate(90deg);
    }

    .race-details__subrace-title {
        font-weight: bold;
        font-size: 1.1em;
    }

    .race-details__subrace-eng {
        opacity: 0.75;
        font-size: 12px;
    }

    .race-details__subrace-content {
        padding: 12px;
    }

    .race-details__subrace-description {
        margin-top: 8px;
    }
</style>
