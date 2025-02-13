import { MarkdownPostProcessorContext, MarkdownView, parseYaml, stringifyYaml } from "obsidian";
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
        (source, el, context) => monsterMdCodeBlockProcessor(plugin, source, el, context, bestiary),
    );
}

async function monsterMdCodeBlockProcessor(
    plugin: DndStatblockPlugin,
    source: string,
    el: HTMLElement,
    context: MarkdownPostProcessorContext,
    bestiary: Bestiary,
) {
    const parameters = parseYaml(source);
    if (!parameters.creature) return;

    const isTwoColumns = parameters.twoColumns ?? false

    let monster: FullMonster
    if (!parameters.name) {
        const fullMonster = await bestiary.getFullMonsterByName(parameters.creature);
        if (fullMonster == null) return;

        monster = fullMonster;

        addMonsterToSource(plugin, fullMonster, source, el, context);
    } else {
        monster = parameters as FullMonster
    }

    renderLayout5e(el, monster, isTwoColumns);
}

function addMonsterToSource(
    plugin: DndStatblockPlugin,
    monster: FullMonster,
    source: string,
    el: HTMLElement,
    context: MarkdownPostProcessorContext,
) {
    // Парсим исходные параметры из блока кода
    const parameters = parseYaml(source);
    // Объединяем параметры с данными монстра, сохраняя исходный параметр `creature`
    const mergedParams = { ...parameters, ...monster };
    mergedParams.creature = parameters.creature;

    // Генерируем YAML и формируем новый блок кода
    const yamlContent = stringifyYaml(mergedParams).trim();
    const newBlock = `\`\`\`statblock\n${yamlContent}\n\`\`\``;

    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
/*
    // Make sure the user is editing a Markdown file.
    if (view) {
        const cursor = view.editor.getCursor();
        console.log(`cursor ${cursor}`);

        view.editor.replaceRange(newBlock, cursor)
        console.log(`editor ${view.editor}`);
        console.log(`block replaced`);
    }
*/
}
