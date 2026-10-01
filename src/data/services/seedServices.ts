import type { SeedReadService, ServiceResult } from "src/data/ports";
import { baseArmory } from "src/assets/data/armory";
import { baseArsenal } from "src/assets/data/arsenal";
import { baseArtifacts } from "src/assets/data/artifacts";
import { baseBackgrounds } from "src/assets/data/backgrounds";
import { baseBestiary } from "src/assets/data/bestiary";
import { baseClasses } from "src/assets/data/classes";
import { baseDmScreenItems } from "src/assets/data/dm_screen";
import { baseEquipment } from "src/assets/data/equipment";
import { baseFeats } from "src/assets/data/feats";
import { baseRaces } from "src/assets/data/races";
import { baseSpellbook } from "src/assets/data/spellbook";
import type { ClassSeed } from "src/data/mappers/seedMappers";
import type { SmallArmor } from "src/domain/models/armor/SmallArmor";
import type { SmallArtifact } from "src/domain/models/artifact/SmallArtifact";
import type { SmallBackground } from "src/domain/models/background/SmallBackground";
import type { DmScreenItem } from "src/domain/models/dm_screen/DmScreenItem";
import type { SmallFeat } from "src/domain/models/feat/SmallFeat";
import type { SmallItem } from "src/domain/models/items/SmallItem";
import type { SmallMonster } from "src/domain/models/monster/SmallMonster";
import type { SmallRace } from "src/domain/models/race/SmallRace";
import type { SmallSpell } from "src/domain/models/spell/SmallSpell";
import type { SmallWeapon } from "src/domain/models/weapon/SmallWeapon";

function collectNestedUrls<T extends { url: string; children?: T[] }>(items: T[]): string[] {
	return items.flatMap((item) => [item.url, ...collectNestedUrls(item.children ?? [])]);
}

function collectRaceUrls(items: SmallRace[]): string[] {
	return items.flatMap((item) => [item.url, ...collectRaceUrls(item.subraces ?? [])]);
}

export const bundledEntityUrlsByKind: Record<string, Set<string>> = {
	"bestiary": new Set(baseBestiary.map(({ url }) => url)),
	"spellbook": new Set(baseSpellbook.map(({ url }) => url)),
	"dm-screen": new Set(collectNestedUrls(baseDmScreenItems)),
	"arsenal": new Set(baseArsenal.map(({ url }) => url)),
	"armory": new Set(baseArmory.map(({ url }) => url)),
	"equipment": new Set(baseEquipment.map(({ url }) => url)),
	"artifactory": new Set(baseArtifacts.map(({ url }) => url)),
	"backgrounds": new Set(baseBackgrounds.map(({ url }) => url)),
	"feats": new Set(baseFeats.map(({ url }) => url)),
	"races": new Set(collectRaceUrls(baseRaces)),
	"classes": new Set(baseClasses.flatMap(({ url, archetypes }) => [url, ...archetypes.map(({ url: archetypeUrl }) => archetypeUrl)])),
};

class StaticSeedReadService<TSeed> implements SeedReadService<TSeed> {
	constructor(private readonly seeds: TSeed[]) {}

	async readSeeds(): Promise<ServiceResult<TSeed[]>> {
		return { ok: true, value: [...this.seeds] };
	}
}

export class BestiarySeedService extends StaticSeedReadService<SmallMonster> {
	constructor() {
		super(baseBestiary);
	}
}

export class SpellbookSeedService extends StaticSeedReadService<SmallSpell> {
	constructor() {
		super(baseSpellbook);
	}
}

export class ArsenalSeedService extends StaticSeedReadService<SmallWeapon> {
	constructor() {
		super(baseArsenal);
	}
}

export class ArmorySeedService extends StaticSeedReadService<SmallArmor> {
	constructor() {
		super(baseArmory);
	}
}

export class EquipmentSeedService extends StaticSeedReadService<SmallItem> {
	constructor() {
		super(baseEquipment);
	}
}

export class ArtifactorySeedService extends StaticSeedReadService<SmallArtifact> {
	constructor() {
		super(baseArtifacts);
	}
}

export class BackgroundSeedService extends StaticSeedReadService<SmallBackground> {
	constructor() {
		super(baseBackgrounds);
	}
}

export class FeatsSeedService extends StaticSeedReadService<SmallFeat> {
	constructor() {
		super(baseFeats);
	}
}

export class RacesSeedService extends StaticSeedReadService<SmallRace> {
	constructor() {
		super(baseRaces);
	}
}

export class ClassesSeedService extends StaticSeedReadService<ClassSeed> {
	constructor() {
		super(baseClasses);
	}
}

export class DmScreenSeedService extends StaticSeedReadService<DmScreenItem> {
	constructor() {
		super(baseDmScreenItems);
	}
}
