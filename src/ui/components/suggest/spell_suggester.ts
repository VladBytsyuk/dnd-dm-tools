import { App, SearchComponent, TextComponent, AbstractInputSuggest, prepareSimpleSearch, type FuzzyMatch, renderMatches } from "obsidian";
import type { Spellbook } from "src/domain/repositories/Spellbook";
import type { FullSpell } from "src/domain/models/spell/FullSpell";
import type { SmallSpell } from "src/domain/models/spell/SmallSpell";

export class SpellSuggester extends AbstractInputSuggest<FuzzyMatch<SmallSpell>> {

    // ---- fileds ----
    #inputEl: TextComponent | SearchComponent;
    #spellbook: Spellbook;

    constructor(
        app: App,
        input: TextComponent | SearchComponent,
        spellbook: Spellbook,
    ) {
        super(app, input.inputEl);
        this.#inputEl = input;
        this.#spellbook = spellbook;
    }

    // ---- callbacks ----
    async getSuggestions(query: string) {
        if (query.length < 3) return [];
        const smallSpells = await this.#spellbook.getAllSmallItems();
        const simpleSearchFn = prepareSimpleSearch(query);
        const results = [];
        for (const item of smallSpells) {
            const rusMatch = simpleSearchFn(item.name.rus);
            const engMatch = simpleSearchFn(item.name.eng);
            if (rusMatch) {
                results.push({ item, match: rusMatch });
            }
            if (engMatch) {
                results.push({ item, match: engMatch });
            }
        }
        return results;
    }

    renderSuggestion(result: FuzzyMatch<SmallSpell>, el: HTMLElement): void {
        el.addClass("mod-complex");
        let content = el.createDiv({
            cls: "suggestion-content"
        });
        if (!result?.item) {
            content.setText("No match found");
            content.parentElement?.addClass("is-selected");
            return;
        }

        this.#renderTitle(content.createDiv("suggestion-title"), result);
        this.#renderNote?.(content.createDiv("suggestion-note"), result);
    }

    onSelectSpell(callback: (fullSpell: FullSpell) => void): this {
        this.onSelect(async (result) => {
            if (result == null) return;

            const smallSpell = result.item;
            const fullSpell = await this.#spellbook.getFullItemBySmallItem(smallSpell);
            if (fullSpell != null) {
                this.#inputEl.setValue("");
                callback(fullSpell);
            }
        });
        return this;
    }

    // ---- private functions ----
    #renderNote(noteEL: HTMLElement, result: FuzzyMatch<SmallSpell>): void {
        const { item, match } = result;
        renderMatches(noteEL, item.source?.shortName ?? "", match.matches);
    }
    #renderTitle(titleEl: HTMLElement, result: FuzzyMatch<SmallSpell>): void {
        const { item, match } = result;
        renderMatches(titleEl, item.name.rus, match.matches);
    }
}
