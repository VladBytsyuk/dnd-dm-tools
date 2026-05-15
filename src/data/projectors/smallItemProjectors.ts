import type { FullArtifact } from "src/domain/models/artifact/FullArtifact";
import type { SmallArtifact } from "src/domain/models/artifact/SmallArtifact";
import type { FullArmor } from "src/domain/models/armor/FullArmor";
import type { SmallArmor } from "src/domain/models/armor/SmallArmor";
import type { FullBackground } from "src/domain/models/background/FullBackground";
import type { SmallBackground } from "src/domain/models/background/SmallBackground";
import type { FullCharacterSheet } from "src/domain/models/character/FullCharacterSheet";
import type { SmallCharacterSheet } from "src/domain/models/character/SmallCharacterSheet";
import type { FullClass } from "src/domain/models/class/FullClass";
import type { SmallClass } from "src/domain/models/class/SmallClass";
import type { FullFeat } from "src/domain/models/feat/FullFeat";
import type { SmallFeat } from "src/domain/models/feat/SmallFeat";
import type { FullItem } from "src/domain/models/items/FullItem";
import type { SmallItem } from "src/domain/models/items/SmallItem";
import type { FullMonster } from "src/domain/models/monster/FullMonster";
import type { SmallMonster } from "src/domain/models/monster/SmallMonster";
import type { FullRace } from "src/domain/models/race/FullRace";
import type { SmallRace } from "src/domain/models/race/SmallRace";
import type { FullSpell } from "src/domain/models/spell/FullSpell";
import type { SmallSpell } from "src/domain/models/spell/SmallSpell";
import type { FullWeapon } from "src/domain/models/weapon/FullWeapon";
import type { SmallWeapon } from "src/domain/models/weapon/SmallWeapon";
import type { SmallItemProjector } from "src/data/ports/mappers";

export class MonsterProjector implements SmallItemProjector<FullMonster, SmallMonster> {
	project(fullItem: FullMonster): SmallMonster {
		return {
			name: fullItem.name,
			url: fullItem.url,
			type: fullItem.type,
			challengeRating: fullItem.challengeRating,
			source: fullItem.source,
		};
	}
}

export class SpellProjector implements SmallItemProjector<FullSpell, SmallSpell> {
	project(fullItem: FullSpell): SmallSpell {
		return {
			name: fullItem.name,
			url: fullItem.url,
			level: fullItem.level,
			school: fullItem.school,
			additionalType: fullItem.additionalType,
			components: fullItem.components,
			source: fullItem.source,
			id: fullItem.id,
			concentration: fullItem.concentration,
			ritual: fullItem.ritual,
		};
	}
}

export class WeaponProjector implements SmallItemProjector<FullWeapon, SmallWeapon> {
	project(fullItem: FullWeapon): SmallWeapon {
		return {
			name: fullItem.name,
			url: fullItem.url,
			type: fullItem.type,
			damage: fullItem.damage,
			price: fullItem.price,
			source: fullItem.source,
			homebrew: fullItem.homebrew,
		};
	}
}

export class ArmorProjector implements SmallItemProjector<FullArmor, SmallArmor> {
	project(fullItem: FullArmor): SmallArmor {
		return {
			name: fullItem.name,
			url: fullItem.url,
			type: fullItem.type,
			armorClass: fullItem.armorClass,
			price: fullItem.price,
			source: fullItem.source,
		};
	}
}

export class ItemProjector implements SmallItemProjector<FullItem, SmallItem> {
	project(fullItem: FullItem): SmallItem {
		return {
			name: fullItem.name,
			url: fullItem.url,
			source: fullItem.source,
			homebrew: fullItem.homebrew,
		};
	}
}

export class ArtifactProjector implements SmallItemProjector<FullArtifact, SmallArtifact> {
	project(fullItem: FullArtifact): SmallArtifact {
		return {
			name: fullItem.name,
			url: fullItem.url,
			type: fullItem.type,
			price: fullItem.price,
			source: fullItem.source,
			rarity: fullItem.rarity,
			customization: fullItem.customization,
			homebrew: fullItem.homebrew,
		};
	}
}

export class FeatProjector implements SmallItemProjector<FullFeat, SmallFeat> {
	project(fullItem: FullFeat): SmallFeat {
		return {
			name: fullItem.name,
			url: fullItem.url,
			requirements: fullItem.requirements,
			source: fullItem.source,
			homebrew: fullItem.homebrew,
		};
	}
}

export class BackgroundProjector implements SmallItemProjector<FullBackground, SmallBackground> {
	project(fullItem: FullBackground): SmallBackground {
		return {
			name: fullItem.name,
			url: fullItem.url,
			source: fullItem.source,
			homebrew: fullItem.homebrew,
		};
	}
}

export class ClassProjector implements SmallItemProjector<FullClass, SmallClass> {
	project(fullItem: FullClass): SmallClass {
		return {
			name: fullItem.name,
			url: fullItem.url,
			dice: fullItem.dice,
			source: fullItem.source,
			isArchetype: fullItem.isArchetype,
			parentClassUrl: fullItem.parentClassUrl,
		};
	}
}

export class RaceProjector implements SmallItemProjector<FullRace, SmallRace> {
	project(fullItem: FullRace): SmallRace {
		return {
			name: fullItem.name,
			url: fullItem.url,
			abilities: fullItem.abilities,
			type: fullItem.type,
			source: fullItem.source,
			image: fullItem.image,
			group: fullItem.group,
			subraces: fullItem.subraces?.map((subrace) => this.project(subrace)),
		};
	}
}

export class CharacterSheetProjector
	implements SmallItemProjector<FullCharacterSheet, SmallCharacterSheet> {
	project(fullItem: FullCharacterSheet): SmallCharacterSheet {
		return {
			name: fullItem.name,
			url: fullItem.url,
			charClass: fullItem.charClass,
			level: fullItem.level,
			race: fullItem.race,
			playerName: fullItem.playerName,
		};
	}
}

export const smallItemProjectors = {
	monster: new MonsterProjector(),
	spell: new SpellProjector(),
	weapon: new WeaponProjector(),
	armor: new ArmorProjector(),
	item: new ItemProjector(),
	artifact: new ArtifactProjector(),
	feat: new FeatProjector(),
	background: new BackgroundProjector(),
	class: new ClassProjector(),
	race: new RaceProjector(),
	characterSheet: new CharacterSheetProjector(),
};
