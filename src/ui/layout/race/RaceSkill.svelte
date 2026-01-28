<script lang="ts">
    import type { IUiEventListener } from 'src/domain/listeners/ui_event_listener';
    import HtmlBlock from '../uikit/HtmlBlock.svelte';

    interface Props {
        name: string;
        description?: string;
        uiEventListener: IUiEventListener;
    }

    let { name, description, uiEventListener }: Props = $props();
</script>

{#if description}
    <details class="race-skill" open>
        <summary class="race-skill__name">{name}</summary>
        <div class="race-skill__description">
            <HtmlBlock htmlContent={description} {uiEventListener} />
        </div>
    </details>
{:else}
    <div class="race-skill">
        <div class="race-skill__name">{name}</div>
    </div>
{/if}

<style>
    .race-skill {
        margin-bottom: 1em;
    }

    summary.race-skill__name {
        font-size: 1.1em;
        font-weight: bold;
        margin-bottom: 4px;
        cursor: pointer;
        list-style: none;
    }

    summary.race-skill__name::-webkit-details-marker {
        display: none;
    }

    div.race-skill__name {
        font-size: 1.1em;
        font-weight: bold;
        margin-bottom: 4px;
    }

    .race-skill__description {
        font-size: 0.95em;
        opacity: 0.9;
        margin-top: 4px;
    }
</style>
