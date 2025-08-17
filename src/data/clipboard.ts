import { Notice, parseYaml, stringifyYaml } from "obsidian";
import type { Encounter } from "src/domain/models/encounter/Encounter";
import { mapMonsterToEncounterParticipant } from "src/domain/mappers";
import type { FullSpell } from "src/domain/models/spell/FullSpell";
import type { DmScreenItem } from "src/domain/models/dm_screen/DmScreenItem";
import type { FullMonster } from "src/domain/models/monster/FullMonster";
import type { EncounterParticipant } from "src/domain/models/encounter/EncounterParticipant";
import type { FullWeapon } from "src/domain/models/weapon/FullWeapon";
import type { FullArmor } from "src/domain/models/armor/FullArmor";
import type { FullItem } from "src/domain/models/items/FullItem";
import type { FullArtifact } from "src/domain/models/artifact/FullArtifact";

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

export function copyDmScreenItem(dmScreenItem: DmScreenItem) {
    copyToClipboard(dmScreenItem, dmScreenItem.name.rus, "screen")
}

export function copyWeaponToClipboard(weapon: FullWeapon) {
    copyToClipboard(weapon, weapon.name.rus, "weapon");
}

export function copyArmorToClipboard(armor: FullArmor) {
    copyToClipboard(armor, armor.name.rus, "armor");
}

export function copyEquipmentToClipboard(equipment: FullItem) {
    copyToClipboard(equipment, equipment.name.rus, "equip");
}

export function copyArtifactToClipboard(artifact: FullArtifact) {
    copyToClipboard(artifact, artifact.name.rus, "artifact");
}

function copyToClipboard<T>(obj: T, objName: string, codeBlockName: string, additionalContent: string | null = null) {
    const yaml = stringifyYaml(obj);
    const content = `\`\`\`${codeBlockName}\n${additionalContent ? `${additionalContent}\n`: ''}${yaml}\n\`\`\``
    try {
        navigator.clipboard.writeText(content);
        new Notice(`${objName} - успешно скопировано.`);
    } catch(e) {
        console.error(`Failed to save ${codeBlockName} into clipboard: ${e}`);
    }
}

// ---- Get from clipboard ----
export async function getEncounterParticipantFromClipboard(): Promise<EncounterParticipant | undefined> {
    const monster = await getFromClipboard<FullMonster>("statblock");
    if (monster) {
        return mapMonsterToEncounterParticipant(monster);
    } else {
        new Notice(`Не удалось прочитать статблок из буфера обмена`);   
        return undefined;
    }
}

export async function getEncounterFromClipboard(): Promise<Encounter | undefined> {
    return getFromClipboard<Encounter>("encounter");
}

async function getFromClipboard<T>(blockName: string): Promise<T | undefined> {
    try {
        const clipboard = await navigator.clipboard.readText();
        if (!clipboard.startsWith(`\`\`\`${blockName}`)) {
            throw new Error(`Clipboard content does not start with \`\`\`${blockName}`);   
        }
        const yaml = clipboard
            .split('\n')
            .filter((value) => !value.contains("\`\`\`"))
            .join('\n');
        const obj = parseYaml(yaml) as T;   
        return obj;
    } catch(e) {
        console.error(`Failed to read text from clipboard: ${e}`);
        new Notice(`Не удалось прочитать данные из буфера обмена`);   
        return undefined;
    }
}
