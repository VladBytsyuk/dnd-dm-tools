import { App, SearchComponent, TextComponent, AbstractInputSuggest, prepareSimpleSearch, FuzzyMatch, renderMatches } from "obsidian";
import { Bestiary } from "src/data/bestiary";
import type { FullMonster, SmallMonster } from "src/domain/monster";

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
        const smallMonsters = await this.#bestiary.getAllSmallMonsters();
        const simpleSearchFn = prepareSimpleSearch(query);
        const results = [];
        for (const item of smallMonsters) {
            const match = simpleSearchFn(item.name.rus);
            if (match) results.push({ item, match });
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
            const fullMonster = await this.#bestiary.getFullMonsterBySmallMonster(smallMonster);
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
