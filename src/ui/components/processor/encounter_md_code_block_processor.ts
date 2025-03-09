import { parseYaml } from "obsidian";
import type { Encounter } from "src/domain/encounter";
import DndStatblockPlugin from "src/main";
import { InitiativeTrackerView } from "src/ui/layout/tracker/InitiativeTrackerView";

export function registerEncounterMdCodeBlockProcessor(
    plugin: DndStatblockPlugin,
) {
    plugin.registerMarkdownCodeBlockProcessor(
        'encounter', 
        (source, el, context) => encounterMdCodeBlockProcessor(source, el),
    );
}

async function encounterMdCodeBlockProcessor(
    source: string,
    el: HTMLElement,
) {
    const parameters = parseYaml(source);
    let encounter: Encounter = parameters as Encounter;
    el.empty();
    new InitiativeTrackerView(encounter).render(el);
}
