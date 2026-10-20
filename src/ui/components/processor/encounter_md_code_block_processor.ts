import { MarkdownRenderChild, parseYaml, type MarkdownPostProcessorContext } from "obsidian";
import type { Encounter } from "src/domain/models/encounter/Encounter";
import type DndStatblockPlugin from "src/main";
import { mount, unmount } from "svelte";
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
        (source, el, context) => encounterMdCodeBlockProcessor(plugin, source, el, bestiary, dmScreen, uiEventListener, context),
    );
}

async function encounterMdCodeBlockProcessor(
    plugin: DndStatblockPlugin,
    source: string,
    el: HTMLElement,
    bestiary: Bestiary,
    dmScreen: Repository<DmScreenItem, DmScreenItem, any>,
    uiEventListener: IUiEventListener,
    context: MarkdownPostProcessorContext,
) {
    el.classList.add("dnd-ui");
    el.replaceChildren();
    try {
        const encounter = parseYaml(source) as Encounter;
        if (!encounter || typeof encounter.name !== "string" || !Array.isArray(encounter.participants)
            || encounter.participants.some((participant) => !participant || !Number.isFinite(participant.id) || typeof participant.name !== "string"
                || (participant.conditions !== undefined && !Array.isArray(participant.conditions)))
            || new Set(encounter.participants.map((participant) => participant.id)).size !== encounter.participants.length) {
            throw new Error("Некорректный блок encounter.");
        }

        const openBestiary = async (url: string) => {
            const fullMonster = await bestiary.getFullItemByUrl(url);
            if (fullMonster) plugin.bestiaryFeature.sidePanel?.open(fullMonster);
        }

        const openCondition = async (url: string) => {
            const condition = await dmScreen.getFullItemByUrl(url);
            if (condition) plugin.dmScreenFeature.sidePanel?.open(condition);
        }

        const component = mount(InitiativeTracker, {
            target: el,
            props: {
                app: plugin.app,
                encounter: encounter,
                isEditable: false,
                onAddToTracker: (value: Encounter) => plugin.addEncounterToTracker(value),
                onPortraitClick: openBestiary,
                onConditionClick: openCondition,
                onImageRequested: async (it: string) => await uiEventListener.onImageRequested(it),
                onOwlbearSnapshotCreated: async () => {},
                onOwlbearTurnChanged: async () => {},
            },
        });
        class EncounterChild extends MarkdownRenderChild {
            onunload() { void unmount(component); }
        }
        context.addChild(new EncounterChild(el));
    } catch (error) {
        const message = document.createElement("p");
        message.textContent = error instanceof Error ? error.message : "Некорректный блок encounter.";
        el.appendChild(message);
    }
}
