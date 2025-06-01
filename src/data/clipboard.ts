import { Notice, parseYaml, stringifyYaml } from "obsidian";
import { type FullMonster } from "../domain/monster";
import { TEXTS } from "src/res/texts_ru";
import type { Encounter, EncounterParticipant } from "src/domain/encounter";
import { mapMonsterToEncounterParticipant } from "src/domain/mappers";
import type { FullSpell } from "src/domain/spell";

// ---- Copy to clipboard ----
export function copyMonsterToClipboard(monster: FullMonster) {
    copyToClipboard(monster, monster.name.rus, "statblock", `creature: ${monster.name.rus}`);
}

export function copyEncounterToClipboard(encounter: Encounter) {
    copyToClipboard(encounter, encounter.name, "encounter");
}

export function copySpellToClipboard(spell: FullSpell) {
    copyToClipboard(spell, spell.name.rus, "spell", `spell: ${spell.name.rus}`);    
}

function copyToClipboard<T>(obj: T, objName: string, codeBlockName: string, additionalContent: string | null = null) {
    const yaml = stringifyYaml(obj);
    const content = `\`\`\`${codeBlockName}\n${additionalContent ? `${additionalContent}\n`: ''}${yaml}\n\`\`\``
    try {
        navigator.clipboard.writeText(content);
        new Notice(`${objName}${TEXTS.noticeClipboardSuccess}`);
    } catch(e) {
        console.error(`Failed to save ${codeBlockName} into clipboard: ${e}`);
    }
}

// ---- Get from clipboard ----
export async function getEncounterParticipantFromClipboard(): Promise<EncounterParticipant | undefined> {
    const monster = await getFromClipboard<FullMonster>();
    if (monster) {
        return mapMonsterToEncounterParticipant(monster);
    } else {
        new Notice(`Не удалось прочитать статблок из буфера обмена`);   
        return undefined;
    }
}

export async function getEncounterFromClipboard(): Promise<Encounter | undefined> {
    return getFromClipboard<Encounter>();
}

async function getFromClipboard<T>(): Promise<T | undefined> {
    try {
        const clipboard = await navigator.clipboard.readText();
        const yaml = clipboard
            .split('\n')
            .filter((value) => !value.contains("\`\`\`"))
            .join('\n');
        const obj = parseYaml(yaml) as T;    
        return obj;
    } catch(e) {
        console.error(`Failed to read text from clipboard: ${e}`);
        new Notice(`Не удалось прочитать данные из буфера обмена`);   
    }
}
