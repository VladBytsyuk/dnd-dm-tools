import { parseYaml } from "obsidian";
import DndStatblockPlugin from "src/main";
import { Bestiary } from "src/data/bestiary";
import { type FullMonster } from "src/domain/monster";
import { MonsterLayoutManager } from "../settings/monster_layout_manager";

export function registerMonsterMdCodeBlockProcessor(
    plugin: DndStatblockPlugin,
    bestiary: Bestiary,
    layoutManager: MonsterLayoutManager,
) {
    plugin.registerMarkdownCodeBlockProcessor(
        'statblock', 
        (source, el, context) => monsterMdCodeBlockProcessor(source, el, bestiary, layoutManager),
    );
}

async function monsterMdCodeBlockProcessor(
    source: string,
    el: HTMLElement,
    bestiary: Bestiary,
    layoutManager: MonsterLayoutManager,
) {
    const parameters = parseYaml(source);
    if (!parameters.creature) return;

    const isTwoColumns = parameters.twoColumns ?? false

    let monster: FullMonster
    if (!parameters.name) {
        const fullMonster = await bestiary.getFullMonsterByName(parameters.creature);
        if (fullMonster == null) return;

        monster = fullMonster;
    } else {
        monster = parameters as FullMonster
    }

    layoutManager.renderLayout(el, monster, isTwoColumns);
}
