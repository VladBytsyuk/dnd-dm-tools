import { Notice, stringifyYaml, parseYaml } from "obsidian";
import type { Encounter } from "src/domain/models/encounter/Encounter";
import { mapCharacterSheetToEncounterParticipant, mapMonsterToEncounterParticipant } from "src/domain/mappers";
import type { FullSpell } from "src/domain/models/spell/FullSpell";
import type { DmScreenItem } from "src/domain/models/dm_screen/DmScreenItem";
import type { FullMonster } from "src/domain/models/monster/FullMonster";
import type { EncounterParticipant } from "src/domain/models/encounter/EncounterParticipant";
import type { FullWeapon } from "src/domain/models/weapon/FullWeapon";
import type { FullArmor } from "src/domain/models/armor/FullArmor";
import type { FullItem } from "src/domain/models/items/FullItem";
import type { FullArtifact } from "src/domain/models/artifact/FullArtifact";
import type { FullBackground } from "src/domain/models/background/FullBackground";
import type { FullFeat } from "../domain/models/feat/FullFeat";
import type { FullRace } from "../domain/models/race/FullRace";
import type { FullClass } from "../domain/models/class/FullClass";
import type { FullCharacterSheet } from "src/domain/models/character";

let lastWrittenClipboardText: string | undefined;

// ---- Copy to clipboard ----
export async function copyTextToClipboard(text: string, ignoreNotice: boolean = false): Promise<void> {
    try {
        await writeTextToClipboard(text);
        if (!ignoreNotice) showClipboardNotice(text);
    } catch(e) {
        console.error(`Failed to save text into clipboard: ${e}`);
    }
}

export function showClipboardNotice(text: string): void {
    const label = text.startsWith("[") && text.includes("](dnd:") ? "Ссылка" : text;
    new Notice(`${label} - успешно скопировано.`);
}

export function formatEntityMarkdownLink(russianName: string, url: string): string {
    const label = russianName.replace(/\\/g, "\\\\").replace(/\[/g, "\\[").replace(/\]/g, "\\]");
    const pluginUrl = url.startsWith("dnd:") ? url : `dnd:${url}`;
    return `[${label}](${pluginUrl})`;
}

export function copyMonsterToClipboard(monster: FullMonster, ignoreNotice: boolean = false): Promise<void> {
    return copyToClipboard(monster, monster.name.rus, "statblock", null, ignoreNotice);
}

export function copyEncounterToClipboard(encounter: Encounter): Promise<void> {
    return copyToClipboard(encounter, encounter.name, "encounter");
}

export function copySpellToClipboard(spell: FullSpell): Promise<void> {
    return copyToClipboard(spell, spell.name.rus, "spell", `spell: ${spell.name.rus}`);
}

export function copyDmScreenItem(dmScreenItem: DmScreenItem): Promise<void> {
    return copyToClipboard(dmScreenItem, dmScreenItem.name.rus, "screen")
}

export function copyWeaponToClipboard(weapon: FullWeapon): Promise<void> {
    return copyToClipboard(weapon, weapon.name.rus, "weapon");
}

export function copyArmorToClipboard(armor: FullArmor): Promise<void> {
    return copyToClipboard(armor, armor.name.rus, "armor");
}

export function copyEquipmentToClipboard(equipment: FullItem): Promise<void> {
    return copyToClipboard(equipment, equipment.name.rus, "equip");
}

export function copyArtifactToClipboard(artifact: FullArtifact): Promise<void> {
    return copyToClipboard(artifact, artifact.name.rus, "artifact");
}

export function copyBackgroundToClipboard(background: FullBackground): Promise<void> {
    return copyToClipboard(background, background.name.rus, "background");
}

export function copyFeatToClipboard(feat: FullFeat): Promise<void> {
    return copyToClipboard(feat, feat.name.rus, "feat");
}

export function copyRaceToClipboard(race: FullRace): Promise<void> {
    return copyToClipboard(race, race.name.rus, "race");
}

export function copyClassToClipboard(classItem: FullClass): Promise<void> {
    return copyToClipboard(classItem, classItem.name.rus, "dnd-class");
}

export function copyCharacterSheetToClipboard(character: FullCharacterSheet): boolean {
    const participant = mapCharacterSheetToEncounterParticipant(character);
    if (!participant) return false;
    void copyToClipboard(participant, participant.name, "encounter-participant");
    return true;
}

async function copyToClipboard<T>(obj: T, objName: string, codeBlockName: string, additionalContent: string | null = null, ignoreNotice: boolean = false): Promise<void> {
    const yaml = stringifyYaml(obj);
    const content = `\`\`\`${codeBlockName}\n${additionalContent ? `${additionalContent}\n`: ''}${yaml}\n\`\`\``
    try {
        await writeTextToClipboard(content);
        if (!ignoreNotice) new Notice(`${objName} - успешно скопировано.`);
    } catch(e) {
        console.error(`Failed to save ${codeBlockName} into clipboard: ${e}`);
    }
}

export async function writeTextToClipboard(text: string): Promise<void> {
    try {
        await navigator.clipboard.writeText(text);
        lastWrittenClipboardText = text;
        return;
    } catch (clipboardError) {
        try {
            copyTextWithDom(text);
            lastWrittenClipboardText = text;
        } catch {
            throw clipboardError;
        }
    }
}

function copyTextWithDom(text: string): void {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    if (!copied) throw new Error("Не удалось скопировать текст в буфер обмена.");
}

async function readTextFromClipboard(): Promise<string> {
    try {
        return await navigator.clipboard.readText();
    } catch (clipboardError) {
        if (lastWrittenClipboardText !== undefined) return lastWrittenClipboardText;
        throw clipboardError;
    }
}

function parseClipboardBlock<T>(clipboard: string, blockName: string): T | undefined {
    const normalized = clipboard.replace(/\r\n?/g, "\n").trim();
    const lines = normalized.split("\n");
    if (lines[0]?.trim() !== `\`\`\`${blockName}` || lines.at(-1)?.trim() !== "\`\`\`") return undefined;
    return parseYaml(lines.slice(1, -1).join("\n")) as T;
}

// ---- Get from clipboard ----
export async function getMonsterFromClipboard(ignoreNotice: boolean = false): Promise<FullMonster | undefined> {
    const monster = await getFromClipboard<FullMonster>("statblock");
    if (monster) {
        return monster;
    } else {
        if (!ignoreNotice) new Notice(`Не удалось прочитать существо из буфера обмена`);   
        return undefined;
    }
}

export async function getEncounterParticipantFromClipboard(ignoreNotice: boolean = false): Promise<EncounterParticipant | undefined> {
    try {
        const clipboard = await readTextFromClipboard();
        const characterParticipant = parseClipboardBlock<EncounterParticipant>(clipboard, "encounter-participant");
        if (characterParticipant) return characterParticipant;

        const monster = parseClipboardBlock<FullMonster>(clipboard, "statblock");
        if (monster) return mapMonsterToEncounterParticipant(monster);

        if (!ignoreNotice) new Notice(`Не удалось прочитать статблок из буфера обмена`);
    } catch (error) {
        console.error(`Failed to read encounter participant from clipboard: ${error}`);
        if (!ignoreNotice) new Notice(`Не удалось прочитать данные из буфера обмена`);
    }
    return undefined;
}

export async function getEncounterFromClipboard(): Promise<Encounter | undefined> {
    return getFromClipboard<Encounter>("encounter");
}

export async function getClassFromClipboard(ignoreNotice: boolean = false): Promise<FullClass | undefined> {
    const classItem = await getFromClipboard<FullClass>("dnd-class");
    if (classItem) return classItem;
    if (!ignoreNotice) new Notice(`Не удалось прочитать класс из буфера обмена`);
    return undefined;
}

export async function getFromClipboard<T>(blockName: string, ignoreNotice: boolean = false): Promise<T | undefined> {
    try {
        const clipboard = await readTextFromClipboard();
        const value = parseClipboardBlock<T>(clipboard, blockName);
        if (value === undefined) {
            throw new Error(`Clipboard content does not start with \`\`\`${blockName}`);   
        }
        return value;
    } catch(e) {
        console.error(`Failed to read text from clipboard: ${e}`);
        if (!ignoreNotice) new Notice(`Не удалось прочитать данные из буфера обмена`);
        return undefined;
    }
}
