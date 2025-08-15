import { App, Notice, Workspace } from "obsidian";
import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
import { getImageSource } from "src/domain/utils/image_utils";
import type { Bestiary } from "src/domain/repositories/Bestiary";
import type { Spellbook } from "src/domain/repositories/Spellbook";
import type { DmScreen } from "src/domain/repositories/DmScreen";
import type { Arsenal } from "src/domain/repositories/Arsenal";
import type { Armory } from "src/domain/repositories/Armory";
import type { Equipment } from "src/domain/repositories/Equipment";
import type { Artifactory } from "src/domain/repositories/Artifactory";
import type { FullMonster } from "src/domain/models/monster/FullMonster";
import type { FullSpell } from "src/domain/models/spell/FullSpell";
import type { DmScreenItem } from "src/domain/models/dm_screen/DmScreenItem";
import type { FullWeapon } from "src/domain/models/weapon/FullWeapon";

export class UiEventListener implements IUiEventListener {

    // ---- constructor ----
    constructor(
        public app: App,
        public bestiary: Bestiary,
        public spellbook: Spellbook,
        public arsenal: Arsenal,
        public armory: Armory,
        public equipment: Equipment,
        public artifactory: Artifactory,
        public dmScreen: DmScreen, 
        public openBestiary: (fullMonster: FullMonster) => Promise<void>,
        public openSpellboook: (fullSpell: FullSpell) => Promise<void>,
        public openDmScreen: (dmScreenItem: DmScreenItem) => Promise<void>,
        public openArsenal: (fullWeapon: FullWeapon) => Promise<void>,
    ) {
        this.onBeastClick = this.onBeastClick.bind(this);
        this.onSpellClick = this.onSpellClick.bind(this);
        this.onWeaponClick = this.onWeaponClick.bind(this);
        this.onArmorClick = this.onArmorClick.bind(this);
        this.onScreenItemClick = this.onScreenItemClick.bind(this);
    }

    // ---- methods ----
    async onBeastClick(url: string): Promise<void> {
        const fullMonster = await this.bestiary.getFullItemByUrl(url);
        if (fullMonster) await this.openBestiary(fullMonster);
    }

    async onSpellClick(url: string): Promise<void> {
        const fullSpell = await this.spellbook.getFullItemByUrl(url);
        if (fullSpell) await this.openSpellboook(fullSpell);
    }

    async onWeaponClick(url: string): Promise<void> {
        const fullWeapon = await this.arsenal.getFullItemByUrl(url);
        if (fullWeapon) await this.openArsenal(fullWeapon);
    }

    async onArmorClick(url: string): Promise<void> {
        const fullArmor = await this.armory.getFullItemByUrl(url);
        //if (fullArmor) await openSidePanelSpellbook(this.app.workspace, fullArmor);
    }

    async onItemClick(url: string): Promise<void> {
        const fullItem = await this.equipment.getFullItemByUrl(url);
        // if (fullItem) await openSidePanelDmScreen(this.app.workspace, fullItem);
    }

    async onArtifactClick(url: string): Promise<void> {
        const fullArtifact = await this.artifactory.getFullItemByUrl(url);
        // if (fullArtifact) await openSidePanelDmScreen(this.app.workspace, fullArtifact);
    }

    async onScreenItemClick(url: string): Promise<void> {
        const screenItem = await this.dmScreen.getFullItemByUrl(url);
        if (screenItem) await this.openDmScreen(screenItem);
    }

    onDiceRoll(label: string, value: number): void {
        new Notice(`${label ? label + ": " : ""}${value}`);
    }

    async onImageRequested(imageUrl: string): Promise<string> {
        return await getImageSource(this.app, imageUrl)
    }
}
