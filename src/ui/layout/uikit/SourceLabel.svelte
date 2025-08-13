<script lang="ts">
	import type { Source } from "src/domain/models/common/Source";

    interface Props {
        source: Source;
    }

    let { source }: Props = $props();
</script>

<div class="source {source.homebrew ? 'homebrew' : 'official'}">
    {source.shortName}{source.group.shortName != "Basic" ? "*" : ""}
</div>

<style>
    .source {
        margin-left: 8px;
        padding: 0 6px;
        font-size: 10px;
        color: var(--text-color);
        border: 1px solid var(--text-color);
        border-radius: 20px;
    }

    .official {
        background: #00000040;
    }

    .homebrew {
        background: #00800040;
    }
</style>