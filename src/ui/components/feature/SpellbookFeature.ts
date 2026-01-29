import type { SmallSpell } from "src/domain/models/spell/SmallSpell";
import { BaseFeature, type FeatureCommand } from "./BaseFeature";
import type { FullSpell } from "src/domain/models/spell/FullSpell";
import type { SpellbookFilters } from "src/domain/models/spell/SpellbookFilters";
import type DB from "src/data/database/DB";
import type { Repository } from "src/domain/repositories/Repository";
import { SpellbookRepository } from "src/data/repositories/SpellbookRepository";
import type DndStatblockPlugin from "src/main";
import { SpellBookSidePanel } from "../sidepanel/SpellbookSidePanel";
import type { BaseMdCodeBlockProcessor } from "../processor/BaseMdCodeBlockProcessor";
import { SpellbookMdCodeBlockProcessor } from "../processor/SpellbookMdCodeBlockProcessor";
import { stringifyYaml, type Editor } from "obsidian";
import { SpellChooser } from "../modals/spell_chooser";
import type { IUiEventListener } from "../../../domain/listeners/ui_event_listener";
import type { BaseSidePanel } from "../sidepanel/BaseSidePanel";

export class SpellbookFeature extends BaseFeature<SmallSpell, FullSpell, SpellbookFilters> {

    createRepository(database: DB): Repository<SmallSpell, FullSpell, SpellbookFilters> {
        return new SpellbookRepository(database);
    }

    createSidePanel(plugin: DndStatblockPlugin, repository: Repository<SmallSpell, FullSpell, SpellbookFilters>, uiEventListener: IUiEventListener): BaseSidePanel<SmallSpell, FullSpell, SpellbookFilters> {
        return new SpellBookSidePanel(plugin, repository, uiEventListener);
    }

    createCodeBlockProcessor(): BaseMdCodeBlockProcessor<SmallSpell, FullSpell, SpellbookFilters> {
        return new SpellbookMdCodeBlockProcessor();
    }

    getCommands(): FeatureCommand[] {
        return [
            {
                id: 'add-spell-command-id',
                name: "Добавить заклинание",
                editorCallback: (editor: Editor) => {
                    new SpellChooser(this.plugin.app, this.repository!, (spell) => {
                        const yamlSpell = stringifyYaml(spell);
                        const content = `\`\`\`spell\n${yamlSpell}\n\`\`\``
                        const cursor = editor.getCursor();
                        const linesAdded = content.split('\n').length
                        editor.replaceRange(content, cursor);
                        editor.setCursor({ line: cursor.line + linesAdded + 2, ch: 0 });
                    }).open();
                },
            }
        ];
    }
}
