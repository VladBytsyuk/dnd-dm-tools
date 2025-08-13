import { parseYaml } from "obsidian";
import DndStatblockPlugin from "src/main";
import MonsterFullUi from "src/ui/layout/monster/MonsterFullUi.svelte";
import { mount } from "svelte";
import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
import type { Bestiary } from "src/domain/repositories/Bestiary";
import type { FullMonster } from "src/domain/models/monster/FullMonster";

export function registerMonsterMdCodeBlockProcessor(
    plugin: DndStatblockPlugin,
    bestiary: Bestiary,
    uiEventListener: IUiEventListener,
) {
    plugin.registerMarkdownCodeBlockProcessor(
        'statblock', 
        (source, el, context) => monsterMdCodeBlockProcessor(source, el, bestiary, uiEventListener),
    );
}

async function monsterMdCodeBlockProcessor(
    source: string,
    el: HTMLElement,
    bestiary: Bestiary,
    uiEventListener: IUiEventListener,
) {
    const parameters = parseYaml(source);
    if (!parameters.creature) return;

    const isTwoColumns = parameters.twoColumns ?? false;

    let monster: FullMonster
    if (!parameters.name) {
        const fullMonster = await bestiary.getFullItemByUrl(parameters.creature);
        if (fullMonster == null) return;

        monster = fullMonster;
    } else {
        monster = parameters as FullMonster
    }

    mount(MonsterFullUi, {
        target: el,
        props: {
            currentItem: monster,
            isTwoColumns: isTwoColumns,
            uiEventListener: uiEventListener,
        },
    });
}
