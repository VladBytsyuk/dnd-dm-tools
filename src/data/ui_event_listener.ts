import { App, Notice } from "obsidian";
import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
import { openSidePanelBestiary } from "src/ui/components/ribbon/side_panel_bestiary";
import { openSidePanelSpellbook } from "src/ui/components/ribbon/side_panel_spellbook";
import { openSidePanelDmScreen } from "src/ui/components/ribbon/side_panel_dm_screen";
import { getImageSource } from "src/domain/utils/image_utils";
import type { Bestiary } from "src/domain/repositories/Bestiary";
import type { Spellbook } from "src/domain/repositories/Spellbook";
import type { DmScreen } from "src/domain/repositories/DmScreen";
import type { Arsenal } from "src/domain/repositories/Arsenal";

export class UiEventListener implements IUiEventListener {

    // ---- constructor ----
    constructor(
        public app: App,
        public bestiary: Bestiary,
        public spellbook: Spellbook,
        public arsenal: Arsenal,
        public dmScreen: DmScreen, 
    ) {
        this.onBeastClick = this.onBeastClick.bind(this);
        this.onSpellClick = this.onSpellClick.bind(this);
        this.onWeaponClick = this.onWeaponClick.bind(this);
        this.onScreenItemClick = this.onScreenItemClick.bind(this);
    }

    // ---- methods ----
    async onBeastClick(url: string): Promise<void> {
        const fullMonster = await this.bestiary.getFullItemByUrl(url);
        if (fullMonster) await openSidePanelBestiary(this.app.workspace, fullMonster);
    }

    async onSpellClick(url: string): Promise<void> {
        const fullSpell = await this.spellbook.getFullItemByUrl(url);
        if (fullSpell) await openSidePanelSpellbook(this.app.workspace, fullSpell);
    }

    async onWeaponClick(url: string): Promise<void> {
        const fullWeapon = await this.arsenal.getFullItemByUrl(url);
        //if (fullWeapon) await openSidePanelSpellbook(this.app.workspace, fullWeapon);
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
