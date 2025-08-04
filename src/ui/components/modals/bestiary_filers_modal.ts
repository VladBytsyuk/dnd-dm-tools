import { App, ButtonComponent, Modal } from "obsidian";
import { BestiaryFilter } from "src/domain/bestiary_filters";

export class BestiaryFiltersModal extends Modal {

    #fullFilters: BestiaryFilter;
    #initialFilters: BestiaryFilter | undefined;
    #types: string[] = [];
    #challengeRatings: string[] = [];
    #sources: string[] = [];
    #onSubmit: (filters: BestiaryFilter) => void;
    #submit: ButtonComponent | undefined;

    constructor(
        app: App,
        fullFilters: BestiaryFilter,
        initialFilters: BestiaryFilter,
        onSubmit: (filters: BestiaryFilter) => void,
    ) {
        super(app);
        this.#fullFilters = fullFilters;
        this.#initialFilters = {
            types: [...initialFilters.types],
            challangeRatings: [...initialFilters.challangeRatings],
            sources: [...initialFilters.sources],
        };
        this.#types = initialFilters.types;
        this.#challengeRatings = initialFilters.challangeRatings;
        this.#sources = initialFilters.sources;
        this.#onSubmit = onSubmit;

        this.#render();
    }

    #render() {
        this.#addTypes();
        this.#addChallengeRatings();
        this.#addSources();
        this.#addSubmitButton();
    }

    #addTypes() {   
        this.#addBlock(
            "Типы",
            this.#fullFilters.types,
            (value) => this.#types.contains(value),
            (value) => this.#types.push(value),
            (value) => this.#types.remove(value),
        )
    }

    #addChallengeRatings() { 
        this.#addBlock(
            "Опасность",    
            this.#fullFilters.challangeRatings,
            (value) => this.#challengeRatings.contains(value),
            (value) => this.#challengeRatings.push(value),
            (value) => this.#challengeRatings.remove(value),
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
                this.#onSubmit(BestiaryFilter(this.#types, this.#challengeRatings, this.#sources));
            });
        this.#updateSubmitButtonCta(); 
    }

    #updateSubmitButtonCta() {
        if (
            JSON.stringify(this.#initialFilters?.types) != JSON.stringify(this.#types) || 
            JSON.stringify(this.#initialFilters?.challangeRatings) != JSON.stringify(this.#challengeRatings) ||
            JSON.stringify(this.#initialFilters?.sources) != JSON.stringify(this.#sources)
        ) {
            this.#submit?.setCta();
        } else {
            this.#submit?.removeCta();
        }
    }
}
