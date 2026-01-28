<script lang="ts">
    import type { FullRace } from 'src/domain/models/race/FullRace';
    import type { IUiEventListener } from 'src/domain/listeners/ui_event_listener';
    import RaceHeaderFullUi from './RaceHeaderFullUi.svelte';
    import RaceSkill from './RaceSkill.svelte';
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

    // Filter subrace skills that are not duplicates of parent race skills
    const getUniqueSubraceSkills = (subraceSkills: typeof currentItem.skills) => {
        if (!subraceSkills) return [];
        return subraceSkills.filter(subraceSkill =>
            !currentItem.skills?.some(parentSkill =>
                parentSkill.name === subraceSkill.name &&
                parentSkill.description === subraceSkill.description
            )
        );
    };

    // Get image for header
    const images = currentItem.image ? [currentItem.image] : undefined;

    // Format subraces for header links
    const subraceLinks = currentItem.subraces?.map((s, index) => ({ name: s.name.rus, id: `subrace-${index}` }));

    // Track which subrace is open (only one at a time)
    let openSubraceIndex: number | null = $state(null);

    // Toggle subrace open/closed
    const toggleSubrace = (index: number) => {
        openSubraceIndex = openSubraceIndex === index ? null : index;
    };

    // Scroll to subrace and open it
    const scrollToSubrace = (id: string) => {
        const index = parseInt(id.replace('subrace-', ''));
        openSubraceIndex = index;
        // Use setTimeout to allow the DOM to update before scrolling
        setTimeout(() => {
            const element = document.getElementById(id);
            element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 0);
    };

    // Copy to clipboard
    const copyToClipboard = () => {
        const text = `\`\`\`race\n${currentItem.url}\n\`\`\``;
        navigator.clipboard.writeText(text);
    };
</script>

<div class="full-item">
    <RaceHeaderFullUi
        name={currentItem.name}
        type={currentItem.type.name}
        source={currentItem.source}
        onClick={copyToClipboard}
        {images}
        {uiEventListener}
        abilities={abilitiesText}
        size={currentItem.size}
        speed={speedText}
        subraces={subraceLinks}
        onSubraceClick={scrollToSubrace}
    />

    {#if hasSkills}
        <div class="race-skills">
            {#each currentItem.skills as skill}
                <RaceSkill
                    name={skill.name}
                    description={skill.description}
                    {uiEventListener}
                />
            {/each}
        </div>
    {/if}

    {#if currentItem.description}
        <div class="race-details__content">
            <HtmlBlock htmlContent={currentItem.description} {uiEventListener} />
        </div>
    {/if}

    {#if currentItem.subraces && currentItem.subraces.length > 0}
        <div class="race-details__subraces">
            <h3>Разновидности</h3>
            {#each currentItem.subraces as subrace, index}
                <details class="race-details__subrace" id="subrace-{index}" open={openSubraceIndex === index}>
                    <summary class="race-details__subrace-header" onclick={(e) => { e.preventDefault(); toggleSubrace(index); }}>
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

                        {#each getUniqueSubraceSkills(subrace.skills) as skill}
                            <RaceSkill
                                name={skill.name}
                                description={skill.description}
                                {uiEventListener}
                            />
                        {/each}

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
    .full-item {
        margin: 0;
        padding: 0;
    }

    .race-skills {
        margin: 1em;
    }

    .race-details__content {
        padding: 12px;
        -moz-background-inline-policy: 1em;
    }

    .race-details__subraces {
        margin: 1em;
        padding: 12px;
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

    .race-details__row {
        display: flex;
        gap: 8px;
        margin-bottom: 1em;
    }

    .race-details__label {
        font-weight: bold;
        flex-shrink: 0;
    }

    .race-details__value {
        flex: 1;
    }

    .race-details__subrace-description {
        margin-top: 8px;
    }
</style>
