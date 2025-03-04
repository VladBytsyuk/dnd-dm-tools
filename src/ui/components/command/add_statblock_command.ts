import { Editor, stringifyYaml } from "obsidian";
import DndStatblockPlugin from "src/main";
import { TEXTS } from "src/res/texts_ru";
import { CreatureChooser } from "../modals/creature_chooser";
import type { Bestiary } from "src/data/bestiary";

const ADD_STATBLOCK_COMMAND_ID = 'add-statblock-command-id';

export function registerAddStatblockCommand(plugin: DndStatblockPlugin, bestiary: Bestiary) {
    plugin.addCommand({
        id: ADD_STATBLOCK_COMMAND_ID,
        name: TEXTS.commandAddStatblock,
        editorCallback: (editor: Editor) => {
            new CreatureChooser(plugin.app, bestiary, (monster, isTwoColumns) => {
                const creature = `creature: ${monster.name.rus}`;
                const twoColumns = `twoColumns: ${isTwoColumns}`;
                const yamlMonster = stringifyYaml(monster);
                const content = `\`\`\`statblock\n${creature}\n${twoColumns}\n${yamlMonster}\n\`\`\``
                const cursor = editor.getCursor();
                editor.replaceRange(content, cursor);
                editor.setCursor({ line: cursor.line + 1, ch: content.length });
            }).open();
        },
    });
}
