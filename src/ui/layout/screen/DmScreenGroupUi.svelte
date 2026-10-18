<script lang="ts">
    import { SmallDmScreen } from "@dnd-dm-tools/design-system";

    let { icon, name, source, onclick, theme = "dark", favorite = false } = $props<{
        icon?: string;
        name: { rus: string; eng: string };
        source: string;
        onclick: () => void;
        theme?: "dark" | "light";
		favorite?: boolean;
    }>();

</script>

<SmallDmScreen icon={icon} title={name.rus} subtitle={name.eng} {source} {onclick} {favorite} {theme} />
