import type { SmallMonster } from "src/domain/models/monster/SmallMonster";
import { BaseFeature, type FeatureCommand } from "./BaseFeature";
import type { FullMonster } from "src/domain/models/monster/FullMonster";
import type { BestiaryFilters } from "src/domain/models/monster/BestiaryFilters";
import type DB from "src/data/database/DB";
import type { Repository } from "src/domain/repositories/Repository";
import { BestiaryRepository } from "src/data/repositories/BestiaryRepository";
import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
import type DndStatblockPlugin from "src/main";
import type { BaseSidePanel } from "../sidepanel/BaseSidePanel";
import { BestiarySidePanel } from "../sidepanel/BestiarySidePanel";
import type { BaseMdCodeBlockProcessor } from "../processor/BaseMdCodeBlockProcessor";
import { BestiaryMdCodeBlockProcessor } from "../processor/BestiaryMdCodeBlockProcessor";
import { CreatureChooser } from "../modals/creature_chooser";
import { stringifyYaml, type Editor } from "obsidian";

export class BestiaryFeature extends BaseFeature<SmallMonster, FullMonster, BestiaryFilters> {

    createRepository(database: DB): Repository<SmallMonster, FullMonster, BestiaryFilters> {
        return new BestiaryRepository(database);
    }

    createSidePanel(plugin: DndStatblockPlugin, repository: Repository<SmallMonster, FullMonster, BestiaryFilters>, uiEventListener: IUiEventListener): BaseSidePanel<SmallMonster, FullMonster, BestiaryFilters> {
        return new BestiarySidePanel(plugin, repository, uiEventListener);
    }

    createCodeBlockProcessor(): BaseMdCodeBlockProcessor<SmallMonster, FullMonster, BestiaryFilters> {
        return new BestiaryMdCodeBlockProcessor();
    }

    getCommands(): FeatureCommand[] {
        return [
            {
                id: 'add-statblock-command-id',
                name: "Добавить статблок",
                editorCallback: (editor: Editor) => {
                    new CreatureChooser(this.plugin.app, this.repository!, (monster, isTwoColumns) => {
                        const yamlMonster = stringifyYaml(monster);
                        const content = `\`\`\`statblock\ncreature: ${monster.name.rus}\ntwoColumns: ${isTwoColumns}\n${yamlMonster}\n\`\`\``
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
