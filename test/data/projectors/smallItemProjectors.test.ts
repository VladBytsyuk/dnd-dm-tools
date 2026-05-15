import { describe, expect, it } from "vitest";
import { fullArtifactAmulet } from "../../__mocks__/domain/models/artifact/full_artifact_items";
import { fullArmorRingMail } from "../../__mocks__/domain/models/armor/full_armor_items";
import { fullBackgroundOccultist } from "../../__mocks__/domain/models/background/full_background_items";
import { fullClassBard } from "../../__mocks__/domain/models/class/full_class_items";
import { fullFeat1 } from "../../__mocks__/domain/models/feat/full_feat_items";
import { fullItemAbacus } from "../../__mocks__/domain/models/items/full_items_items";
import { fullMonsterTiamat } from "../../__mocks__/domain/models/monster/full_monster_items";
import { fullRace1 } from "../../__mocks__/domain/models/race/full_race_items";
import { fullSpellFireball } from "../../__mocks__/domain/models/spell/full_spell_items";
import { fullWeaponMace } from "../../__mocks__/domain/models/weapon/full_weapon_items";
import { EmptyFullCharacterSheet } from "../../../src/domain/models/character/FullCharacterSheet";
import {
	ArtifactProjector,
	ArmorProjector,
	BackgroundProjector,
	CharacterSheetProjector,
	ClassProjector,
	FeatProjector,
	ItemProjector,
	MonsterProjector,
	RaceProjector,
	SpellProjector,
	WeaponProjector,
} from "../../../src/data/projectors/smallItemProjectors";

describe("small item projectors", () => {
	it("projects full monster fields expected by the small DAO", () => {
		expect(new MonsterProjector().project(fullMonsterTiamat)).toEqual({
			name: fullMonsterTiamat.name,
			url: fullMonsterTiamat.url,
			type: fullMonsterTiamat.type,
			challengeRating: fullMonsterTiamat.challengeRating,
			source: fullMonsterTiamat.source,
		});
	});

	it("projects full spell fields expected by the small DAO", () => {
		expect(new SpellProjector().project(fullSpellFireball)).toEqual({
			name: fullSpellFireball.name,
			url: fullSpellFireball.url,
			level: fullSpellFireball.level,
			school: fullSpellFireball.school,
			additionalType: fullSpellFireball.additionalType,
			components: fullSpellFireball.components,
			source: fullSpellFireball.source,
			id: fullSpellFireball.id,
			concentration: fullSpellFireball.concentration,
			ritual: fullSpellFireball.ritual,
		});
	});

	it("projects full weapon fields expected by the small DAO", () => {
		expect(new WeaponProjector().project(fullWeaponMace)).toEqual({
			name: fullWeaponMace.name,
			url: fullWeaponMace.url,
			type: fullWeaponMace.type,
			damage: fullWeaponMace.damage,
			price: fullWeaponMace.price,
			source: fullWeaponMace.source,
			homebrew: fullWeaponMace.homebrew,
		});
	});

	it("projects full armor fields expected by the small DAO", () => {
		expect(new ArmorProjector().project(fullArmorRingMail)).toEqual({
			name: fullArmorRingMail.name,
			url: fullArmorRingMail.url,
			type: fullArmorRingMail.type,
			armorClass: fullArmorRingMail.armorClass,
			price: fullArmorRingMail.price,
			source: fullArmorRingMail.source,
		});
	});

	it("projects full equipment item fields expected by the small DAO", () => {
		expect(new ItemProjector().project(fullItemAbacus)).toEqual({
			name: fullItemAbacus.name,
			url: fullItemAbacus.url,
			source: fullItemAbacus.source,
			homebrew: fullItemAbacus.homebrew,
		});
	});

	it("projects full artifact fields expected by the small DAO", () => {
		expect(new ArtifactProjector().project(fullArtifactAmulet)).toEqual({
			name: fullArtifactAmulet.name,
			url: fullArtifactAmulet.url,
			type: fullArtifactAmulet.type,
			price: fullArtifactAmulet.price,
			source: fullArtifactAmulet.source,
			rarity: fullArtifactAmulet.rarity,
			customization: fullArtifactAmulet.customization,
			homebrew: fullArtifactAmulet.homebrew,
		});
	});

	it("projects full feat fields expected by the small DAO", () => {
		expect(new FeatProjector().project(fullFeat1)).toEqual({
			name: fullFeat1.name,
			url: fullFeat1.url,
			requirements: fullFeat1.requirements,
			source: fullFeat1.source,
			homebrew: fullFeat1.homebrew,
		});
	});

	it("projects full background fields expected by the small DAO", () => {
		expect(new BackgroundProjector().project(fullBackgroundOccultist)).toEqual({
			name: fullBackgroundOccultist.name,
			url: fullBackgroundOccultist.url,
			source: fullBackgroundOccultist.source,
			homebrew: fullBackgroundOccultist.homebrew,
		});
	});

	it("projects full class fields expected by the small DAO", () => {
		expect(new ClassProjector().project(fullClassBard)).toEqual({
			name: fullClassBard.name,
			url: fullClassBard.url,
			dice: fullClassBard.dice,
			source: fullClassBard.source,
			isArchetype: fullClassBard.isArchetype,
			parentClassUrl: fullClassBard.parentClassUrl,
		});
	});

	it("projects nested full race fields expected by the small DAO", () => {
		const fullRace = {
			...fullRace1,
			subraces: [{ ...fullRace1, url: "/races/elf/high" }],
		};
		const projected = new RaceProjector().project(fullRace);

		expect(projected).toEqual({
			name: fullRace.name,
			url: fullRace.url,
			abilities: fullRace.abilities,
			type: fullRace.type,
			source: fullRace.source,
			image: fullRace.image,
			group: fullRace.group,
			subraces: [
				{
					name: fullRace.subraces[0].name,
					url: fullRace.subraces[0].url,
					abilities: fullRace.subraces[0].abilities,
					type: fullRace.subraces[0].type,
					source: fullRace.subraces[0].source,
					image: fullRace.subraces[0].image,
					group: fullRace.subraces[0].group,
					subraces: undefined,
				},
			],
		});
	});

	it("projects full character sheet fields expected by the small DAO", () => {
		const sheet = EmptyFullCharacterSheet();
		sheet.name = { rus: "Sir Test", eng: "Sir Test" };
		sheet.url = "sir-test";
		sheet.charClass = "Wizard";
		sheet.level = 3;
		sheet.race = "Human";
		sheet.playerName = "Player";

		expect(new CharacterSheetProjector().project(sheet)).toEqual({
			name: sheet.name,
			url: sheet.url,
			charClass: "Wizard",
			level: 3,
			race: "Human",
			playerName: "Player",
		});
	});
});
