import { ButtonComponent, Modal, type App } from "obsidian";
import type { Filters } from "src/domain/models/common/Filters";

export abstract class BaseFiltersModal<F extends Filters> extends Modal {

    currentFilters: F;
    #submitButton: ButtonComponent | undefined;

    constructor(
        app: App,
        private fullFilters: F,
        private initialFilters: F,
        private onSubmit: (filters: F) => void,
    ) {
        super(app);
        this.currentFilters = { ...initialFilters };
        this.render();
    }

    abstract addBlocks(): void;

    private render() {
        this.addBlocks();
        this.addSubmitButton();
    }

    addFilterBlock<
        T extends string | number = string | number
    >(
        title: string,
        filterKey: keyof F,
    ) {
        const initialList: T[] = Array.isArray(this.fullFilters[filterKey])
            ? this.fullFilters[filterKey].map((v: any) => v as T)
            : [];
        this.addBlock<T>(
            title,
            initialList,
            (value: T) => {
                return (this.currentFilters[filterKey] as T[]).includes(value);
            },
            (value: T) => {
                const updated = [
                    ...(this.currentFilters[filterKey] as T[]),
                    value
                ];
                this.currentFilters = {
                    ...this.currentFilters,
                    [filterKey]: updated
                };
            },
            (value: T) => {
                const filtered = (this.currentFilters[filterKey] as T[]).filter(v => v !== value);
                this.currentFilters = {
                    ...this.currentFilters,
                    [filterKey]: filtered
                };
            },
        );
    }

    private addBlock<T extends string | number>(
        title: string,
        initialList: T[],
        isInList: (value: T) => boolean,
        onSelect: (item: T) => void,
        onDeselect: (item: T) => void,
    ) {
        const header = this.contentEl.createEl("h2");
        header.textContent = title;
        for (const source of initialList) {
            const button = new ButtonComponent(this.contentEl)
                .setButtonText(String(source))
                .setClass("filter-item")
                .onClick(() => {
                    if (isInList(source)) {
                        onDeselect(source);
                        button.removeCta();
                    } else {
                        onSelect(source);
                        button.setCta();
                    }
                    this.updateSubmitButtonCta(); 
                });
            if (isInList(source)) button.setCta();
        }
    }

    private addSubmitButton() {    
        this.#submitButton = new ButtonComponent(this.contentEl)
            .setButtonText("Применить")
            .setClass("submit-button")
            .onClick(() => {
                this.close();
                this.onSubmit(this.currentFilters);
            });
        this.updateSubmitButtonCta(); 
    }

    private updateSubmitButtonCta() {
        if (!this.areFiltersEqual(this.initialFilters, this.currentFilters)) {
            this.#submitButton?.setCta();
        } else {
            this.#submitButton?.removeCta();
        }
    }

    private areFiltersEqual(a: Filters, b: Filters): boolean {
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        if (aKeys.length !== bKeys.length) return false;

        for (const key of aKeys) {
            const aVal = a[key];
            const bVal = b[key];
            if (!Array.isArray(aVal) || !Array.isArray(bVal)) return false;
            if (aVal.length !== bVal.length) return false;

            const aSorted = [...aVal].sort();
            const bSorted = [...bVal].sort();
            for (let i = 0; i < aSorted.length; i++) {
                if (aSorted[i] !== bSorted[i]) return false;
            }
        }
        return true;
    }
}
