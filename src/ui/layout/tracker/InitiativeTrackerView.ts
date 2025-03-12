import type { App } from "obsidian";
import type { LayoutItemView } from "../LayoutItemView";
import InitiativeTracker from "./InitiativeTracker.svelte";
import type { Encounter } from "src/domain/encounter";
import { TEXTS } from "src/res/texts_ru";
import { mount, unmount } from "svelte";

const INITIATIVE_TRACKER_VIEW = "dnd-dm-tools-initiative-tracker";

export class InitiativeTrackerView implements LayoutItemView {

	// ---- fields ----
    #app: App;
    #component: ReturnType<typeof InitiativeTracker> | undefined;
    #encounter: Encounter;
    #onEncounterUpdate: (encounter: Encounter) => void;

    constructor(
        app: App,
        encounter: Encounter, 
        onEncounterUpdate: (encounter: Encounter) => void,
    ) {
        this.#app = app;
        this.#encounter = encounter;
        this.#onEncounterUpdate = onEncounterUpdate;
    }

	// ---- methods ----
    getViewType() { return INITIATIVE_TRACKER_VIEW; }
    getDisplayText() { return TEXTS.sidePanelInitiativeTrackerTitle; }

    render(container: Element) {
        this.#component = mount(InitiativeTracker, {
            target: container,
            props: {
                app: this.#app,
                encounter: this.#encounter,
                onUpdate: this.#onEncounterUpdate,
            },
        });
    }

    destroy() {
        if (this.#component) {
            unmount(this.#component);
            this.#component = undefined;
        }
    }
}
