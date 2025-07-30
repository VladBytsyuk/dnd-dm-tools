import { parseYaml } from "obsidian";
import DndStatblockPlugin from "src/main";
import { type IBestiary } from "src/data/bestiary";
import { type FullMonster } from "src/domain/monster";
import MonsterFullUi from "src/ui/layout/monster/MonsterFullUi.svelte";
import { mount } from "svelte";
import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";

export function registerMonsterMdCodeBlockProcessor(
    plugin: DndStatblockPlugin,
    bestiary: IBestiary,
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
    bestiary: IBestiary,
    uiEventListener: IUiEventListener,
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

    mount(MonsterFullUi, {
        target: el,
        props: {
            monster: monster,
            isTwoColumns: isTwoColumns,
            uiEventListener: uiEventListener,
        },
    });
}
