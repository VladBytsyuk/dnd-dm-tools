import { App, Modal, Setting, SearchComponent } from "obsidian";
import type { Spellbook } from "src/data/spellbook";
import type { FullSpell } from "src/domain/spell";
import { TEXTS } from "src/res/texts_ru";
import { SpellSuggester } from "src/ui/components/suggest/spell_suggester";

export class SpellChooser extends Modal {
    
    constructor(
        app: App,
        spellbook: Spellbook,
        onSubmit: (spell: FullSpell) => void,
    ) {
        super(app);

        let spell: FullSpell | null = null;

        this.addSearchElement(app, spellbook, (fullMonster) => spell = fullMonster);
        this.addSubmitButton(() => spell && onSubmit(spell));
    }

    addSearchElement(
        app: App,
        spellbook: Spellbook,
        onSelect: (spell: FullSpell) => void,
    ) {
        const searchEl = new SearchComponent(this.contentEl)
            .setPlaceholder(TEXTS.spellbookSearchPlaceholder);
        searchEl.clearButtonEl.addEventListener('click', () => {
            searchEl.setValue("");
            suggester.close();
        });

        const suggester = new SpellSuggester(app, searchEl, spellbook);
        suggester.onSelectSpell(fullSpell => {
            onSelect(fullSpell);
            searchEl.setValue(fullSpell.name.rus);
            suggester.close();
        });
    }

    addSubmitButton(onClick: () => void) {
        new Setting(this.contentEl)
            .addButton((btn) =>
                btn.setButtonText(TEXTS.addSpellModalSubmit)
                    .setCta()
                    .onClick(() => {
                        this.close();
                        onClick();
                    })
            );  
    }
}
