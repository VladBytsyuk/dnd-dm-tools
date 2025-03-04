import { App, Modal, Setting, SearchComponent } from "obsidian";
import type { Bestiary } from "src/data/bestiary";
import type { FullMonster } from "src/domain/monster";
import { TEXTS } from "src/res/texts_ru";
import { MonsterSuggester } from "src/ui/components/suggest/monster_suggester";

export class CreatureChooser extends Modal {
    
    constructor(
        app: App,
        bestiary: Bestiary,
        onSubmit: (fullMonster: FullMonster, isTwoColumns: boolean) => void,
    ) {
        super(app);
        this.setTitle('Выбери существо');

        let creature: FullMonster | null = null;
        let isTwoColumns = false;

        const searchEl = new SearchComponent(this.contentEl)
            .setPlaceholder(TEXTS.sidePanelBestiarySearchPlaceholder);
        searchEl.clearButtonEl.addEventListener('click', () => {
            searchEl.setValue("");
            suggester.close();
        });

        const suggester = new MonsterSuggester(app, searchEl, bestiary);
        suggester.onSelectMonster(fullMonster => {
            creature = fullMonster;
            searchEl.setValue(fullMonster.name.rus);
            suggester.close();
        });

        new Setting(this.contentEl)
            .setName('2 столбца')
            .addToggle((toggle) => isTwoColumns = toggle.getValue());

        new Setting(this.contentEl)
            .addButton((btn) =>
                btn.setButtonText('Подтвердить')
                    .setCta()
                    .onClick(() => {
                        this.close();
                        creature && onSubmit(creature, isTwoColumns);
                    })
            );
    }
}