import { MarkdownPostProcessorContext, parseYaml, stringifyYaml } from "obsidian";
import DndStatblockPlugin from "src/main";
import { Bestiary } from "src/data/bestiary";
import { type FullMonster } from "src/domain/monster";
import { renderLayout5e } from "./layout/layout_5e";

export function registerMonsterMdCodeBlockProcessor(
    plugin: DndStatblockPlugin,
    bestiary: Bestiary,
) {
    plugin.registerMarkdownCodeBlockProcessor(
        'statblock', 
        (source, el, context) => monsterMdCodeBlockProcessor(source, el, context, bestiary),
    );
}

async function monsterMdCodeBlockProcessor(
    source: string,
    el: HTMLElement,
    context: MarkdownPostProcessorContext,
    bestiary: Bestiary,
) {
    const parameters = parseYaml(source);
    if (!parameters.creature) return;

    const isTwoColumns = parameters.twoColumns ?? false

    const fullMonster = await bestiary.getFullMonsterByName(parameters.creature);
    if (fullMonster == null) return;

    renderLayout5e(el, fullMonster, isTwoColumns);
}
