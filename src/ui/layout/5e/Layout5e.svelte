<script lang="ts">
    import { TEXTS } from "src/res/texts_ru";
    import { copyMonsterToClipboard } from "src/data/clipboard";

    let { monster, isTwoColumns } = $props()

    const formatModifier = (value: number) => {
        const mod = Math.floor((value - 10) / 2);
        return mod >= 0 ? `+${mod}` : mod.toString();
    };

    const joinList = (items: Array<{ name: string }>) => 
        items?.map(it => it.name).join(', ') || '';
</script>
  
<div class="layout-5e">
    <div class={`layout-5e-statblock ${isTwoColumns ? 'layout-5e-statblock-wide' : ''}`}>
        <!-- Left Section -->
        <div class="layout-5e-statblock-section">
            <!-- Header -->
            <div class="layout-5e-statblock-header">
                <div class="layout-5e-statblock-header-name">{monster.name.rus}</div>
                {#if monster.size || monster.type || monster.alignment}
                <div class="layout-5e-statblock-header-subtitle">
                    {[monster.size?.rus, monster.type?.name].filter(Boolean).join(' ')}
                    {monster.alignment ? `, ${monster.alignment}` : ''}
                </div>
                {/if}
            </div>

            <svg class="tapered-rule" height="5" width="100%">
                <polyline points="0,0 400,2.5 0,5" />
            </svg>

            <!-- Base Info -->
            <div class="layout-5e-statblock-base-info">
                {#if monster.armorClass}
                <div class="layout-5e-statblock-base-info-item">
                    <b>{TEXTS.layoutArmorClass}:</b> 
                    {monster.armorClass}
                    {#if monster.armors?.length}
                    ({joinList(monster.armors)})
                    {/if}
                </div>
                {/if}

                <!-- Similar blocks for hits, speed, etc -->
            </div>

            <!-- Scores Table -->
            {#if monster.ability}
                <div class="layout-5e-statblock-scores-table">
                {#each Object.entries({
                    [TEXTS.layoutStr]: monster.ability.str,
                    [TEXTS.layoutDex]: monster.ability.dex,
                    [TEXTS.layoutCon]: monster.ability.con,
                    [TEXTS.layoutInt]: monster.ability.int,
                    [TEXTS.layoutWis]: monster.ability.wiz,
                    [TEXTS.layoutCha]: monster.ability.cha
                }) as entry}
                    <div class="layout-5e-statblock-scores-table-item">
                    <div class="layout-5e-statblock-scores-table-item-title"><b>{entry[0]}</b></div>
                    <div>{[1]} ({formatModifier(entry[1])})</div>
                    </div>
                {/each}
                </div>
            {/if}
        </div>

        <!-- Right Section -->
        <div class="layout-5e-statblock-section">
            <!-- Abilities Block -->
            {#if monster.feats}
                <div class="layout-5e-statblock-property-block">
                {#each monster.feats as feat}
                    <div><b>{feat.name}.</b> {@html feat.value.replace(/<\/?p>/g, '')}</div>
                {/each}
                </div>
            {/if}

            <!-- Action Blocks -->
            {#each [
                { action: monster.actions, title: TEXTS.layoutActions},
                { action: monster.bonusActions, l: TEXTS.layoutBonusActions},
                { action: monster.reactions, l: TEXTS.layoutReactions}
            ] as item}
                {#if item.action != undefined} 
                    {#if item.action.length}
                    <div class="layout-5e-statblock-property-block">
                        <div class="layout-5e-statblock-block-header">{item.title}</div>
                        {#each item.action as action}
                        <div><b>{action.name}.</b> {@html action.value.replace(/<\/?p>/g, '')}</div>
                        {/each}
                    </div>
                    {/if}
                {/if}
            {/each}
        </div>
    </div>

    <!-- Copy Button -->
    <svg
        class="layout-5e-copy-button"
        on:click={() => copyMonsterToClipboard(monster)}
        on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { copyMonsterToClipboard(monster)} } }
        aria-label="Copy monster to clipboard"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
    >
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
        <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        <path d="M16 4h2a2 2 0 0 1 2 2v4" />
        <path d="M21 14H11" />
        <path d="m15 10-4 4 4 4" />
    </svg>
</div>

<style>
    .layout-5e {
        display: inline-block;
        position: relative;
    }

    .layout-5e-copy-button {
        display: inline-block;
        width: 16px;
        height: 16px;
        position: absolute;
        top: 8px;
        right: 40px;
        z-index: 1;
        color: #922610af;
    }

    .layout-5e-statblock {
        text-align: left;
        font-size: 12.5px;
        line-height: 1.2em;
        display: inline-block;
        vertical-align: top;
        width: 100%;
        background: #FDF1DC;
        background-size: cover;
        background-position: center;
        padding: 1em;
        box-sizing: border-box;
        font-family: 'Noto Sans', 'Myriad Pro', Calibri, Helvetica, Arial, sans-serif;
    }

    .layout-5e-statblock-wide {
        text-align: left;
        font-size: 12.5px;
        line-height: 1.2em;
        display: flex;
        gap: 1em;
        vertical-align: top;
        width: 100%;
        background: #FDF1DC;
        background-size: cover;
        background-position: center;
        padding: 1em;
        box-sizing: border-box;
        font-family: 'Noto Sans', 'Myriad Pro', Calibri, Helvetica, Arial, sans-serif;
    }

    .layout-5e-statblock-section {
        flex: 1;
    }

    .layout-5e-statblock-header {
        margin: 0 0 0.5em;
    }

    .layout-5e-statblock-header-name {
        font-family: 'Libre Baskerville', 'Lora', 'Calisto MT', 'Bookman Old Style', Bookman, 'Goudy Old Style', Garamond, 'Hoefler Text', 'Bitstream Charter', Georgia, serif;
        color: #922610;
        font-size: 21px;
        line-height: 1.2em;
        margin: 0 0 2px;
        letter-spacing: 1px;
        font-variant: small-caps;
        font-weight: bold;
    }

    .layout-5e-statblock-header-subtitle {
        font-family: 'Noto Sans', 'Myriad Pro', Calibri, Helvetica, Arial, sans-serif;    
        color: #000000;
        opacity: 0.75;
        font-weight: normal;
        font-style: italic;
        font-size: 12px;
        line-height: 1.2em;
    }

    .layout-5e-statblock-base-info {
        margin: 0.5em 0 0.5em
    }

    .layout-5e-statblock-base-info-item {
        color: #922610;
        font-size: 12.5px;
        line-height: 1.2em;
    }

    .layout-5e-statblock-scores-table {
        text-align: center;
        color: #922610;
        margin: 0.5em 0 0.5em;
    }

    .layout-5e-statblock-scores-table-item {
        display: inline-block;
        vertical-align: middle;
        width: 15.5%;
        min-width: 40px;
        font-size: 12px;
        line-height: 1em;
    }

    .layout-5e-statblock-scores-table-item-title {
        margin: 0 0 0.5em;
    }

    .layout-5e-statblock-property-block {
        padding: 0.5em 0 0;
        color: #000000;
    }

    .layout-5e-statblock-block-header {
        border-bottom: 2px solid #7A200D;
        color: #7A200D;
        font-size: 18px;
        font-variant: small-caps;
        font-weight: normal;
        letter-spacing: 1px;
        margin: 0.5em 0 0.125em;
        padding: 0 0 6px;
        text-indent: 5px;
    }

    .layout-5e-statblock-generic-description {
        margin: 0.5em 0 0.125em;
    }

    .tapered-rule {
        display: block;
        width: 100%;
        height: 5px;
        border: none;
        color: #922610;
        fill: #922610;
    }
</style>
