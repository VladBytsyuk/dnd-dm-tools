import { Notice, parseYaml, stringifyYaml } from "obsidian";
import { type FullMonster } from "../domain/monster";
import { TEXTS } from "src/res/texts_ru";
import { monsterToEncounterParticipant } from "../domain/mappers";
import type { Encounter, EncounterParticipant } from "src/domain/encounter";

export function copyMonsterToClipboard(monster: FullMonster) {
    copyToClipboard(monster, monster.name.rus, "statblock", `creature: ${monster.name.rus}`);
}

export function copyEncounterToClipboard(encounter: Encounter) {
    copyToClipboard(encounter, encounter.name, "encounter");
}

const copyToClipboard = (obj: any, objName: string, codeBlockName: string, additionalContent: string | null = null) => {
    const yaml = stringifyYaml(obj);
    const content = `\`\`\`${codeBlockName}\n${additionalContent ? `${additionalContent}\n`: ''}${yaml}\n\`\`\``
    try {
        navigator.clipboard.writeText(content);
        new Notice(`${objName}${TEXTS.noticeClipboardSuccess}`);
    } catch(e) {
        console.error(`Failed to save ${codeBlockName} into clipboard: ${e}`);
    }
}

export async function getEncounterParticipantFromClipboard(): Promise<EncounterParticipant | undefined> {
    try {
        const clipboard = await navigator.clipboard.readText();
        const yaml = clipboard
            .split('\n')
            .filter((_, index, array) => index !== 0 && index !== (array.length - 1))
            .join('\n');
        const obj = parseYaml(yaml) as FullMonster;    
        return monsterToEncounterParticipant(obj);
    } catch(e) {
        console.error(`Failed to read text from clipboard: ${e}`);
    }
}

export const getClipboard = (): Promise<string> => navigator.clipboard.readText();
