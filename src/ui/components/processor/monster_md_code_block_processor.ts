import { parseYaml } from "obsidian";
import DndStatblockPlugin from "src/main";
import { type IBestiary } from "src/data/bestiary";
import { type FullMonster } from "src/domain/monster";
import type { UiEventListener } from "src/data/ui_event_listener";
import FullMonsterUi from "src/ui/layout/monster/FullMonsterUi.svelte";
import { mount } from "svelte";

export function registerMonsterMdCodeBlockProcessor(
    plugin: DndStatblockPlugin,
    bestiary: IBestiary,
    uiEventListener: UiEventListener,
) {
    plugin.registerMarkdownCodeBlockProcessor(
        'statblock', 
        (source, el, context) => monsterMdCodeBlockProcessor(source, el, bestiary, uiEventListener),
    );
}

async function monsterMdCodeBlockProcessor(
    source: string,
    el: HTMLElement,
    bestiary: IBestiary,
    uiEventListener: UiEventListener,
) {
    const parameters = parseYaml(source);
    if (!parameters.creature) return;

    const isTwoColumns = parameters.twoColumns ?? false;

    let monster: FullMonster
    if (!parameters.name) {
        const fullMonster = await bestiary.getFullMonsterByName(parameters.creature);
        if (fullMonster == null) return;

        monster = fullMonster;
    } else {
        monster = parameters as FullMonster
    }

    mount(FullMonsterUi, {
        target: el,
        props: {
            monster: monster,
            isTwoColumns: isTwoColumns,
            uiEventListener: uiEventListener,
        },
    });
}
