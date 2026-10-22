import { z } from "zod/v4";
import { normalizeMonsterForEditing, type FullMonster } from "src/domain/models/monster/FullMonster";

export const MCP_REFERENCE_KINDS = ["bestiary", "spellbook", "arsenal", "armory", "equipment", "artifactory", "backgrounds", "feats", "races"] as const;
export const MCP_MEDIA_KINDS = ["adventure", "scene", "track", "playlist"] as const;
export const MCP_ENTITY_KINDS = [...MCP_REFERENCE_KINDS, ...MCP_MEDIA_KINDS] as const;
export type McpReferenceKind = typeof MCP_REFERENCE_KINDS[number];
export type McpEntityKind = typeof MCP_ENTITY_KINDS[number];
export const MCP_ENTITY_URL_PREFIXES: Record<McpEntityKind, string> = {
	bestiary: "/bestiary/", spellbook: "/spells/", arsenal: "/weapons/", armory: "/armors/", equipment: "/items/",
	artifactory: "/items/magic/", backgrounds: "/backgrounds/", feats: "/feats/", races: "/races/",
	adventure: "/adventure/", scene: "/scene/", track: "/track/", playlist: "/playlist/",
};
function entityUrl(kind: McpEntityKind) {
	const prefix = MCP_ENTITY_URL_PREFIXES[kind];
	return z.string().regex(new RegExp(`^${prefix}${kind === "equipment" ? "(?!magic/)" : ""}[^\\s?#\\\\]+$`), `Используйте относительный URL вида ${prefix}идентификатор.`)
		.refine((value) => !value.split("/").some((part) => part === "." || part === ".."), "URL не должен содержать переходы между каталогами.");
}

const text = z.string();
const number = z.number().finite();
const strings = z.array(text);
const name = z.strictObject({ rus: text, eng: text });
const sourceText = text.trim().min(1);
const source = z.strictObject({ shortName: text, name: text, group: z.strictObject({ name: text, shortName: text }), homebrew: z.boolean().optional() });
const referenceSource = source.extend({ shortName: sourceText, name: sourceText, group: z.strictObject({ name: sourceText, shortName: sourceText }) });
const type = z.strictObject({ name: text, order: number.optional() });
const base = { name, url: text.trim().min(1), source: referenceSource, origin: z.enum(["remote", "manual"]).optional() };
const speed = z.strictObject({ value: number.optional(), name: text.optional(), additional: text.optional() });
const tag = z.strictObject({ name: text, description: text });
const namedValue = z.strictObject({ name: text, value: z.union([text, number]) });
const action = namedValue.extend({ entityUrl: text.optional(), weaponUrl: text.optional() });
const legendary = z.strictObject({ list: z.array(namedValue), count: number, description: text });
const price = z.strictObject({ dmg: text.nullable(), xge: text.nullable() });
const raceBase = z.strictObject({ ...base, url: entityUrl("races"), abilities: z.array(z.strictObject({ key: text, name: text, shortName: text, value: number })),
	type, image: text.optional(), group: type.optional(), description: text, size: text, speed: z.array(speed), skills: z.array(tag),
	additionalSections: z.array(z.strictObject({ title: text, html: text })).optional() });
type RacePayload = z.infer<typeof raceBase> & { subraces?: RacePayload[] };
const race: z.ZodType<RacePayload> = raceBase.extend({ subraces: z.lazy(() => z.array(race)).optional() });
const notePath = text.refine((path) => !path.startsWith("/") && !path.includes("\\") && !path.includes(":") && !path.split("/").some((part) => part === ".." || part === "."), "Путь должен быть относительным путём заметки в vault.").nullable();
const media = { id: text.trim().min(1), name: text.trim().min(1), url: text.trim().min(1), source: source.optional() };
const ref = text.min(1).nullable();
const sceneSide = z.enum(["left", "right", "top", "bottom"]);

/** Strict full-model schemas: SQL, file content and save context are never input fields. */
export const mcpEntitySchemas = {
	bestiary: z.strictObject({ ...base, url: entityUrl("bestiary"), type: z.union([text, type]), challengeRating: text, id: number, images: strings,
		size: z.strictObject({ rus: text, eng: text, cell: text }).optional(), experience: number.optional(), proficiencyBonus: text.optional(), alignment: text.optional(), armorClass: number.optional(),
		armors: z.array(z.strictObject({ name: text, type: text, url: text.nullable() })).optional(),
		hits: z.strictObject({ average: number, formula: text.optional(), sign: text.optional(), bonus: number.optional(), text: text.optional() }).optional(), speed: z.array(speed).optional(),
		ability: z.strictObject({ str: number, dex: number, con: number, int: number, wiz: number, cha: number }).optional(),
		savingThrows: z.array(z.strictObject({ name: text, shortName: text, value: number })).optional(), skills: z.array(namedValue).optional(),
		damageVulnerabilities: strings.optional(), damageResistances: strings.optional(), damageImmunities: strings.optional(), conditionImmunities: strings.optional(),
		senses: z.strictObject({ passivePerception: text, senses: z.array(z.strictObject({ name: text, value: number })).optional() }).optional(), languages: strings.optional(), feats: z.array(namedValue).optional(),
		actions: z.array(action).optional(), bonusActions: z.array(action).optional(), reactions: z.array(action).optional(), legendary: legendary.optional(), mythic: legendary.optional(),
		lair: z.strictObject({ description: text, action: text, effect: text }).optional(), description: text.optional(), tags: z.array(tag).optional(), environment: strings.optional() }),
	spellbook: z.strictObject({ ...base, url: entityUrl("spellbook"), level: number, school: text, additionalType: text.optional(), components: z.strictObject({ v: z.boolean().optional(), s: z.boolean().optional(), m: text.optional() }),
		id: number.optional(), concentration: z.boolean().optional(), ritual: z.boolean().optional(), range: text, duration: text, time: text,
		classes: z.array(z.strictObject({ name: text, url: text, icon: text.optional(), class: text.optional() })).optional(),
		subclasses: z.array(z.strictObject({ name: text, url: text, icon: text.optional(), class: text.optional() })).optional(), description: text, upper: text.optional() }),
	arsenal: z.strictObject({ ...base, url: entityUrl("arsenal"), type, damage: z.strictObject({ dice: text.optional(), type: text }), price: text, homebrew: z.boolean().optional(), weight: number,
		special: text.optional(), description: text.optional(), properties: z.array(z.strictObject({ name: text, url: text, distance: text.optional(), description: text })) }),
	armory: z.strictObject({ ...base, url: entityUrl("armory"), type, armorClass: text, price: text, weight: number, description: text, disadvantage: z.boolean().optional(), requirement: number.optional(), duration: text }),
	equipment: z.strictObject({ ...base, url: entityUrl("equipment"), homebrew: z.boolean().optional(), price: text.optional(), weight: number.optional(), description: text, categories: strings }),
	artifactory: z.strictObject({ ...base, url: entityUrl("artifactory"), type, price, rarity: z.strictObject({ type: text, name: text, short: text }), customization: z.boolean().optional(), homebrew: z.boolean().optional(), description: text,
		detailType: z.array(z.strictObject({ name: text, type: text, url: text.nullable() })).optional(), cost: price.optional(), images: strings.optional(), detailCustomization: strings.optional() }),
	backgrounds: z.strictObject({ ...base, url: entityUrl("backgrounds"), homebrew: z.boolean().optional(), associatedUrl: text.optional(), associatedHtml: text.optional(), skills: strings, toolOwnership: text, equipments: strings, startGold: number,
		description: text, language: text.optional(), skillName: text.optional(), skillDescription: text.optional(), personalization: text.optional(),
		personalizationTables: z.array(z.strictObject({ type: text, name: text, formula: text, thead: strings, tbody: z.array(strings) })).optional() }),
	feats: z.strictObject({ ...base, url: entityUrl("feats"), requirements: text, homebrew: z.boolean().optional(), description: text }),
	races: race,
	track: z.strictObject({ ...media, url: entityUrl("track"), atmosphere: text, normalAudioId: ref.default(null), combatAudioId: ref.default(null), loop: z.boolean(),
		normalAudioPath: text.min(1).optional().describe("Путь существующего аудиофайла внутри vault. При наличии заменяет normalAudioId; файл регистрируется при сохранении трека."),
		combatAudioPath: text.min(1).optional().describe("Путь боевого аудиофайла внутри vault. При наличии заменяет combatAudioId; файл регистрируется при сохранении трека.") }),
	playlist: z.strictObject({ ...media, url: entityUrl("playlist"), atmosphere: text, items: z.array(z.strictObject({ id: text.min(1), trackId: text.min(1) })) }),
	scene: z.strictObject({ ...media, url: entityUrl("scene"), campaignName: text, notePath, trackId: ref }),
	adventure: z.strictObject({ ...media, url: entityUrl("adventure"), campaignName: text, notePath, playlistId: ref,
		scenes: z.array(z.strictObject({ id: text.min(1), position: z.strictObject({ x: number, y: number }) })),
		links: z.array(z.strictObject({ id: text.min(1), fromSceneId: text.min(1), toSceneId: text.min(1), fromSide: sceneSide.optional(), toSide: sceneSide.optional() })) }),
} satisfies Record<McpEntityKind, z.ZodType>;

const emptySource = { shortName: "HB", name: "Ручная запись", group: { name: "Homebrew", shortName: "HB" }, homebrew: true };
const emptyBase = { name: { rus: "Новая сущность", eng: "" }, source: emptySource };
const emptyType = { name: "" };
export const mcpEntityTemplates: Record<McpEntityKind, object> = {
	bestiary: { ...emptyBase, url: "/bestiary/manual-new-id", type: "", challengeRating: "0", id: 0, images: [] },
	spellbook: { ...emptyBase, url: "/spells/manual-new-id", level: 0, school: "", components: {}, range: "", duration: "", time: "", description: "" },
	arsenal: { ...emptyBase, url: "/weapons/manual-new-id", type: emptyType, damage: { type: "" }, price: "", weight: 0, properties: [] },
	armory: { ...emptyBase, url: "/armors/manual-new-id", type: emptyType, armorClass: "", price: "", weight: 0, description: "", duration: "" },
	equipment: { ...emptyBase, url: "/items/manual-new-id", description: "", categories: [] },
	artifactory: { ...emptyBase, url: "/items/magic/manual-new-id", type: emptyType, price: { dmg: null, xge: null }, rarity: { type: "", name: "", short: "" }, description: "" },
	backgrounds: { ...emptyBase, url: "/backgrounds/manual-new-id", skills: [], toolOwnership: "", equipments: [], startGold: 0, description: "" },
	feats: { ...emptyBase, url: "/feats/manual-new-id", requirements: "", description: "" },
	races: { ...emptyBase, url: "/races/manual-new-id", abilities: [], type: emptyType, description: "", size: "", speed: [], skills: [] },
	track: { id: "new-id", name: "Трек", url: "/track/new-id", atmosphere: "", normalAudioId: null, combatAudioId: null, loop: true },
	playlist: { id: "new-id", name: "Плейлист", url: "/playlist/new-id", atmosphere: "", items: [] },
	scene: { id: "new-id", name: "Сцена", url: "/scene/new-id", campaignName: "", notePath: null, trackId: null },
	adventure: { id: "new-id", name: "Приключение", url: "/adventure/new-id", campaignName: "", notePath: null, playlistId: null, scenes: [], links: [] },
};

export function getMcpEntitySchema(kind: McpEntityKind) {
	return { kind, schema: z.toJSONSchema(mcpEntitySchemas[kind]), template: structuredClone(mcpEntityTemplates[kind]),
		instructions: "Передавайте полную сущность. origin определяется сервером. Для update_entity передайте revision из get_entity; URL ручной сущности неизменяемый." + (kind === "track" ? " Можно указать normalAudioPath и/или combatAudioPath, например Music/adventure_begins_loop.mp3, вместо ID. Пути выбирайте из list_audio_assets; id: null означает, что файл ещё не зарегистрирован. Файлы регистрируются вместе с треком после подтверждения. При наличии пути соответствующий AudioId заменяется; для удаления привязки передайте AudioId: null без пути." : "") };
}

/** SQL adapters sometimes expose NULL for optional model fields. Normalize reads,
 * while keeping write schemas strict and preserving genuinely nullable fields. */
export function normalizeMcpReadEntity(kind: McpEntityKind, input: object): object {
	const normalize = (value: unknown, schema: z.ZodType): unknown => {
		if (value === null && schema.isOptional() && !schema.safeParse(null).success) return undefined;
		if (schema instanceof z.ZodOptional || schema instanceof z.ZodLazy) return normalize(value, schema.unwrap() as z.ZodType);
		if (schema instanceof z.ZodUnion && value !== null && typeof value === "object") {
			const objectSchema = schema.options.find((option) => option instanceof z.ZodObject);
			if (objectSchema) return normalize(value, objectSchema as z.ZodType);
		}
		if (schema instanceof z.ZodArray && Array.isArray(value)) return value.map((entry) => normalize(entry, schema.element as z.ZodType));
		if (schema instanceof z.ZodObject && value !== null && typeof value === "object" && !Array.isArray(value)) {
			return Object.fromEntries(Object.entries(value).flatMap(([key, child]) => {
				const field = schema.shape[key] as z.ZodType | undefined;
				const next = field ? normalize(child, field) : child;
				return next === undefined ? [] : [[key, next]];
			}));
		}
		return value;
	};
	const result = normalize(structuredClone(input), mcpEntitySchemas[kind]) as Record<string, unknown>;
	if (kind !== "bestiary") return result;
	for (const field of ["size", "hits", "ability", "senses"]) {
		const value = result[field];
		if (value && typeof value === "object" && !Array.isArray(value)) result[field] = Object.fromEntries(Object.entries(value).filter(([, child]) => child !== null));
	}
	return normalizeMonsterForEditing(result as unknown as FullMonster);
}
