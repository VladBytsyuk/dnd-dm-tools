<script lang="ts">
	import type { Source } from './../../../domain/models/common/Source.ts';
	import type { Name } from "../../../domain/models/common/Name";
	import type { Type } from "../../../domain/models/common/Type";

    interface Props {
        name: Name;
        type?: Type;
        source?: Source;
        onClick: () => void;
    }

    let { name, type, source, onClick }: Props = $props();
</script>

<div class="header">
    <div class="name-container">
        <div
            class="name-rus"
            role="button"
            tabindex="0"
            onclick={onClick}
            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onClick(); } }}
            aria-label="Скопировать в буфер обмена"
        >
            {name.rus} 📋
        </div>
        <div class="name-eng">{name.eng}</div>
    </div>
    <div class="info-container">
        {#if type}<div class="type">{type.name}</div>{/if}
        {#if source}<div class="source">Источник: {source.shortName}</div>{/if}
    </div>
</div>


<style>
    .header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1em;
    }

    .name-rus {
        font-size: 21px;
        line-height: 1.2em;
        margin: 0 0 2px;
        letter-spacing: 1px;
    }

    .name-eng {
        opacity: 0.75;
        font-size: 12px;
        margin: 0 0 2px;
    }

    .info-container {
        display: flex;
        gap: 12px;
        justify-content: space-between;
        padding: 12px;
        background: #ffffff14;
        border-radius: 8px;
    }

    .type {
        flex: 1 1 100%;
        margin-right: 8px;
        font-style: italic;
    }

    .source {
        flex-shrink: 0;
    }
</style>