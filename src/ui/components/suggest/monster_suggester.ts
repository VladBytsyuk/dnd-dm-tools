import { App, SearchComponent, TextComponent, AbstractInputSuggest, prepareSimpleSearch, type FuzzyMatch, renderMatches } from "obsidian";
import type { FullMonster } from "src/domain/models/monster/FullMonster";
import type { SmallMonster } from "src/domain/models/monster/SmallMonster";
import type { Bestiary } from "src/domain/repositories/Bestiary";

export class MonsterSuggester extends AbstractInputSuggest<FuzzyMatch<SmallMonster>> {

    // ---- fileds ----
    #inputEl: TextComponent | SearchComponent;
    #bestiary: Bestiary;

    constructor(
        app: App,
        input: TextComponent | SearchComponent,
        bestiary: Bestiary,
    ) {
        super(app, input.inputEl);
        this.#inputEl = input;
        this.#bestiary = bestiary;
    }

    // ---- callbacks ----
    async getSuggestions(query: string) {
        if (query.length < 3) return [];
        const smallMonsters = await this.#bestiary.getAllSmallItems();
        const simpleSearchFn = prepareSimpleSearch(query);
        const results = [];
        for (const item of smallMonsters) {
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

    renderSuggestion(result: FuzzyMatch<SmallMonster>, el: HTMLElement): void {
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

    onSelectMonster(callback: (fullMonster: FullMonster) => void): this {
        this.onSelect(async (result) => {
            if (result == null) return;

            const smallMonster = result.item;
            const fullMonster = await this.#bestiary.getFullItemBySmallItem(smallMonster);
            if (fullMonster != null) {
                this.#inputEl.setValue("");
                callback(fullMonster);
            }
        });
        return this;
    }

    // ---- private functions ----
    #renderNote(noteEL: HTMLElement, result: FuzzyMatch<SmallMonster>): void {
        const { item, match } = result;
        renderMatches(noteEL, item.source.shortName, match.matches);
    }
    #renderTitle(titleEl: HTMLElement, result: FuzzyMatch<SmallMonster>): void {
        const { item, match } = result;
        renderMatches(titleEl, item.name.rus, match.matches);
    }
}
