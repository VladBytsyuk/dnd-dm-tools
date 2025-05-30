import { App, ButtonComponent, Modal, TextComponent } from "obsidian";
import { SpellbookFilters } from "src/domain/spellbook_filters";

export class SpellbookFiltersModal extends Modal {

    #fullFilters: SpellbookFilters;
    #initialFilters: SpellbookFilters | undefined;
    #levels: string[] = [];
    #schools: string[] = [];
    #sources: string[] = [];
    #onSubmit: (filters: SpellbookFilters) => void;
    #submit: ButtonComponent | undefined;

    constructor(
        app: App,
        fullFilters: SpellbookFilters,
        initialFilters: SpellbookFilters,
        onSubmit: (filters: SpellbookFilters) => void,
    ) {
        super(app);
        this.#fullFilters = fullFilters;
        this.#initialFilters = {
            levels: [...initialFilters.levels],
            schools: [...initialFilters.schools],
            sources: [...initialFilters.sources],
        };
        this.#levels = initialFilters.levels.map(level => level.toString());
        this.#schools = initialFilters.schools;
        this.#sources = initialFilters.sources;
        this.#onSubmit = onSubmit;

        this.#render();
    }

    #render() {
        this.#addLevels();
        this.#addSchools();
        this.#addSources();
        this.#addSubmitButton();
    }

    #addLevels() {   
        this.#addBlock(
            "Круги",
            this.#fullFilters.levels.map(level => level.toString()),
            (value) => this.#levels.contains(value),
            (value) => this.#levels.push(value),
            (value) => this.#levels.remove(value),
        )
    }

    #addSchools() { 
        this.#addBlock(
            "Школы",    
            this.#fullFilters.schools,
            (value) => this.#schools.contains(value),
            (value) => this.#schools.push(value),
            (value) => this.#schools.remove(value),
        ) 
    }

    #addSources() { 
        this.#addBlock(
            "Источник",
            this.#fullFilters.sources,
            (value) => this.#sources.contains(value),
            (value) => this.#sources.push(value),
            (value) => this.#sources.remove(value),
        )
    }

    #addBlock(
        title: string,
        initialList: string[],
        isInList: (value: string) => boolean,
        onSelect: (item: string) => void,
        onDeselect: (item: string) => void,
    ) {
        const header = this.contentEl.createEl("h2");
        header.textContent = title;
        for (const source of initialList) {
            const button = new ButtonComponent(this.contentEl)
                .setButtonText(source)
                .setClass("filter-item")
                .onClick(() => {
                    if (isInList(source)) {
                        onDeselect(source);
                        button.removeCta();
                    } else {
                        onSelect(source);
                        button.setCta();
                    }
                    this.#updateSubmitButtonCta(); 
                });
            if (isInList(source)) button.setCta();
        }
    }

    #addSubmitButton() {    
        this.#submit = new ButtonComponent(this.contentEl)
            .setButtonText("Применить")
            .setClass("submit-button")
            .onClick(() => {
                this.close();
                this.#onSubmit(SpellbookFilters(this.#levels.map(level => +level), this.#schools, this.#sources));
            });
        this.#updateSubmitButtonCta(); 
    }

    #updateSubmitButtonCta() {
        if (
            JSON.stringify(this.#initialFilters?.levels) != JSON.stringify(this.#levels) || 
            JSON.stringify(this.#initialFilters?.schools) != JSON.stringify(this.#schools) ||
            JSON.stringify(this.#initialFilters?.sources) != JSON.stringify(this.#sources)
        ) {
            this.#submit?.setCta();
        } else {
            this.#submit?.removeCta();
        }
    }
}
