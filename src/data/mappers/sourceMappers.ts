import type { FullArtifact } from "src/domain/models/artifact/FullArtifact";
import type { FullArmor } from "src/domain/models/armor/FullArmor";
import type { FullBackground } from "src/domain/models/background/FullBackground";
import type { FullClass } from "src/domain/models/class/FullClass";
import type { Source } from "src/domain/models/common/Source";
import type { Type } from "src/domain/models/common/Type";
import type { DmScreenItem } from "src/domain/models/dm_screen/DmScreenItem";
import type { FullFeat } from "src/domain/models/feat/FullFeat";
import type { FullItem } from "src/domain/models/items/FullItem";
import type { FullMonster } from "src/domain/models/monster/FullMonster";
import type { FullRace } from "src/domain/models/race/FullRace";
import type { FullSpell } from "src/domain/models/spell/FullSpell";
import type { FullWeapon } from "src/domain/models/weapon/FullWeapon";
import type { FullItemMapper } from "src/data/ports/mappers";

type NameLike = string | { rus?: string; eng?: string };

type RaceSourceResponse = Omit<Partial<FullRace>, "name" | "type" | "source" | "subraces"> & {
	name?: NameLike;
	type?: string | Type;
	source?: Partial<Source>;
	subraces?: RaceSourceResponse[];
};

export class TtgFullItemMapper<TFull extends { url: string }>
	implements FullItemMapper<Partial<TFull>, TFull> {
	map(response: Partial<TFull>, url: string): TFull {
		return {
			...response,
			url: response.url ?? url,
		} as TFull;
	}
}

export const monsterMapper = new TtgFullItemMapper<FullMonster>();
export const spellMapper = new TtgFullItemMapper<FullSpell>();
export const weaponMapper = new TtgFullItemMapper<FullWeapon>();
export const armorMapper = new TtgFullItemMapper<FullArmor>();
export const itemMapper = new TtgFullItemMapper<FullItem>();
export const artifactMapper = new TtgFullItemMapper<FullArtifact>();
export const featMapper = new TtgFullItemMapper<FullFeat>();

export class RaceMapper implements FullItemMapper<RaceSourceResponse, FullRace> {
	map(response: RaceSourceResponse, url: string): FullRace {
		const itemUrl = response.url ?? url;
		const name = normalizeName(response.name);

		return {
			...response,
			name,
			url: itemUrl,
			abilities: response.abilities ?? [],
			type: normalizeType(response.type),
			source: normalizeSource(response.source),
			description: response.description ?? "",
			size: response.size ?? "",
			speed: response.speed ?? [],
			skills: response.skills ?? [],
			subraces: response.subraces?.map((subrace) =>
				this.map(subrace, buildSubraceFallbackUrl(itemUrl, subrace.name))
			),
		};
	}
}

export class ClassMapper implements FullItemMapper<Partial<FullClass>, FullClass> {
	map(response: Partial<FullClass>, url: string): FullClass {
		const apiUrl = response.url ?? url;

		return {
			...response,
			url,
			associatedUrl: response.associatedUrl ?? buildClassFragmentUrl(apiUrl),
			associatedHtml: response.associatedHtml,
		} as FullClass;
	}
}

export class BackgroundMapper implements FullItemMapper<Partial<FullBackground>, FullBackground> {
	map(response: Partial<FullBackground>, url: string): FullBackground {
		const associatedUrl = response.associatedUrl ?? response.url ?? url;

		return {
			...response,
			url,
			associatedUrl,
			associatedHtml: response.associatedHtml,
		} as FullBackground;
	}
}

export class DmScreenDescriptionMapper implements FullItemMapper<Partial<DmScreenItem>, DmScreenItem> {
	map(response: Partial<DmScreenItem>, url: string): DmScreenItem {
		return {
			...response,
			url: response.url ?? url,
		} as DmScreenItem;
	}
}

export function buildClassFragmentUrl(classUrl: string): string {
	if (classUrl.includes("/fragment/")) return classUrl;

	const parts = classUrl.replace(/^\//, "").split("/");
	if (parts.length >= 2 && parts[0] === "classes") {
		return `/${parts[0]}/fragment/${parts.slice(1).join("/")}`;
	}
	return classUrl;
}

function normalizeName(name: NameLike | undefined): { rus: string; eng: string } {
	if (typeof name === "string") {
		return { rus: name, eng: name };
	}

	return {
		rus: name?.rus ?? "",
		eng: name?.eng ?? name?.rus ?? "",
	};
}

function normalizeType(type: string | Type | undefined): Type {
	if (typeof type === "string") return { name: type };
	return type ?? { name: "" };
}

function normalizeSource(source: Partial<Source> | undefined): Source {
	return {
		shortName: source?.shortName ?? "",
		name: source?.name ?? "",
		group: {
			name: source?.group?.name ?? "",
			shortName: source?.group?.shortName ?? "",
		},
		homebrew: source?.homebrew ?? false,
	};
}

function buildSubraceFallbackUrl(parentUrl: string, name: NameLike | undefined): string {
	const normalizedName = normalizeName(name);
	const suffix = (normalizedName.eng || normalizedName.rus)
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "_");

	return suffix ? `${parentUrl}/${suffix}` : parentUrl;
}
