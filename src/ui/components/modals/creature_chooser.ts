import { App, Modal, Setting, SearchComponent } from "obsidian";
import type { BestiaryFilters } from "src/domain/models/monster/BestiaryFilters";
import type { FullMonster } from "src/domain/models/monster/FullMonster";
import type { SmallMonster } from "src/domain/models/monster/SmallMonster";
import type { Repository } from "src/domain/repositories/Repository";
import { MonsterSuggester } from "src/ui/components/suggest/monster_suggester";

export class CreatureChooser extends Modal {
    
    constructor(
        app: App,
        bestiary: Repository<SmallMonster, FullMonster, BestiaryFilters>,
        onSubmit: (monster: FullMonster, isTwoColumns: boolean) => void,
    ) {
        super(app);

        let monster: FullMonster | null = null;
        let isTwoColumns = false;

        this.addSearchElement(app, bestiary, (fullMonster) => monster = fullMonster);
        this.addTwoColumnsElement((value) => isTwoColumns = value);
        this.addSubmitButton(() => monster && onSubmit(monster, isTwoColumns));
    }

    addSearchElement(
        app: App,
        bestiary: Repository<SmallMonster, FullMonster, BestiaryFilters>,
        onSelect: (fullMonster: FullMonster) => void,
    ) {
        const searchEl = new SearchComponent(this.contentEl)
            .setPlaceholder("Поиск по имени в бестиарии");
        searchEl.clearButtonEl.addEventListener('click', () => {
            searchEl.setValue("");
            suggester.close();
        });

        const suggester = new MonsterSuggester(app, searchEl, bestiary);
        suggester.onSelectMonster(fullMonster => {
            onSelect(fullMonster);
            searchEl.setValue(fullMonster.name.rus);
            suggester.close();
        });
    }

    addTwoColumnsElement(onSelect: (value: boolean) => void) {
        new Setting(this.contentEl)
            .setName("2 столбца")
            .addToggle((toggle) => onSelect(toggle.getValue()));
    }

    addSubmitButton(onClick: () => void) {
        new Setting(this.contentEl)
            .addButton((btn) =>
                btn.setButtonText("Добавить")
                    .setCta()
                    .onClick(() => {
                        this.close();
                        onClick();
                    })
            );  
    }
}
