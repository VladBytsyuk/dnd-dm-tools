import { calculateModifier, formatModifier } from "../../modifier";
import type { FullWeapon } from "../weapon/FullWeapon";
import type { FullMonster } from "./FullMonster";
import type { MonsterCombatAction } from "./MonsterCombatAction";

interface ParsedDamage {
    average: number;
    formula?: string;
}

const DAMAGE_TYPE_GENITIVE: Record<string, string> = {
    "дробящий": "дробящего",
    "колющий": "колющего",
    "рубящий": "рубящего",
};

export function createMonsterWeaponAction(
    monster: FullMonster,
    weapon: FullWeapon,
): MonsterCombatAction {
    validateWeapon(weapon);

    const finesse = hasProperty(weapon, ["фехтовальное", "finesse"], ["/finesse"]);
    const thrown = hasProperty(weapon, ["метательное", "thrown"], ["/thrown"]);
    const ranged = isRangedWeapon(weapon);
    const abilityModifier = getWeaponAbilityModifier(monster, ranged, finesse);
    const proficiencyBonus = parseProficiencyBonus(monster.proficiencyBonus);
    const attackBonus = abilityModifier + proficiencyBonus;
    const damage = parseDamage(weapon.damage.dice!, abilityModifier);
    const attackKind = thrown && !ranged
        ? "Рукопашная или дальнобойная атака оружием"
        : ranged
            ? "Дальнобойная атака оружием"
            : "Рукопашная атака оружием";
    const targeting = buildTargetingText(weapon, ranged, thrown);
    const damageType = DAMAGE_TYPE_GENITIVE[weapon.damage.type.trim().toLowerCase()]
        ?? escapeHtml(weapon.damage.type.trim());
    const attackFormula = formatFormula("к20", attackBonus);
    const damageRoll = damage.formula
        ? `&nbsp;(<dice-roller label="Урон" formula="${damage.formula}"/>)`
        : "";

    return {
        name: weapon.name.rus.trim(),
        weaponUrl: weapon.url,
        value: `<p><em>${attackKind}:</em> <dice-roller label="Атака" formula="${attackFormula}">${formatModifier(attackBonus)}</dice-roller> к попаданию, ${targeting}<em>Попадание:</em>&nbsp;${damage.average}${damageRoll} ${damageType} урона.</p>`,
    };
}

function validateWeapon(weapon: FullWeapon): void {
    if (!weapon?.name?.rus?.trim()) throw new Error("У оружия отсутствует название.");
    if (!weapon.url?.startsWith("/weapons/")) throw new Error("У оружия отсутствует корректная ссылка.");
    if (!weapon.type?.name?.trim()) throw new Error("У оружия отсутствует тип.");
    if (!weapon.damage?.type?.trim() || weapon.damage.type.trim().toLowerCase() === "без урона") {
        throw new Error("Оружие не наносит урон.");
    }
    if (!weapon.damage.dice?.trim()) throw new Error("У оружия отсутствует формула урона.");
}

function getWeaponAbilityModifier(monster: FullMonster, ranged: boolean, finesse: boolean): number {
    const strength = calculateModifier(monster.ability?.str ?? 10);
    const dexterity = calculateModifier(monster.ability?.dex ?? 10);
    if (finesse) return Math.max(strength, dexterity);
    return ranged ? dexterity : strength;
}

function parseProficiencyBonus(value: string | undefined): number {
    const parsed = Number.parseInt(value ?? "0", 10);
    return Number.isFinite(parsed) ? parsed : 0;
}

function parseDamage(value: string, modifier: number): ParsedDamage {
    const normalized = value.trim().replace(/[dD]/g, "к");
    const diceMatch = normalized.match(/^(\d*)к(\d+)$/);
    if (diceMatch) {
        const count = diceMatch[1] ? Number.parseInt(diceMatch[1], 10) : 1;
        const faces = Number.parseInt(diceMatch[2], 10);
        if (count < 1 || faces < 1) throw new Error("Некорректная формула урона оружия.");
        return {
            average: Math.max(0, Math.floor(count * (faces + 1) / 2 + modifier)),
            formula: formatFormula(`${count}к${faces}`, modifier),
        };
    }

    if (/^\d+$/.test(normalized)) {
        return { average: Math.max(0, Number.parseInt(normalized, 10) + modifier) };
    }

    throw new Error("Формула урона оружия не поддерживается.");
}

function isRangedWeapon(weapon: FullWeapon): boolean {
    const type = weapon.type.name.toLowerCase();
    return type.includes("дальнобойн") || type.includes("ranged");
}

function buildTargetingText(weapon: FullWeapon, ranged: boolean, thrown: boolean): string {
    const hasReach = hasProperty(weapon, ["досягаемость", "reach"], ["/reach"]);
    const reach = hasReach ? 10 : 5;
    const distance = findDistance(weapon, thrown);

    if (thrown && !ranged) {
        const range = distance ? ` или дистанция ${escapeHtml(distance)} фт.` : "";
        return `досягаемость ${reach} фт.${range}, одна цель. `;
    }
    if (ranged) {
        return distance
            ? `дистанция ${escapeHtml(distance)} фт., одна цель. `
            : "одна цель. ";
    }
    return `досягаемость ${reach} фт., одна цель. `;
}

function findDistance(weapon: FullWeapon, preferThrown: boolean): string | undefined {
    const candidates = preferThrown
        ? [["метательное", "thrown"], ["боеприпас", "ammunition"]]
        : [["боеприпас", "ammunition"], ["метательное", "thrown"]];

    for (const names of candidates) {
        const property = (weapon.properties ?? []).find((item) => propertyMatches(item, names, names.map((name) => `/${name}`)));
        if (property?.distance?.trim()) return property.distance.trim();
    }
    return (weapon.properties ?? []).find((item) => item.distance?.trim())?.distance?.trim();
}

function hasProperty(weapon: FullWeapon, names: string[], urlSuffixes: string[]): boolean {
    return (weapon.properties ?? []).some((property) => propertyMatches(property, names, urlSuffixes));
}

function propertyMatches(
    property: FullWeapon["properties"][number],
    names: string[],
    urlSuffixes: string[],
): boolean {
    const name = property.name?.trim().toLowerCase() ?? "";
    const url = property.url?.trim().toLowerCase() ?? "";
    return names.includes(name) || urlSuffixes.some((suffix) => url.endsWith(suffix));
}

function formatFormula(base: string, modifier: number): string {
    if (modifier > 0) return `${base} + ${modifier}`;
    if (modifier < 0) return `${base} - ${Math.abs(modifier)}`;
    return base;
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
