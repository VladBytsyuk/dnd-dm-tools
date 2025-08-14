import { App, ButtonComponent, Modal } from "obsidian";
import { createFilters } from "src/domain/models/common/Filters";
import type { ArsenalFilters } from "src/domain/models/weapon/ArsenalFilters";

export class ArsenalFiltersModal extends Modal {

    #fullFilters: ArsenalFilters;
    #initialFilters: ArsenalFilters | undefined;
    #types: string[] = [];
    #dices: string[] = [];
    #damageTypes: string[] = [];
    #sources: string[] = [];
    #onSubmit: (filters: ArsenalFilters) => void;
    #submit: ButtonComponent | undefined;

    constructor(
        app: App,
        fullFilters: ArsenalFilters,
        initialFilters: ArsenalFilters,
        onSubmit: (filters: ArsenalFilters) => void,
    ) {
        console.log("ArsenalFiltersModal constructor");
        super(app);
        this.#fullFilters = fullFilters;
        this.#initialFilters = {
            dices: [...initialFilters.dices],
            damageTypes: [...initialFilters.damageTypes],
            types: [...initialFilters.types],
            sources: [...initialFilters.sources],
        };
        this.#dices = initialFilters.dices;
        this.#damageTypes = initialFilters.damageTypes;
        this.#types = initialFilters.types;
        this.#sources = initialFilters.sources;
        this.#onSubmit = onSubmit;

        this.#render();
    }

    #render() {
        this.#addDices();
        this.#addDamageTypes();
        this.#addTypes();
        this.#addSources();
        this.#addSubmitButton();
    }

    #addDices() {   
        this.#addBlock(
            "Кости",
            this.#fullFilters.dices,
            (value) => this.#dices.includes(value),
            (value) => this.#dices.push(value),
            (value) => this.#dices.splice(this.#dices.indexOf(value), 1),
        )
    }

    #addDamageTypes() {   
        this.#addBlock(
            "Виды урона",
            this.#fullFilters.damageTypes,
            (value) => this.#damageTypes.includes(value),
            (value) => this.#damageTypes.push(value),
            (value) => this.#damageTypes.splice(this.#damageTypes.indexOf(value), 1),
        )
    }

    #addTypes() {   
        this.#addBlock(
            "Типы",
            this.#fullFilters.types,
            (value) => this.#types.includes(value),
            (value) => this.#types.push(value),
            (value) => this.#types.splice(this.#types.indexOf(value), 1),
        )
    }

    #addSources() {
        this.#addBlock(
            "Источники",
            this.#fullFilters.sources,
            (value) => this.#sources.includes(value),
            (value) => this.#sources.push(value),
            (value) => this.#sources.splice(this.#sources.indexOf(value), 1),
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
                this.#onSubmit(
                    createFilters<ArsenalFilters>({
                        dices: this.#dices,
                        damageTypes: this.#damageTypes,
                        types: this.#types,
                        sources: this.#sources,
                    })
                );
            });
        this.#updateSubmitButtonCta(); 
    }

    #updateSubmitButtonCta() {
        if (
            JSON.stringify(this.#initialFilters?.dices) != JSON.stringify(this.#dices) ||
            JSON.stringify(this.#initialFilters?.damageTypes) != JSON.stringify(this.#damageTypes) ||
            JSON.stringify(this.#initialFilters?.types) != JSON.stringify(this.#types) || 
            JSON.stringify(this.#initialFilters?.sources) != JSON.stringify(this.#sources)
        ) {
            this.#submit?.setCta();
        } else {
            this.#submit?.removeCta();
        }
    }
}   