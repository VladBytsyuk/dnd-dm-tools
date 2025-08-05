import { Editor, stringifyYaml } from "obsidian";
import DndStatblockPlugin from "src/main";
import type { Encounter } from "src/domain/models/encounter/Encounter";

const ADD_ENCOUNTER_COMMAND_ID = 'add-encounter-command-id';

export function registerAddEncounterCommand(plugin: DndStatblockPlugin) {
    plugin.addCommand({
        id: ADD_ENCOUNTER_COMMAND_ID,
        name: "Добавить боевое столкновение",
        editorCallback: (editor: Editor) => {
            const encounter = {
                name: "-",
                participants: [],
            } as Encounter
            const yamlEncounter = stringifyYaml(encounter);
            const content = `\`\`\`encounter\n${yamlEncounter}\`\`\``
            const cursor = editor.getCursor();
            const linesAdded = content.split('\n').length
            editor.replaceRange(content, cursor);
            editor.setCursor({ line: cursor.line + linesAdded + 2, ch: 0 });
        },
    });
}
