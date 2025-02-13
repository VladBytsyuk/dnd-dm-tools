import { Editor } from "obsidian";
import DndStatblockPlugin from "src/main";
import { TEXTS } from "src/res/texts_ru";

const ADD_STATBLOCK_COMMAND_ID = 'add-statblock-command-id';
const ADD_WIDE_STATBLOCK_COMMAND_ID = 'add-wide-statblock-command-id';

export function registerAddStatblockCommand(plugin: DndStatblockPlugin) {
    plugin.addCommand({
        id: ADD_STATBLOCK_COMMAND_ID,
        name: TEXTS.commandAddStatblock,
        editorCallback: (editor: Editor) => {
            const content = "creature: ";
            const block = `\`\`\`statblock\n${content}\n\`\`\``;
            const cursor = editor.getCursor();
            editor.replaceRange(block, cursor);
            editor.setCursor({ line: cursor.line + 1, ch: content.length });
        },
    });
}

export function registerAddWideStatblockCommand(plugin: DndStatblockPlugin) {
    plugin.addCommand({
        id: ADD_WIDE_STATBLOCK_COMMAND_ID,
        name: TEXTS.commandAddWideStatblock,
        editorCallback: (editor: Editor) => {
            const creature = "creature: ";
            const twoColumns = "twoColumns: true";
            const block = `\`\`\`statblock\n${creature}\n${twoColumns}\n\`\`\``;
            const cursor = editor.getCursor();
            editor.replaceRange(block, cursor);
            editor.setCursor({ line: cursor.line + 1, ch: creature.length });
        },
    });
}
