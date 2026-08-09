import type { FullItemReadService, ServiceResult } from "src/data/ports";
import { TtgApiService, type TtgApiRequestOptions, type TtgJsonObject } from "./TtgApiService";
import { TtgHtmlService } from "./TtgHtmlService";

export interface TtgItemWithHtml<TItem extends TtgJsonObject = TtgJsonObject> {
	item: TItem;
	associatedUrl: string;
	associatedHtml?: string;
}

function getStringProperty(source: TtgJsonObject, key: string): string | undefined {
	const value = source[key];
	return typeof value === "string" ? value : undefined;
}

function buildClassFragmentUrl(classUrl: string): string {
	if (classUrl.includes("/fragment/")) return classUrl;

	const parts = classUrl.replace(/^\//, "").split("/");
	if (parts.length >= 2 && parts[0] === "classes") {
		return `/${parts[0]}/fragment/${parts.slice(1).join("/")}`;
	}
	return classUrl;
}

export class TtgService implements FullItemReadService<TtgJsonObject, TtgApiRequestOptions> {
	constructor(
		private readonly apiService = new TtgApiService(),
		private readonly htmlService = new TtgHtmlService(),
	) {}

	async getFullItem(
		url: string,
		options?: TtgApiRequestOptions,
	): Promise<ServiceResult<TtgJsonObject>> {
		const result = await this.apiService.getJson(url, { ...options, requestedUrl: url });
		if (!result.ok) return result;
		return { ok: true, value: adaptV2Response(url, result.value) };
	}

	async getClassWithHtml(
		url: string,
		options?: TtgApiRequestOptions,
	): Promise<ServiceResult<TtgItemWithHtml>> {
		const itemResult = await this.getFullItem(url, options);
		if (!itemResult.ok) return itemResult;

		const apiUrl = getStringProperty(itemResult.value, "url") ?? url;
		const associatedUrl = buildClassFragmentUrl(apiUrl);
		const htmlResult = await this.htmlService.getHtml(associatedUrl);

		return {
			ok: true,
			value: {
				item: itemResult.value,
				associatedUrl,
				associatedHtml: htmlResult.ok ? htmlResult.value : undefined,
			},
		};
	}

	async getBackgroundWithHtml(url: string): Promise<ServiceResult<TtgItemWithHtml>> {
		const itemResult = await this.getFullItem(url);
		if (!itemResult.ok) return itemResult;

		const associatedUrl = getStringProperty(itemResult.value, "associatedUrl")
			?? getStringProperty(itemResult.value, "url")
			?? url;
		const htmlResult = await this.htmlService.getHtml(associatedUrl);

		return {
			ok: true,
			value: {
				item: itemResult.value,
				associatedUrl,
				associatedHtml: htmlResult.ok && htmlResult.value.trim()
					? htmlResult.value
					: getStringProperty(itemResult.value, "description"),
			},
		};
	}

	async getDmScreenDescription(url: string): Promise<ServiceResult<TtgJsonObject>> {
		return await this.getFullItem(url);
	}

	async getRaceTree(
		url: string,
		options?: TtgApiRequestOptions,
	): Promise<ServiceResult<TtgJsonObject>> {
		const itemResult = await this.getFullItem(url, options);
		if (!itemResult.ok) return itemResult;
		if (Array.isArray(itemResult.value.subraces)) return itemResult;

		const associatedUrl = getStringProperty(itemResult.value, "associatedUrl") ?? url;
		const lineagesResult = await this.apiService.getJsonArray(`${associatedUrl}/lineages`, options);
		if (!lineagesResult.ok || lineagesResult.value.length === 0) {
			return itemResult;
		}

		return {
			ok: true,
			value: {
				...itemResult.value,
				subraces: lineagesResult.value.map((lineage) =>
					adaptV2Response(buildRacePluginUrl(asString(lineage.url) ?? ""), lineage)
				),
			},
		};
	}
}

function adaptV2Response(url: string, response: TtgJsonObject): TtgJsonObject {
	if (url.startsWith("/screens/") || url.startsWith("screens/")) return response;
	if (isLegacyResponse(response)) {
		return {
			...response,
			url: asString(response.url) ?? url,
		};
	}

	const resource = firstSegment(url);
	const base = adaptBaseResponse(url, response);

	if (resource === "spells") {
		return {
			...base,
			time: asString(response.castingTime) ?? asString(response.time) ?? "",
			components: response.components ?? {},
			description: markupToString(response.description),
			upper: markupToString(response.upper) || undefined,
		};
	}

	if (resource === "classes") {
		return {
			...base,
			dice: normalizeDice(response.dice ?? readObjectString(response.hitDice, ["value", "label"])),
			isArchetype: Boolean(response.parent ?? response.isArchetype),
			parentClassUrl: readObjectString(response.parent, ["url"]) ?? asString(response.parentClassUrl),
			associatedUrl: buildClassFragmentUrl(url),
			associatedHtml: markupToString(response.description),
		};
	}

	if (resource === "races") {
		const properties = asObject(response.properties);
		return {
			...base,
			associatedUrl: buildRacePluginUrl(asString(response.url) ?? ""),
			abilities: response.abilities ?? [],
			type: { name: asString(properties?.type) ?? readObjectString(response.type, ["name"]) ?? "" },
			description: markupToString(response.description),
			size: asString(properties?.size) ?? asString(response.size) ?? "",
			speed: normalizeSpeed(properties?.speed ?? response.speed),
			skills: normalizeTags(response.skills ?? response.features),
			subraces: Array.isArray(response.subraces)
				? response.subraces
				: Array.isArray(response.lineages)
					? response.lineages
					: undefined,
		};
	}

	if (resource === "bestiary") {
		return {
			...base,
			id: asNumber(response.id) ?? 0,
			size: normalizeSize(response.size),
			type: response.type ?? asString(response.header) ?? "",
			challengeRating: asString(response.challengeRating) ?? asString(response.cr) ?? "",
			armorClass: parseLeadingNumber(response.armorClass ?? response.ac),
			hits: normalizeHits(response.hits ?? response.hit),
			ability: normalizeAbilities(response.ability ?? response.abilities),
			speed: normalizeSpeed(response.speed),
			skills: normalizeNamedValues(response.skills),
			damageVulnerabilities: splitList(response.damageVulnerabilities ?? response.vulnerability),
			damageResistances: splitList(response.damageResistances ?? response.resistance),
			damageImmunities: splitList(response.damageImmunities ?? response.immunity),
			conditionImmunities: splitList(response.conditionImmunities),
			senses: normalizeSenses(response.senses ?? response.sense),
			languages: splitList(response.languages),
			feats: normalizeNamedValues(response.feats ?? response.traits),
			actions: normalizeNamedValues(response.actions),
			bonusActions: normalizeNamedValues(response.bonusActions),
			reactions: normalizeNamedValues(response.reactions),
			legendary: normalizeLegendary(response.legendary),
			lair: normalizeLair(response.lair),
			description: markupToString(response.description ?? response.section),
			tags: response.tags ?? [],
			environment: splitList(response.environment),
			images: Array.isArray(response.images) ? response.images : [],
		};
	}

	if (resource === "weapons") {
		return {
			...base,
			type: { name: asString(response.category) ?? "" },
			damage: response.damage ?? { type: "", dice: undefined },
			price: asString(response.price) ?? asString(response.cost) ?? "",
			weight: asNumber(response.weight) ?? parseLeadingNumber(response.weight) ?? 0,
			description: markupToString(response.description),
			properties: Array.isArray(response.properties) ? response.properties : [],
		};
	}

	if (resource === "armor" || resource === "armors") {
		return {
			...base,
			type: { name: asString(response.category) ?? "" },
			armorClass: asString(response.armorClass) ?? asString(response.armor) ?? "",
			price: asString(response.price) ?? asString(response.cost) ?? "",
			weight: asNumber(response.weight) ?? parseLeadingNumber(response.weight) ?? 0,
			description: markupToString(response.description),
			duration: asString(response.duration) ?? "",
		};
	}

	if (resource === "items" || resource === "equipment") {
		if (url.includes("/magic/")) {
			return {
				...base,
				type: { name: asString(response.category) ?? asString(response.subtitle) ?? "" },
				price: normalizePrice(response.price),
				rarity: normalizeRarity(response.rarity),
				customization: typeof response.attunement === "boolean"
					? response.attunement
					: Boolean(response.customization),
				description: markupToString(response.description),
				detailType: normalizeDetailTypes(response.category),
				cost: normalizePrice(response.cost),
				images: normalizeImages(response.images ?? response.image),
			};
		}
		return {
			...base,
			price: asString(response.price) ?? asString(response.cost),
			weight: asNumber(response.weight) ?? parseLeadingNumber(response.weight),
			description: markupToString(response.description),
			categories: splitList(response.categories ?? response.category ?? response.types),
		};
	}

	if (resource === "backgrounds") {
		return {
			...base,
			associatedUrl: asString(response.associatedUrl) ?? asString(response.url) ?? url,
			associatedHtml: markupToString(response.description),
			skills: splitList(response.skills ?? response.skillProficiencies),
			toolOwnership: markupToString(response.toolOwnership ?? response.toolProficiency),
			equipments: splitList(response.equipments ?? response.equipment),
			startGold: asNumber(response.startGold) ?? 0,
			description: markupToString(response.description),
			personalization: markupToString(response.personalization) || undefined,
		};
	}

	if (resource === "feats") {
		return {
			...base,
			requirements: asString(response.requirements) ?? asString(response.prerequisite) ?? "",
			description: markupToString(response.description),
		};
	}

	return base;
}

function adaptBaseResponse(url: string, response: TtgJsonObject): TtgJsonObject {
	return {
		...response,
		name: normalizeName(response.name),
		url,
		source: normalizeSource(response.source),
		description: markupToString(response.description),
	};
}

function isLegacyResponse(response: TtgJsonObject): boolean {
	const source = asObject(response.source);
	return typeof source?.shortName === "string";
}

function firstSegment(url: string): string {
	return url.replace(/^\/+/, "").split("/")[0] ?? "";
}

function buildRacePluginUrl(slug: string): string {
	const normalized = slug.replace(/^\/+/, "");
	if (!normalized) return "/races";
	if (normalized.startsWith("races/")) return `/${normalized}`;
	return `/races/${normalized}`;
}

function asObject(value: unknown): TtgJsonObject | null {
	return value && typeof value === "object" && !Array.isArray(value) ? value as TtgJsonObject : null;
}

function asString(value: unknown): string | undefined {
	return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
	return typeof value === "number" ? value : undefined;
}

function readObjectString(value: unknown, keys: string[]): string | undefined {
	const object = asObject(value);
	if (!object) return undefined;
	for (const key of keys) {
		const candidate = asString(object[key]);
		if (candidate) return candidate;
	}
	return undefined;
}

function normalizeName(value: unknown): { rus: string; eng: string } {
	if (typeof value === "string") return { rus: value, eng: value };
	const object = asObject(value);
	return {
		rus: asString(object?.rus) ?? asString(object?.label) ?? asString(object?.eng) ?? "",
		eng: asString(object?.eng) ?? asString(object?.label) ?? asString(object?.rus) ?? "",
	};
}

function normalizeSource(value: unknown): { shortName: string; name: string; group: { name: string; shortName: string }; homebrew?: boolean } {
	const object = asObject(value);
	const sourceName = normalizeName(object?.name ?? object);
	const groupName = normalizeName(object?.group);
	const sourceObject = asObject(object?.name);
	const groupObject = asObject(object?.group);
	return {
		shortName: asString(object?.shortName)
			?? asString(object?.label)
			?? asString(sourceObject?.label)
			?? sourceName.eng
			?? sourceName.rus,
		name: sourceName.rus || sourceName.eng,
		group: {
			name: groupName.rus || groupName.eng,
			shortName: asString(groupObject?.label) ?? (groupName.eng || groupName.rus),
		},
		homebrew: typeof object?.homebrew === "boolean" ? object.homebrew : undefined,
	};
}

function normalizePrice(value: unknown): { dmg: string | null; xge: string | null } {
	const object = asObject(value);
	if (object) {
		return {
			dmg: asString(object.dmg) ?? asString(object.dmgPrice) ?? null,
			xge: asString(object.xge) ?? asString(object.xgePrice) ?? null,
		};
	}
	const price = asString(value);
	return {
		dmg: price ?? null,
		xge: null,
	};
}

function normalizeRarity(value: unknown): { type: string; name: string; short: string } {
	const object = asObject(value);
	if (object) {
		const name = asString(object.name) ?? asString(object.label) ?? "";
		return {
			type: asString(object.type) ?? rarityType(name),
			name,
			short: asString(object.short) ?? rarityShort(name),
		};
	}
	const name = asString(value) ?? "";
	return {
		type: rarityType(name),
		name,
		short: rarityShort(name),
	};
}

function rarityType(name: string): string {
	const normalized = name.toLocaleLowerCase("ru-RU");
	if (normalized.includes("необыч")) return "uncommon";
	if (normalized.includes("обыч")) return "common";
	if (normalized.includes("очень ред")) return "very_rare";
	if (normalized.includes("ред")) return "rare";
	if (normalized.includes("легендар")) return "legendary";
	if (normalized.includes("артефакт")) return "artifact";
	return "";
}

function rarityShort(name: string): string {
	const normalized = name.toLocaleLowerCase("ru-RU");
	if (normalized.includes("необыч")) return "Н";
	if (normalized.includes("обыч")) return "O";
	if (normalized.includes("очень ред")) return "OР";
	if (normalized.includes("ред")) return "Р";
	if (normalized.includes("легендар")) return "Л";
	if (normalized.includes("артефакт")) return "А";
	return "";
}

function normalizeDetailTypes(value: unknown): Array<{ name: string; type: string; url: string | null }> | undefined {
	const name = asString(value);
	return name ? [{ name, type: name, url: null }] : undefined;
}

function normalizeImages(value: unknown): string[] {
	const images = Array.isArray(value) ? value : value ? [value] : [];
	return images
		.filter((image): image is string => typeof image === "string" && image.length > 0)
		.map((image) => image.startsWith("/") ? `https://new.ttg.club${image}` : image);
}

function markupToString(value: unknown): string {
	if (typeof value === "string") return value;
	if (Array.isArray(value)) return value.map(markupToString).filter(Boolean).join("");
	const object = asObject(value);
	if (!object) return "";
	for (const key of ["html", "value", "text", "content", "description"]) {
		const candidate = object[key];
		if (typeof candidate === "string") return candidate;
		if (Array.isArray(candidate)) return markupToString(candidate);
	}
	return "";
}

function normalizeDice(value: unknown): string {
	const dice = asString(value) ?? "";
	return dice.replace(/^d/i, "к");
}

function normalizeSpeed(value: unknown): Array<{ value?: number; name?: string; additional?: string }> {
	if (Array.isArray(value)) return value as Array<{ value?: number; name?: string; additional?: string }>;
	if (typeof value === "string" && value) {
		return value
			.split(",")
			.map((part) => part.trim())
			.filter(Boolean)
			.map((part) => {
				const value = parseLeadingNumber(part);
				const name = part.replace(/\d+.*$/, "").trim();
				const additionalMatch = part.match(/\(([^)]+)\)/);
				return {
					name,
					value,
					additional: additionalMatch?.[1],
				};
			});
	}
	return [];
}

function normalizeSize(value: unknown): { rus: string; eng: string; cell: string } {
	const object = asObject(value);
	if (object) {
		return {
			rus: asString(object.rus) ?? asString(object.label) ?? asString(object.eng) ?? "",
			eng: asString(object.eng) ?? asString(object.label) ?? asString(object.rus) ?? "",
			cell: asString(object.cell) ?? "",
		};
	}

	const label = asString(value) ?? "";
	return { rus: label, eng: label, cell: "" };
}

function normalizeHits(value: unknown): { average: number; formula?: string; text?: string } {
	const object = asObject(value);
	return {
		average: asNumber(object?.average) ?? asNumber(object?.hit) ?? 0,
		formula: asString(object?.formula),
		text: asString(object?.text),
	};
}

function normalizeAbilities(value: unknown): Record<string, number> {
	const object = asObject(value);
	const ability = (...keys: string[]) => {
		const entry = keys
			.map((key) => object?.[key])
			.find((candidate) => candidate !== undefined);
		if (typeof entry === "number") return entry;
		const nested = asObject(entry);
		return asNumber(nested?.value) ?? asNumber(nested?.score) ?? 10;
	};
	return {
		str: ability("str"),
		dex: ability("dex"),
		con: ability("con"),
		int: ability("int"),
		wiz: ability("wiz", "wis"),
		cha: ability("cha", "chr"),
	};
}

function normalizeSenses(value: unknown): { passivePerception: string; senses: Array<{ name: string; value: number }> } {
	if (typeof value === "string") {
		const passive = value.match(/пассив\D+(\d+)/i)?.[1] ?? "";
		const senses = value
			.split(",")
			.map((part) => part.trim())
			.filter((part) => part && !/пассив/i.test(part))
			.map((part) => ({
				name: part.replace(/\d+.*$/, "").trim(),
				value: parseLeadingNumber(part) ?? 0,
			}))
			.filter((sense) => sense.name || sense.value);
		return { passivePerception: passive, senses };
	}

	const object = asObject(value);
	if (!object) return { passivePerception: "", senses: [] };

	return {
		passivePerception: asString(object.passivePerception) ?? asString(object.passive) ?? "",
		senses: Array.isArray(object.senses)
			? object.senses.map((sense) => {
				const senseObject = asObject(sense);
				return {
					name: asString(senseObject?.name) ?? "",
					value: asNumber(senseObject?.value) ?? 0,
				};
			})
			: [],
	};
}

function normalizeTags(value: unknown): Array<{ name: string; description: string }> {
	if (!Array.isArray(value)) return [];
	return value.map((item) => {
		const object = asObject(item);
		return {
			name: object ? normalizeName(object.name).rus || asString(object.url) || "" : String(item),
			description: object ? markupToString(object.description ?? object.value ?? object.text) : "",
		};
	});
}

function normalizeNamedValues(value: unknown): Array<{ name: string; value: string }> {
	if (!Array.isArray(value)) return [];
	return value.map((item) => {
		const object = asObject(item);
		return {
			name: object ? normalizeName(object.name).rus || asString(object.label) || "" : String(item),
			value: object ? markupToString(object.description ?? object.value ?? object.text) : "",
		};
	});
}

function normalizeLegendary(value: unknown): { list: Array<{ name: string; value: string }>; count: number; description: string } | undefined {
	const object = asObject(value);
	if (!object) return undefined;
	return {
		list: normalizeNamedValues(object.actions ?? object.list),
		count: parseLeadingNumber(object.count) ?? 0,
		description: markupToString(object.description),
	};
}

function normalizeLair(value: unknown): { description: string; action: string; effect: string } | undefined {
	const object = asObject(value);
	if (!object) return undefined;
	return {
		description: markupToString(object.description),
		action: normalizeNamedValues(object.effects).map((item) => item.value).join(""),
		effect: markupToString(object.ending),
	};
}

function splitList(value: unknown): string[] {
	if (Array.isArray(value)) return value.map((item) => typeof item === "string" ? item : markupToString(item)).filter(Boolean);
	if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
	return [];
}

function parseLeadingNumber(value: unknown): number | undefined {
	if (typeof value === "number") return value;
	if (typeof value !== "string") return undefined;
	const match = value.match(/\d+/);
	return match ? Number(match[0]) : undefined;
}
