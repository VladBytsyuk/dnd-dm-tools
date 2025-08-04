import { App, Notice, type Workspace } from "obsidian";
import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
import type { IBestiary } from "./bestiary";
import type { ISpellbook } from "./spellbook";
import type { IDmScreen } from "./dm_screen";
import { openSidePanelBestiary } from "src/ui/components/ribbon/side_panel_bestiary";
import { openSidePanelSpellbook } from "src/ui/components/ribbon/side_panel_spellbook";
import { openSidePanelDmScreen } from "src/ui/components/ribbon/side_panel_dm_screen";
import { getImageSource } from "src/domain/image_utils";

export class UiEventListener implements IUiEventListener {

    // ---- constructor ----
    constructor(
        public app: App,
        public bestiary: IBestiary,
        public spellbook: ISpellbook,
        public dmScreen: IDmScreen, 
    ) {
        this.onBeastClick = this.onBeastClick.bind(this);
        this.onSpellClick = this.onSpellClick.bind(this);
        this.onScreenItemClick = this.onScreenItemClick.bind(this);
    }

    // ---- methods ----
    async onBeastClick(url: string): Promise<void> {
        const fullMonster = await this.bestiary.getFullMonsterByUrl(url);
        if (fullMonster) await openSidePanelBestiary(this.app.workspace, fullMonster);
    }

    async onSpellClick(url: string): Promise<void> {
        const fullSpell = await this.spellbook.getFullSpellByUrl(url);
        if (fullSpell) await openSidePanelSpellbook(this.app.workspace, fullSpell);
    }

    async onScreenItemClick(url: string): Promise<void> {
        const screenItem = await this.dmScreen.getFullItemByUrl(url);
        if (screenItem) await openSidePanelDmScreen(this.app.workspace, screenItem);
    }

    onDiceRoll(label: string, value: number): void {
        new Notice(`${label ? label + ": " : ""}${value}`);
    }

    async onImageRequested(imageUrl: string): Promise<string> {
        return await getImageSource(this.app, imageUrl)
    }
}
