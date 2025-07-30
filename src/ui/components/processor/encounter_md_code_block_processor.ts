import { parseYaml } from "obsidian";
import type { Encounter } from "src/domain/encounter";
import DndStatblockPlugin from "src/main";
import { openSidePanelBestiary } from "../ribbon/side_panel_bestiary";
import type { IBestiary } from "src/data/bestiary";
import { mount } from "svelte";
import InitiativeTracker from "./../../layout/tracker/InitiativeTracker.svelte";

export function registerEncounterMdCodeBlockProcessor(
    plugin: DndStatblockPlugin,
    bestiary: IBestiary,
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
    bestiary: IBestiary,

) {
    const parameters = parseYaml(source);
    let encounter: Encounter = parameters as Encounter;

    const openBestiary = async (url: string) => {
        const fullMonster = await bestiary.getFullMonsterByUrl(url);
        if (fullMonster) openSidePanelBestiary(plugin.app.workspace, fullMonster);
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
