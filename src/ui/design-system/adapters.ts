import type { PanelKey } from "src/domain/models/assistant/AssistantWorkspace";
import type { FullStatblockViewModel } from "@dnd-dm-tools/design-system";
import type { FullSpellViewModel } from "@dnd-dm-tools/design-system";
import type { FullWeaponViewModel } from "@dnd-dm-tools/design-system";
import type { FullArmorViewModel } from "@dnd-dm-tools/design-system";
import type { FullEquipmentViewModel } from "@dnd-dm-tools/design-system";
import type { FullArtifactViewModel } from "@dnd-dm-tools/design-system";
import type { FullFeatViewModel } from "@dnd-dm-tools/design-system";
import type { FullBackgroundViewModel } from "@dnd-dm-tools/design-system";
import type { FullRaceViewModel } from "@dnd-dm-tools/design-system";
import type { FullClassViewModel } from "@dnd-dm-tools/design-system";

export type FullViewModel = FullStatblockViewModel | FullSpellViewModel | FullWeaponViewModel
	| FullArmorViewModel | FullEquipmentViewModel | FullArtifactViewModel | FullFeatViewModel
	| FullBackgroundViewModel | FullRaceViewModel | FullClassViewModel;

type Entity = Record<string, any>;

export function entityUrlPrefix(kind: PanelKey): string {
	switch (kind) {
		case "bestiary": return "/bestiary/";
		case "spellbook": return "/spells/";
		case "arsenal": return "/weapons/";
		case "armory": return "/armors/";
		case "equipment": return "/items/";
		case "artifactory": return "/items/magic/";
		case "backgrounds": return "/backgrounds/";
		case "feats": return "/feats/";
		case "races": return "/races/";
		case "classes": return "/classes/";
		default: return "";
	}
}

export function cloneDesignData<T>(value: T): T {
	if (Array.isArray(value)) return value.map(cloneDesignData) as T;
	if (value && typeof value === "object") {
		return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, cloneDesignData(entry)])) as T;
	}
	return value;
}

export function toSmallCardProps(kind: PanelKey, item: Entity): Entity {
	const name = item.name ?? {};
	const common = { title: name.rus ?? "", subtitle: name.eng ?? "", source: item.source?.shortName ?? "" };
	switch (kind) {
		case "bestiary": return { ...common, challengeRating: item.challengeRating ?? "—", creatureTypeColor: creatureColor(typeName(item.type)), description: typeName(item.type) };
		case "spellbook": return { ...common, level: item.level ?? 0, school: item.school ?? "", schoolColor: schoolColor(item.school ?? ""), concentration: item.concentration, ritual: item.ritual, components: { verbal: item.components?.v ?? item.components?.verbal, somatic: item.components?.s ?? item.components?.somatic, material: item.components?.m ?? item.components?.material } };
		case "arsenal": return { ...common, weaponTypeColor: weaponColor(typeName(item.type)), damage: damageText(item.damage), range: item.type?.name ?? "", price: item.price ?? "" };
		case "armory": return { ...common, armorTypeColor: armorColor(typeName(item.type)), armorClass: item.armorClass ?? "", weight: item.weight === undefined ? "" : String(item.weight) };
		case "equipment": return common;
		case "artifactory": return { ...common, rarity: item.rarity?.name ?? item.rarity?.type ?? "", rarityColor: rarityColor(item.rarity?.type), customization: Boolean(item.customization) };
		case "backgrounds": return common;
		case "feats": return { ...common, description: item.requirements ?? "" };
		case "races": return { ...common, description: (item.abilities ?? []).map((ability: Entity) => `${ability.name ?? ability.key} +${ability.value}`).join(", ") };
		case "classes": return { ...common, classColor: "var(--ds-paladin)", description: item.dice ?? "" };
		default: return common;
	}
}

export function createEmptyDomainItem(kind: PanelKey): Entity | undefined {
	const base = { name: { rus: "", eng: "" }, url: "", origin: "manual", source: { shortName: "", name: "", group: { shortName: "", name: "" } } };
	switch (kind) {
		case "bestiary": return { ...base, type: "", challengeRating: "—", id: 0, images: [], ability: { str: 10, dex: 10, con: 10, int: 10, wiz: 10, cha: 10 }, hits: { average: 0 }, senses: { senses: [] } };
		case "spellbook": return { ...base, level: 0, school: "", components: { verbal: false, somatic: false }, range: "", duration: "", time: "", description: "" };
		case "arsenal": return { ...base, type: { name: "" }, damage: { dice: "", type: "" }, price: "", weight: 0, properties: [], description: "" };
		case "armory": return { ...base, type: { name: "" }, armorClass: "", price: "", weight: 0, duration: "", description: "" };
		case "equipment": return { ...base, categories: [], description: "" };
		case "artifactory": return { ...base, type: { name: "" }, price: { dmg: null, xge: null }, rarity: { type: "", name: "", short: "" }, cost: { dmg: "", xge: "" }, images: [], description: "" };
		case "backgrounds": return { ...base, skills: [], toolOwnership: "", equipments: [], startGold: 0, description: "" };
		case "feats": return { ...base, requirements: "", description: "" };
		case "races": return { ...base, abilities: [], type: { name: "" }, description: "", size: "", speed: [], skills: [] };
		default: return undefined;
	}
}

export function toFullViewModel(kind: PanelKey, item: Entity): FullViewModel {
	const names = { russianName: item.name?.rus ?? "", englishName: item.name?.eng ?? "", entityLink: item.url ?? "" };
	const source = mapSource(item.source);
	switch (kind) {
		case "bestiary": return {
			...names, challengeRating: item.challengeRating ?? "—", creatureType: typeName(item.type), source,
			images: item.images ?? [], size: item.size?.rus ?? typeName(item.size), alignment: item.alignment,
			armorClass: item.armorClass, hitPoints: item.hits?.average === undefined ? "" : String(item.hits.average), hitPointsFormula: hitPointsFormula(item.hits), speed: speedText(item.speed),
			abilities: abilityEntries(item.ability), savingThrows: namedValues(item.savingThrows), savingThrowsHtml: namedValuesHtml(item.savingThrows), skills: namedValues(item.skills), skillsHtml: namedValuesHtml(item.skills),
			damageVulnerabilities: stringList(item.damageVulnerabilities), damageResistances: stringList(item.damageResistances),
			damageImmunities: stringList(item.damageImmunities), conditionImmunities: stringList(item.conditionImmunities),
			senses: sensesText(item.senses), languages: stringList(item.languages), experience: item.experience,
			proficiencyBonus: item.proficiencyBonus, traits: richItems(item.feats), actions: actionSection("Действия", item.actions),
			bonusActions: actionSection("Бонусные действия", item.bonusActions), reactions: actionSection("Реакции", item.reactions),
			legendaryActions: actionSection("Легендарные действия", item.legendary?.list, item.legendary?.description),
			mythicActions: actionSection("Мифические действия", item.mythic?.list, item.mythic?.description),
			lair: item.lair ? { descriptionHtml: item.lair.description, actionsHtml: item.lair.action, regionalEffectsHtml: item.lair.effect } : undefined,
			descriptionHtml: item.description, tags: richItems(item.tags), environment: item.environment,
		} as FullStatblockViewModel;
		case "spellbook": return {
			...names, level: item.level ?? 0, school: item.school ?? "", additionalType: item.additionalType,
			components: mapSpellComponents(item.components),
			source, concentration: item.concentration, ritual: item.ritual, range: item.range ?? "", duration: item.duration ?? "", time: item.time ?? "",
			classes: classLinks(item.classes), subclasses: classLinks(item.subclasses), description: { html: item.description ?? "" },
			higherLevels: { html: item.upper ?? "" },
		} as FullSpellViewModel;
		case "arsenal": return { ...names, weaponType: typeName(item.type), damage: damageText(item.damage), price: item.price ?? "", weight: String(item.weight ?? ""), source, properties: (item.properties ?? []).map((p: Entity) => ({ name: p.name, url: p.url, distance: p.distance, description: p.description ? { html: p.description } : undefined })), description: item.description ? { html: item.description } : undefined, special: item.special ? { html: item.special } : undefined } as FullWeaponViewModel;
		case "armory": { const [donningTime, doffingTime] = splitArmorDuration(item.duration ?? ""); return { ...names, armorType: typeName(item.type), armorClass: item.armorClass ?? "", price: item.price ?? "", weight: String(item.weight ?? ""), source, stealthDisadvantage: item.disadvantage, strengthRequirement: item.requirement, donningTime, doffingTime, description: item.description ? { html: item.description } : undefined } as FullArmorViewModel; }
		case "equipment": return { ...names, source, categories: item.categories ?? [], price: item.price, weight: item.weight, homebrew: item.homebrew, description: item.description ? { html: item.description } : undefined } as FullEquipmentViewModel;
		case "artifactory": return { ...names, origin: item.origin, type: { name: typeName(item.type) }, price: item.price ?? { dmg: null, xge: null }, source, rarity: { type: item.rarity?.type ?? "", name: item.rarity?.name ?? "", short: item.rarity?.short ?? "" }, customization: item.customization, homebrew: item.homebrew, description: { html: item.description ?? "" }, detailType: (item.detailType ?? []).map((v: Entity) => ({ name: v.name, type: v.type, url: v.url ?? null })), cost: item.cost, images: item.images ?? [], detailCustomization: item.detailCustomization } as FullArtifactViewModel;
		case "backgrounds": return { ...names, source, skills: item.skills ?? [], toolOwnership: { html: item.toolOwnership ?? "" }, equipments: (item.equipments ?? []).map((html: string) => ({ html })), startGold: item.startGold ?? 0, description: { html: item.description ?? "" }, language: item.language, skillName: item.skillName, skillDescription: item.skillDescription ? { html: item.skillDescription } : undefined, personalizationTables: item.personalizationTables ?? [], origin: item.origin, homebrew: item.homebrew, associatedUrl: item.associatedUrl, associatedHtml: item.associatedHtml ? { html: item.associatedHtml } : undefined, personalization: item.personalization ? { html: item.personalization } : undefined } as FullBackgroundViewModel;
		case "feats": return { ...names, requirements: item.requirements ?? "", source, description: { html: item.description ?? "" }, origin: item.origin, homebrew: item.homebrew } as FullFeatViewModel;
		case "races": return { ...names, type: item.type ?? { name: "" }, group: item.group, source, abilities: (item.abilities ?? []).map((a: Entity) => ({ key: a.key ?? a.ability, name: a.name ?? a.key ?? "", shortName: a.shortName ?? a.key ?? "", value: a.value ?? a.bonus ?? 0 })), size: item.size ?? "", speed: item.speed ?? [], skills: (item.skills ?? []).map((s: Entity) => ({ name: s.name, html: s.description ?? "" })), description: { html: item.description ?? "" }, additionalSections: item.additionalSections ?? [], origin: item.origin, image: item.image, subraces: item.subraces?.map((sub: Entity) => toFullViewModel("races", sub) as FullRaceViewModel) } as FullRaceViewModel;
		case "classes": return { ...names, dice: item.dice ?? "", source, isArchetype: item.isArchetype ?? false, parentClassUrl: item.parentClassUrl, archetypeType: item.archetypeType, associatedUrl: item.associatedUrl, associatedContent: item.associatedHtml ? { html: item.associatedHtml } : undefined, origin: item.origin } as FullClassViewModel;
		default: throw new Error(`Unsupported redesign panel: ${kind}`);
	}
}

export function applyFullViewModel(kind: PanelKey, original: Entity, view: FullViewModel): Entity {
	const item = cloneDesignData(original);
	item.name = { ...item.name, rus: view.russianName, eng: view.englishName };
	item.url = view.entityLink;
	if ("source" in view && view.source) item.source = { ...item.source, shortName: view.source.shortName, name: view.source.name, group: { ...item.source?.group, ...view.source.group }, homebrew: view.source.homebrew };
	switch (kind) {
		case "bestiary": {
			const v = view as FullStatblockViewModel;
			item.challengeRating = String(v.challengeRating); item.type = typeof item.type === "string" ? v.creatureType : { ...item.type, name: v.creatureType }; item.armorClass = numberValue(v.armorClass, item.armorClass);
			item.alignment = v.alignment ?? ""; item.experience = numberValue(v.experience, item.experience); item.proficiencyBonus = String(v.proficiencyBonus ?? "");
			item.size = typeof item.size === "string" ? v.size ?? "" : { ...item.size, rus: v.size ?? "" };
			item.description = v.descriptionHtml ?? ""; item.images = v.images ?? [];
			item.hits = { ...item.hits, average: numberValue(v.hitPoints, item.hits?.average), formula: v.hitPointsFormula ?? "", sign: "", bonus: 0 };
			item.speed = parseSpeed(v.speed, item.speed); item.ability = applyAbilities(item.ability, v.abilities); item.feats = applyRichItems(item.feats, v.traits);
			item.savingThrows = parseNamedValues(v.savingThrows, item.savingThrows, true);
			item.skills = parseNamedValues(v.skills, item.skills);
			item.damageVulnerabilities = parseStringList(v.damageVulnerabilities);
			item.damageResistances = parseStringList(v.damageResistances);
			item.damageImmunities = parseStringList(v.damageImmunities);
			item.conditionImmunities = parseStringList(v.conditionImmunities);
			item.senses = parseSenses(v.senses, item.senses);
			item.languages = parseStringList(v.languages);
			item.environment = v.environment ?? [];
			item.actions = applyActions(item.actions, v.actions); item.bonusActions = applyActions(item.bonusActions, v.bonusActions); item.reactions = applyActions(item.reactions, v.reactions);
			if (item.legendary || v.legendaryActions?.items.length || v.legendaryActions?.descriptionHtml) item.legendary = { ...item.legendary, list: applyActions(item.legendary?.list, v.legendaryActions), description: v.legendaryActions?.descriptionHtml ?? item.legendary?.description ?? "" };
			if (item.mythic || v.mythicActions?.items.length || v.mythicActions?.descriptionHtml) item.mythic = { ...item.mythic, list: applyActions(item.mythic?.list, v.mythicActions), description: v.mythicActions?.descriptionHtml ?? item.mythic?.description ?? "" };
			item.tags = (v.tags ?? []).map(t => ({ name: t.title, description: t.html }));
			if (v.lair) item.lair = { ...item.lair, description: v.lair.descriptionHtml ?? "", action: v.lair.actionsHtml ?? "", effect: v.lair.regionalEffectsHtml ?? "" };
			break;
		}
		case "spellbook": { const v = view as FullSpellViewModel; item.level = numberValue(v.level, item.level); item.school = v.school; item.additionalType = v.additionalType; item.range = v.range; item.duration = v.duration; item.time = v.time; item.concentration = v.concentration; item.ritual = v.ritual; item.description = v.description.html; item.upper = v.higherLevels?.html; item.components = { ...item.components, v: v.components.verbal, s: v.components.somatic, m: v.components.material }; break; }
		case "arsenal": { const v = view as FullWeaponViewModel; item.type = { ...item.type, name: v.weaponType }; item.damage = parseWeaponDamage(v.damage, item.damage); item.description = v.description?.html; item.special = v.special?.html; item.weight = numberValue(v.weight, item.weight); item.price = v.price; item.properties = v.properties.map(p => ({ ...p, description: p.description?.html })); break; }
		case "armory": { const v = view as FullArmorViewModel; item.type = { ...item.type, name: v.armorType }; item.armorClass = v.armorClass; item.price = v.price; item.weight = numberValue(v.weight, item.weight); item.disadvantage = v.stealthDisadvantage; item.requirement = v.strengthRequirement; item.duration = joinArmorDuration(v.donningTime, v.doffingTime); item.description = v.description?.html ?? ""; break; }
		case "equipment": { const v = view as FullEquipmentViewModel; item.categories = v.categories; item.price = v.price; item.weight = v.weight; item.description = v.description?.html ?? ""; item.homebrew = v.homebrew; break; }
		case "artifactory": { const v = view as FullArtifactViewModel; item.type = { ...item.type, name: v.type.name }; item.price = v.price; item.rarity = { ...item.rarity, ...v.rarity }; item.customization = v.customization; item.description = v.description.html; item.detailType = v.detailType; item.cost = v.cost; item.images = v.images; item.detailCustomization = v.detailCustomization; item.homebrew = v.homebrew; break; }
		case "backgrounds": { const v = view as FullBackgroundViewModel; item.skills = v.skills; item.toolOwnership = v.toolOwnership.html; item.equipments = v.equipments.map(e => e.html); item.startGold = numberValue(v.startGold, item.startGold); item.description = v.description.html; item.language = v.language; item.skillName = v.skillName; item.skillDescription = v.skillDescription?.html; item.personalizationTables = v.personalizationTables ?? []; item.associatedHtml = v.associatedHtml?.html; item.personalization = v.personalization?.html; item.homebrew = v.homebrew; break; }
		case "feats": { const v = view as FullFeatViewModel; item.requirements = v.requirements; item.description = v.description.html; item.homebrew = v.homebrew; break; }
		case "races": { const v = view as FullRaceViewModel; item.type = typeof item.type === "string" ? v.type : { ...item.type, ...v.type }; item.group = v.group; item.abilities = v.abilities.map(a => ({ key: a.key, name: a.name, value: a.value })); item.size = v.size; item.speed = v.speed; item.skills = v.skills.map(s => ({ name: s.name, description: s.html })); item.description = v.description.html; item.additionalSections = v.additionalSections ?? []; item.image = v.image; item.subraces = v.subraces?.map((sub, index) => applyFullViewModel("races", item.subraces?.[index] ?? {}, sub)); break; }
	}
	if (original.origin === "remote" || !original.origin) item.origin = "manual";
	return item;
}

function mapSource(source: Entity = {}) { return { shortName: source.shortName ?? "", name: source.name ?? "", group: { shortName: source.group?.shortName ?? "", name: source.group?.name ?? "" }, homebrew: source.homebrew }; }
function splitArmorDuration(duration: string): [string, string] {
	const separatorIndex = duration.indexOf("/");
	if (separatorIndex < 0) return [duration, ""];
	return [duration.slice(0, separatorIndex).trim(), duration.slice(separatorIndex + 1).trim()];
}
function joinArmorDuration(donningTime: string, doffingTime: string): string {
	return doffingTime ? `${donningTime}/${doffingTime}` : donningTime;
}
function mapSpellComponents(value: Entity = {}) {
	const material = value.m ?? value.material;
	return {
		verbal: booleanValue(value.v ?? value.verbal) ?? false,
		somatic: booleanValue(value.s ?? value.somatic) ?? false,
		material: typeof material === "string" ? material : material?.description ?? material?.value ?? material?.name ?? undefined,
	};
}
function booleanValue(value: unknown): boolean | undefined {
	if (typeof value === "boolean") return value;
	if (typeof value === "string") {
		if (["true", "yes", "да", "v", "s"].includes(value.trim().toLocaleLowerCase("ru"))) return true;
		if (["false", "no", "нет", ""].includes(value.trim().toLocaleLowerCase("ru"))) return false;
	}
	return undefined;
}
function typeName(type: any): string { return typeof type === "string" ? type : type?.name ?? type?.rus ?? ""; }
function damageText(damage: any): string { return [damage?.dice, damage?.type].filter(Boolean).join(" "); }
function parseWeaponDamage(value: string, fallback: Entity = {}): Entity {
	const text = value.trim();
	if (!text) return { ...fallback, dice: undefined, type: "" };
	const match = text.match(/^((?:\d+)?[кd]\d+(?:\s*[+-]\s*\d+)?|\d+)(?:\s+(.+))?$/iu);
	if (!match) return { ...fallback, dice: undefined, type: text };
	return { ...fallback, dice: match[1], type: match[2] ?? "" };
}
function weaponColor(type: string): string { return type.toLocaleLowerCase().includes("дальн") ? "var(--ds-weapon-matrial-ranged)" : "var(--ds-weapon-simple-melee)"; }
function creatureColor(type: string): string { const value = type.toLocaleLowerCase("ru"); return value.includes("гуманоид") ? "var(--ds-bestiary-humanoid)" : value.includes("нежит") ? "var(--ds-bestiary-undead)" : value.includes("дракон") ? "var(--ds-bestiary-dragon)" : value.includes("небес") ? "var(--ds-bestiary-celestial)" : value.includes("исчади") ? "var(--ds-bestiary-infernal)" : value.includes("слиз") ? "var(--ds-bestiary-slime)" : value ? "var(--ds-bestiary-magical)" : "var(--ds-bestiary-regular)"; }
function schoolColor(school: string): string { const value = school.toLocaleLowerCase("ru"); return value.includes("вызов") ? "var(--ds-conjuration)" : value.includes("преграж") ? "var(--ds-abjurer)" : value.includes("прориц") ? "var(--ds-divination)" : value.includes("очаров") ? "var(--ds-enchantment)" : value.includes("воплощ") ? "var(--ds-evocation)" : value.includes("иллюз") ? "var(--ds-illusion)" : value.includes("некром") ? "var(--ds-necromancy)" : value.includes("преобраз") ? "var(--ds-transmutation)" : "var(--ds-spell)"; }
function armorColor(type: string): string { return type.toLocaleLowerCase().includes("тяж") ? "var(--ds-armor-heavy)" : type.toLocaleLowerCase().includes("сред") ? "var(--ds-armor-medium)" : "var(--ds-armor-light)"; }
function rarityColor(type: string): string { return ({ common: "var(--ds-artifact-regular)", regular: "var(--ds-artifact-regular)", uncommon: "var(--ds-artifact-uncommon)", rare: "var(--ds-artifact-rare)", very_rare: "var(--ds-artifact-very-rare)", legendary: "var(--ds-artifact-legendary)", artifact: "var(--ds-artifact-artifact)" } as Record<string, string>)[type] ?? "var(--ds-artifact-rare)"; }
function stringList(value: any): string { return Array.isArray(value) ? value.join(", ") : value ?? ""; }
function namedValues(value: any): string { return Array.isArray(value) ? value.map(v => v.name ? `${v.name} ${v.value ?? ""}`.trim() : v.value ?? "").join(", ") : ""; }
function namedValuesHtml(value: any): string {
	if (!Array.isArray(value)) return "";
	return value.map((entry: Entity) => {
		const name = String(entry.name ?? "");
		const rawValue = String(entry.value ?? "").trim();
		const modifier = Number(rawValue.replace("−", "-"));
		if (!rawValue || !Number.isFinite(modifier)) return `${escapeHtml(name)}${rawValue ? ` ${escapeHtml(rawValue)}` : ""}`;
		const signedModifier = modifier < 0 ? `-${Math.abs(modifier)}` : `+${modifier}`;
		const visibleModifier = signedModifier.replace("-", "−");
		return `<dice-roller label="${escapeHtmlAttribute(name)}" formula="к20 ${signedModifier}">${escapeHtml(name)} ${visibleModifier}</dice-roller>`;
	}).join(", ");
}
function escapeHtml(value: string): string { return value.replace(/&/gu, "&amp;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;"); }
function escapeHtmlAttribute(value: string): string { return escapeHtml(value).replace(/"/gu, "&quot;"); }
function richItems(value: any): { title: string; html: string }[] { return (value ?? []).map((v: Entity) => ({ title: v.name ?? v.title ?? "", html: v.value ?? v.description ?? v.html ?? v.text ?? "" })); }
function actionSection(title: string, values: any[] = [], description?: string) { return { title, descriptionHtml: description ?? "", items: (values ?? []).map((v: Entity) => ({ title: v.name ?? v.title ?? "", html: v.value ?? v.description ?? v.html ?? v.text ?? "" })) }; }
function classLinks(values: any[] = []) { return values.map(v => ({ name: v.name?.rus ?? v.name ?? "", url: v.url ?? "", parentClass: v.parentClass })); }
function speedText(values: any[] = []): string { return values.map(v => `${v.name ?? ""} ${v.value ?? ""}${v.additional ? ` ${v.additional}` : ""}`.trim()).join(", "); }
function hitPointsFormula(value: any): string {
	if (!value?.formula) return "";
	const bonus = Number(value.bonus ?? 0);
	return `${value.formula}${bonus !== 0 ? `${value.sign || (bonus < 0 ? "-" : "+")}${Math.abs(bonus)}` : ""}`;
}
function sensesText(value: any): string { return value ? [value.senses?.map((v: Entity) => `${v.name} ${v.value ?? ""}`).join(", "), value.passivePerception ? `Пассивное восприятие ${value.passivePerception}` : ""].filter(Boolean).join("; ") : ""; }
function abilityEntries(value: any) { return [["str", "СИЛ"], ["dex", "ЛОВ"], ["con", "ТЕЛ"], ["int", "ИНТ"], ["wiz", "МДР"], ["cha", "ХАР"]].map(([key, label]) => { const score = Number(value?.[key] ?? 10); return { label, score, modifier: Math.floor((score - 10) / 2) }; }); }
function numberValue(value: unknown, fallback: number): number { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : fallback; }
function parseSpeed(text: string | undefined, fallback: any[] = []) {
	if (!text) return fallback;
	return text.split(",").map((part, index) => {
		const value = part.trim();
		const match = value.match(/^(.*?)\s*(\d+)(?:\s+(.*))?$/u);
		if (!match) return fallback[index] ?? { name: value, value: undefined, additional: "" };
		return { name: match[1].trim(), value: Number(match[2]), additional: match[3]?.trim() ?? "" };
	});
}
function parseStringList(text: string | undefined): string[] { return text?.split(",").map(value => value.trim()).filter(Boolean) ?? []; }
function parseSenses(text: string | undefined, fallback: Entity = {}) {
	if (text === undefined) return fallback;
	const parts = text.split(";").map(value => value.trim()).filter(Boolean);
	const passive = parts.find(value => /пассивное восприятие/i.test(value));
	const passivePerception = passive?.match(/\d+/)?.[0] ?? "";
	const senseText = parts.filter(value => value !== passive).join(", ");
	const senses = senseText ? senseText.split(",").map((part, index) => {
		const value = part.trim();
		const match = value.match(/^(.*?)\s+(\d+)(?:\s+фут(?:а|ов)?)?$/iu);
		return match
			? { name: match[1].trim(), value: Number(match[2]) }
			: fallback.senses?.[index] ?? { name: value, value: 0 };
	}) : [];
	return { ...fallback, passivePerception, senses };
}
function parseNamedValues(text: string | undefined, fallback: any[] = [], savingThrows = false): any[] {
	if (text === undefined) return fallback;
	return text.split(",").map(part => {
		const [name = "", value = ""] = part.trim().split(/\s+(?=[+−-]?\d)/u);
		const numericValue = Number(value.replace("−", "-"));
		return savingThrows ? { name, shortName: name.slice(0, 3), value: Number.isFinite(numericValue) ? numericValue : 0 } : { name, value: value || "" };
	}).filter(value => value.name);
}
function applyAbilities(target: Entity = {}, values: FullStatblockViewModel["abilities"] = []) { const keys = ["str", "dex", "con", "int", "wiz", "cha"]; return Object.fromEntries(keys.map((key, i) => [key, numberValue(values?.[i]?.score, target[key] ?? 10)])); }
function applyRichItems(target: any[] = [], values: FullStatblockViewModel["traits"] = []) { return values?.map((v, i) => ({ ...(target[i] ?? {}), name: v.title, value: v.html })) ?? []; }
function applyActions(target: any[] = [], section?: FullStatblockViewModel["actions"]) { return section?.items.map((v, i) => ({ ...(target[i] ?? {}), name: v.title, value: v.html })) ?? []; }
