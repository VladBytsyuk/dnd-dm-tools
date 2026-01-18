import { parseYaml } from "obsidian";
import type { Encounter } from "src/domain/models/encounter/Encounter";
import DndStatblockPlugin from "src/main";
import { mount } from "svelte";
import InitiativeTracker from "../../layout/tracker/InitiativeTracker.svelte";
import type { Bestiary } from "src/domain/repositories/Bestiary";
import type { Repository } from "../../../domain/repositories/Repository";
import type { DmScreenItem } from "../../../domain/models/dm_screen/DmScreenItem";
import type { IUiEventListener } from "../../../domain/listeners/ui_event_listener";

export function registerEncounterMdCodeBlockProcessor(
    plugin: DndStatblockPlugin,
    bestiary: Bestiary,
    dmScreen: Repository<DmScreenItem, DmScreenItem, any>,
    uiEventListener: IUiEventListener,
) {
    plugin.registerMarkdownCodeBlockProcessor(
        'encounter', 
        (source, el) => encounterMdCodeBlockProcessor(plugin, source, el, bestiary, dmScreen, uiEventListener),
    );
}

async function encounterMdCodeBlockProcessor(
    plugin: DndStatblockPlugin,
    source: string,
    el: HTMLElement,
    bestiary: Bestiary,
    dmScreen: Repository<DmScreenItem, DmScreenItem, any>,
    uiEventListener: IUiEventListener,
) {
    const parameters = parseYaml(source);
    const encounter: Encounter = parameters as Encounter;

    const openBestiary = async (url: string) => {
        const fullMonster = await bestiary.getFullItemByUrl(url);
        if (fullMonster) plugin.bestiaryFeature.sidePanel?.open(fullMonster);
    }

    const openCondition = async (url: string) => {
        const condition = await dmScreen.getFullItemByUrl(url);
        if (condition) plugin.dmScreenFeature.sidePanel?.open(condition);
    }

    el.empty();

    mount(InitiativeTracker, {
        target: el,
        props: {
            app: plugin.app,
            encounter: encounter,
            isEditable: false,
            onPortraitClick: openBestiary,
            onConditionClick: openCondition,
            onImageRequested: async (it: string) => await uiEventListener.onImageRequested(it),
        },
    });
}
