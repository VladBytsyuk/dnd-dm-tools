import { Notice, stringifyYaml } from "obsidian";
import { type FullMonster } from "../domain/monster";
import { TEXTS } from "src/res/texts_ru";

export function copyMonsterToClipboard(monster: FullMonster) {
    const yamlMonster = stringifyYaml(monster);
    const content = `\`\`\`statblock\ncreature: ${monster.name.rus}\n${yamlMonster}\n\`\`\``
    try {
        navigator.clipboard.writeText(content);
        new Notice(`${monster.name.rus}${TEXTS.noticeClipboardSuccess}`);
    } catch(e) {
        console.error(`Failed to save monster into clipboard: ${e}`);
    }
}
