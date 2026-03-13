import { App, Notice } from "obsidian";
import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
import { getImageSource } from "src/domain/utils/image_utils";
import type { BestiaryFeature } from "src/ui/components/feature/BestiaryFeature";
import type { SpellbookFeature } from "src/ui/components/feature/SpellbookFeature";
import type { ArsenalFeature } from "src/ui/components/feature/ArsenalFeature";
import type { DmScreenFeature } from "src/ui/components/feature/DmScreenFeature";
import type { BaseFeature } from "src/ui/components/feature/BaseFeature";
import type { ArmoryFeature } from "src/ui/components/feature/ArmoryFeature";
import type { EquipmentFeature } from "src/ui/components/feature/EquipmentFeature";
import type { ArtifactoryFeature } from "src/ui/components/feature/ArtifactoryFeature";
import type { BackgroundFeature } from "src/ui/components/feature/BackgroundFeature";
import type { RaceFeature } from "src/ui/components/feature/RaceFeature";
import type { ClassesFeature } from "src/ui/components/feature/ClassesFeature";
import type { CharacterSheetFeature } from "src/ui/components/feature/CharacterSheetFeature";
import type { RollTraceResult } from "../domain/dice";

export class UiEventListener implements IUiEventListener {

    // ---- constructor ----
    constructor(
        public app: App,
        private bestiaryFeatureProvider: () => BestiaryFeature,
        private spellbookFeatureProvider: () => SpellbookFeature,
        private arsenalFeatureProvider: () => ArsenalFeature,
        private armoryFeatureProvider: () => ArmoryFeature,
        private equipmentFeatureProvider: () => EquipmentFeature,
        private artifactoryFeatureProvider: () => ArtifactoryFeature,
        private backgroundFeatureProvider: () => BackgroundFeature,
        private featFeatureProvider: () => BaseFeature<any, any, any>,
        private raceFeatureProvider: () => RaceFeature,
        private classesFeatureProvider: () => ClassesFeature,
        private characterSheetFeatureProvider: () => CharacterSheetFeature,
        private dmScreenFeatureProvider: () => DmScreenFeature,
    ) {
        this.onBeastClick = this.onBeastClick.bind(this);
        this.onSpellClick = this.onSpellClick.bind(this);
        this.onWeaponClick = this.onWeaponClick.bind(this);
        this.onArmorClick = this.onArmorClick.bind(this);
        this.onItemClick = this.onItemClick.bind(this);
        this.onArtifactClick = this.onArtifactClick.bind(this);
        this.onScreenItemClick = this.onScreenItemClick.bind(this);
        this.onBackgroundClick = this.onBackgroundClick.bind(this);
        this.onFeatClick = this.onFeatClick.bind(this);
        this.onRaceClick = this.onRaceClick.bind(this);
        this.onClassClick = this.onClassClick.bind(this);
        this.onCharacterSheetClick = this.onCharacterSheetClick.bind(this);
    }

    // ---- methods ----
    async onBeastClick(url: string): Promise<void> {
        this.onClick(this.bestiaryFeatureProvider, url);
    }

    async onSpellClick(url: string): Promise<void> {
        this.onClick(this.spellbookFeatureProvider, url);
    }

    async onWeaponClick(url: string): Promise<void> {
        this.onClick(this.arsenalFeatureProvider, url);
    }

    async onArmorClick(url: string): Promise<void> {
        this.onClick(this.armoryFeatureProvider, url);
    }

    async onItemClick(url: string): Promise<void> {
        this.onClick(this.equipmentFeatureProvider, url);
    }

    async onArtifactClick(url: string): Promise<void> {
        this.onClick(this.artifactoryFeatureProvider, url);
    }

    async onScreenItemClick(url: string): Promise<void> {
        this.onClick(this.dmScreenFeatureProvider, url);
    }

    async onBackgroundClick(url: string): Promise<void> {
        this.onClick(this.backgroundFeatureProvider, url);
    }

    async onFeatClick(url: string): Promise<void> {
        this.onClick(this.featFeatureProvider, url);
    }

    async onRaceClick(url: string): Promise<void> {
        this.onClick(this.raceFeatureProvider, url);
    }

    async onClassClick(url: string): Promise<void> {
        this.onClick(this.classesFeatureProvider, url);
    }

    async onCharacterSheetClick(url: string): Promise<void> {
        this.onClick(this.characterSheetFeatureProvider, url);
    }

    onDiceRoll(label: string, value: RollTraceResult): void {
        new Notice(`${label ? label + ": " : ""}${value.total}\n\n${value.resolvedFormula}`);
    }

    async onImageRequested(imageUrl: string): Promise<string> {
        return await getImageSource(this.app, imageUrl);
    }

    private async onClick(featureProvider: () => BaseFeature<any, any, any>, url: string): Promise<void> {
        const feature = featureProvider();
        if (!feature) return;
        await feature.onItemClick(url);
    }
}
