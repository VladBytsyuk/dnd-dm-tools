import { Editor, stringifyYaml } from "obsidian";
import DndStatblockPlugin from "src/main";
import { TEXTS } from "src/res/texts_ru";
import { SpellChooser } from "../modals/spell_chooser";
import type { Spellbook } from "src/data/spellbook";

const ADD_SPELL_COMMAND_ID = 'add-spell-command-id';

export function registerAddSpellCommand(plugin: DndStatblockPlugin, spellbook: Spellbook) {
    plugin.addCommand({
        id: ADD_SPELL_COMMAND_ID,
        name: TEXTS.commandAddSpell,
        editorCallback: (editor: Editor) => {
            new SpellChooser(plugin.app, spellbook, (spell) => {
                const yamlSpell = stringifyYaml(spell);
                const content = `\`\`\`spell\n${yamlSpell}\n\`\`\``
                const cursor = editor.getCursor();
                const linesAdded = content.split('\n').length
                editor.replaceRange(content, cursor);
                editor.setCursor({ line: cursor.line + linesAdded + 2, ch: 0 });
            }).open();
        },
    });
}
