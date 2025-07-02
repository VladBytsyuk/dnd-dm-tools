import { parseYaml, stringifyYaml, type MarkdownPostProcessorContext } from "obsidian";
import type { Encounter } from "src/domain/encounter";
import DndStatblockPlugin from "src/main";
import { InitiativeTrackerView } from "src/ui/layout/tracker/InitiativeTrackerView";
import { openSidePanelBestiary } from "../ribbon/side_panel_bestiary";
import type { IBestiary } from "src/data/bestiary";

export function registerEncounterMdCodeBlockProcessor(
    plugin: DndStatblockPlugin,
    bestiary: IBestiary,
) {
    plugin.registerMarkdownCodeBlockProcessor(
        'encounter', 
        (source, el, context) => encounterMdCodeBlockProcessor(plugin, source, el, bestiary, context),
    );
}

async function encounterMdCodeBlockProcessor(
    plugin: DndStatblockPlugin,
    source: string,
    el: HTMLElement,
    bestiary: IBestiary,
    context: MarkdownPostProcessorContext,

) {
    const parameters = parseYaml(source);
    let encounter: Encounter = parameters as Encounter;

    const editor = plugin.app.workspace.activeEditor?.editor;
    const updateSource = async (newContent: string) => {
        if (!editor) return;
        
        const sectionInfo = context.getSectionInfo(el);
        if (!sectionInfo) return;

        editor.replaceRange(
            `\`\`\`encounter\n${newContent}\`\`\`\n`,
            { line: sectionInfo.lineStart, ch: 0 },
            { line: sectionInfo.lineEnd + 1, ch: 0 }
        );
    };

    const openBestiary = async (url: string) => {
        const fullMonster = await bestiary.getFullMonsterByUrl(url);
        if (fullMonster) openSidePanelBestiary(plugin.app.workspace, fullMonster);
    }

    el.empty();
    new InitiativeTrackerView(
        plugin.app, 
        encounter,
        (newEncounter) => {}/*updateSource(stringifyYaml(newEncounter))*/,
        openBestiary,
    ) //TODO: rework auto-update source
        .render(el);
}
