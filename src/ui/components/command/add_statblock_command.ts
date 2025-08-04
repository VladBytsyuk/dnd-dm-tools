import { Editor, stringifyYaml } from "obsidian";
import DndStatblockPlugin from "src/main";
import { CreatureChooser } from "../modals/creature_chooser";
import type { IBestiary } from "src/data/bestiary";

const ADD_STATBLOCK_COMMAND_ID = 'add-statblock-command-id';

export function registerAddStatblockCommand(plugin: DndStatblockPlugin, bestiary: IBestiary) {
    plugin.addCommand({
        id: ADD_STATBLOCK_COMMAND_ID,
        name: "Добавить статблок",
        editorCallback: (editor: Editor) => {
            new CreatureChooser(plugin.app, bestiary, (monster, isTwoColumns) => {
                const yamlMonster = stringifyYaml(monster);
                const content = `\`\`\`statblock\ncreature: ${monster.name.rus}\ntwoColumns: ${isTwoColumns}\n${yamlMonster}\n\`\`\``
                const cursor = editor.getCursor();
                const linesAdded = content.split('\n').length
                editor.replaceRange(content, cursor);
                editor.setCursor({ line: cursor.line + linesAdded + 2, ch: 0 });
            }).open();
        },
    });
}
