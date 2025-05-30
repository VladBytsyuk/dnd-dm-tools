<script lang="ts">
    let { smallSpell, onClick } = $props();
    const { name, school, level, source, components } = smallSpell;
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (because of no reason) -->
<div class="bestiary-small" onclick={() => onClick(smallSpell)}>
    <div class="rating">
        <span>{level}</span>
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
            <div class="type">{school}</div>
            <div class="components">{components.v ? 'В' : '•'} {components.s ? 'С' : '•'} {components.m ? 'М' : '•'}</div>
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
        background: #1a2127;
        border-radius: 12px;
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
        color: #fff;
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
        color: #fff;
        text-overflow: ellipsis;
    }

    .name--rus {
        display: inline;
        max-width: 100%;
        color: #fff;
    }

    .name--eng {
        display: inline;
        color: #a4a4a4;
    }

    .source {
        margin-left: 8px;
        padding: 0 6px;
        font-size: 10px;
        color: #c3d1da;
        background: #1a2127;
        border: 1px solid #ffffff8a;
        border-radius: 20px;
    }

    .type {
        font-size: 13px;
        line-height: normal;
        width: 100%;
        color: #a4a4a4;
    }

    .components {
        margin-left: 8px;
        padding: 0 6px;
        font-size: 12px;
        line-height: normal;
        color: #a4a4a4;
    }
</style>