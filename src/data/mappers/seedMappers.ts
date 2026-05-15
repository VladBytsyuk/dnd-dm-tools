import type { SeedMapper } from "src/data/ports";
import type { SmallClass } from "src/domain/models/class/SmallClass";
import { DmScreenItem } from "src/domain/models/dm_screen/DmScreenItem";
import type { SmallRace } from "src/domain/models/race/SmallRace";

export interface ClassSeed {
	name: SmallClass["name"];
	url: string;
	dice: string;
	source: SmallClass["source"];
	archetypes: Array<{
		name: SmallClass["name"];
		url: string;
		source: SmallClass["source"];
	}>;
}

export interface RaceSeedItem {
	item: SmallRace;
	parentUrl: string | null;
}

export class IdentitySeedMapper<T> implements SeedMapper<T, T> {
	mapSeed(seed: T): T {
		return seed;
	}
}

export class ClassSeedMapper {
	mapSeeds(seeds: ClassSeed[]): SmallClass[] {
		return seeds.flatMap((classData) => [
			{
				name: classData.name,
				url: classData.url,
				dice: classData.dice,
				source: classData.source,
				isArchetype: false,
				parentClassUrl: undefined,
			},
			...classData.archetypes.map((archetype) => ({
				name: archetype.name,
				url: archetype.url,
				dice: classData.dice,
				source: archetype.source,
				isArchetype: true,
				parentClassUrl: classData.url,
			})),
		]);
	}
}

export class RaceSeedMapper {
	mapSeeds(seeds: SmallRace[]): RaceSeedItem[] {
		return this.flatten(seeds, null);
	}

	private flatten(races: SmallRace[], parentUrl: string | null): RaceSeedItem[] {
		const result: RaceSeedItem[] = [];
		for (const race of races) {
			result.push({ item: race, parentUrl });
			if (race.subraces && race.subraces.length > 0) {
				result.push(...this.flatten(race.subraces, race.url));
			}
		}
		return result;
	}
}

export class DmScreenSeedMapper {
	mapSeeds(seeds: DmScreenItem[]): DmScreenItem[] {
		return this.flatten(seeds);
	}

	private flatten(items: DmScreenItem[], parentUrl?: string): DmScreenItem[] {
		let result: DmScreenItem[] = [];
		for (const item of items) {
			result.push(
				DmScreenItem(
					item.name,
					item.url,
					item.order,
					item.source,
					item.group,
					item.icon,
					item.description,
					parentUrl,
				),
			);

			if (item.children && item.children.length > 0) {
				result = result.concat(this.flatten(item.children, item.url));
			}
		}
		return result;
	}
}
