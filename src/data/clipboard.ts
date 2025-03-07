import { Notice, stringifyYaml } from "obsidian";
import { type FullMonster } from "../domain/monster";
import { TEXTS } from "src/res/texts_ru";
import type { Encounter } from "src/domain/encounter";

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
