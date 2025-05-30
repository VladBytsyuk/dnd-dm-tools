<script lang="ts">
    let { smallMonster, onClick } = $props();
    const { name, type, challengeRating, source } = smallMonster;
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (because of no reason) -->
<div class="bestiary-small" onclick={() => onClick(smallMonster)}>
    <div class="rating">
        <span>{challengeRating}</span>
    </div>
    <div class="body">
        <div class="row">
            <div class="name">
                <span class="name--rus">{name.rus}</span>
                <span class="name--eng"> [{name.eng}]</span>
            </div>
            <div class="source">
                {source.shortName}{source.group.shortName != "Basic" ? "*" : ""}
            </div>
        </div>
        <div class="row">
            <div class="type">{type}</div>
        </div>
    </div>
</div>

<style>
    .bestiary-small {
        display: flex;
        flex-direction: row;
        align-items: initial;
        min-height: 38px;
        padding: 6px 12px;
        background: #00000040;
        border-radius: 12px;
    }

    .bestiary-small:hover {
        background: #00000060;
    }

    .rating {
        flex-shrink: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 32px;
        margin-left: -8px;
        text-align: center;
        font-weight: 900;
        color: var(--text-color);
    }

    .body {
        overflow: hidden;
        display: flex;
        flex: 1 1 100%;
        flex-direction: column;
        justify-content: center;
    }

    .row {
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
    }

    .name {
        overflow: hidden;
        display: inline-block;
        width: 100%;
        font-size: 14px;
        line-height: 19px;
        color: var(--text-color);
        text-overflow: ellipsis;
    }

    .name--rus {
        display: inline;
        max-width: 100%;
        color: var(--text-color);
    }

    .name--eng {
        display: inline;
        color: var(--text-color);
        opacity: 0.5;
    }

    .source {
        margin-left: 8px;
        padding: 0 6px;
        font-size: 10px;
        color: var(--text-color);
        border: 1px solid var(--text-color);
        border-radius: 20px;
    }

    .type {
        font-size: 13px;
        line-height: normal;
        color: var(--text-color);
        opacity: 0.5;
    }
</style>