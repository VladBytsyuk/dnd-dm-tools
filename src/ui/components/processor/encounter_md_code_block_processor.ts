import { parseYaml } from "obsidian";
import type { Encounter } from "src/domain/models/encounter/Encounter";
import DndStatblockPlugin from "src/main";
import { mount } from "svelte";
import InitiativeTracker from "./../../layout/tracker/InitiativeTracker.svelte";
import type { Bestiary } from "src/domain/repositories/Bestiary";

export function registerEncounterMdCodeBlockProcessor(
    plugin: DndStatblockPlugin,
    bestiary: Bestiary,
) {
    plugin.registerMarkdownCodeBlockProcessor(
        'encounter', 
        (source, el) => encounterMdCodeBlockProcessor(plugin, source, el, bestiary),
    );
}

async function encounterMdCodeBlockProcessor(
    plugin: DndStatblockPlugin,
    source: string,
    el: HTMLElement,
    bestiary: Bestiary,

) {
    const parameters = parseYaml(source);
    let encounter: Encounter = parameters as Encounter;

    const openBestiary = async (url: string) => {
        const fullMonster = await bestiary.getFullItemByUrl(url);
        if (fullMonster) plugin.bestiaryFeature.sidePanel?.open(fullMonster);
    }

    el.empty();

    mount(InitiativeTracker, {
        target: el,
        props: {
            app: plugin.app,
            encounter: encounter,
            isEditable: false,
            onPortraitClick: openBestiary,
        },
    });
}
