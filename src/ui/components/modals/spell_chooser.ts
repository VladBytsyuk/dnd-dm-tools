import { App, Modal, Setting, SearchComponent } from "obsidian";
import type { Spellbook } from "src/domain/repositories/Spellbook";
import type { FullSpell } from "src/domain/models/spell/FullSpell";
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
            .setPlaceholder("Поиск по книге заклинаний");
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
                btn.setButtonText("Добавить")
                    .setCta()
                    .onClick(() => {
                        this.close();
                        onClick();
                    })
            );  
    }
}
