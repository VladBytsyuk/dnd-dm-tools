import { App, Modal, Setting, SearchComponent } from "obsidian";
import type { IBestiary } from "src/data/bestiary";
import type { FullMonster } from "src/domain/monster";
import { TEXTS } from "src/res/texts_ru";
import { MonsterSuggester } from "src/ui/components/suggest/monster_suggester";

export class CreatureChooser extends Modal {
    
    constructor(
        app: App,
        bestiary: IBestiary,
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
        bestiary: IBestiary,
        onSelect: (fullMonster: FullMonster) => void,
    ) {
        const searchEl = new SearchComponent(this.contentEl)
            .setPlaceholder(TEXTS.bestiarySearchPlaceholder);
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
            .setName(TEXTS.addStatblockModalTwoColumns)
            .addToggle((toggle) => onSelect(toggle.getValue()));
    }

    addSubmitButton(onClick: () => void) {
        new Setting(this.contentEl)
            .addButton((btn) =>
                btn.setButtonText(TEXTS.addStatblockModalSubmit)
                    .setCta()
                    .onClick(() => {
                        this.close();
                        onClick();
                    })
            );  
    }
}
