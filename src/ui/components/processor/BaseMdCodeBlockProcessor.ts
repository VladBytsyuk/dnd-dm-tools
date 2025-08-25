import { parseYaml } from "obsidian";
import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
import type { Filters } from "src/domain/models/common/Filters";
import type { BaseItem } from "src/domain/models/common/BaseItem";
import type { Repository } from "src/domain/repositories/Repository";
import type DndStatblockPlugin from "src/main";
import { mount, type Component } from "svelte";

/**
 * Base class for processing markdown code blocks in Obsidian.
 * Handles YAML parsing and UI mounting for different item types.
 * 
 * @template ST - Small item type extending BaseItem
 * @template FT - Full item type extending small item type
 * @template F - Filter type extending Filters
 */
export abstract class BaseMdCodeBlockProcessor<
    ST extends BaseItem,
    FT extends ST,
    F extends Filters,
>  {

    /** Returns the name of the code block this processor handles */
    abstract getCodeBlockName(): string;
    
    /** Returns the Svelte component to render for this item type */
    abstract getUi(): Component<{ 
        currentItem: FT, 
        uiEventListener: IUiEventListener,
    }, any, any>

    /**
     * Registers this processor with the Obsidian plugin
     */
    register(
        plugin: DndStatblockPlugin,
        repository: Repository<ST, FT, F>,
        uiEventListener: IUiEventListener,
    ) {
        plugin.registerMarkdownCodeBlockProcessor(
            this.getCodeBlockName(), 
            (source, el) => this.mdCodeBlockProcessor(source, el, repository, uiEventListener),
        );
    }

    /**
     * Processes markdown code block content and mounts the appropriate UI component.
     * Handles both cases where full item data is provided or needs to be fetched by URL.
     */
    async mdCodeBlockProcessor(
        source: string,
        el: HTMLElement,
        repository: Repository<ST, FT, F>,
        uiEventListener: IUiEventListener,
    ) {
        try {
            const parameters = parseYaml(source);
            if (!parameters?.name?.rus) {
                console.warn('Code block missing required name.rus parameter');
                return;
            }

            let item: FT;
            if (!parameters.name.eng) {
                const fullItem = await repository.getFullItemByUrl(parameters.name.rus);
                if (fullItem == null) {
                    console.warn(`Failed to fetch item by URL: ${parameters.name.rus}`);
                    return;
                }

                item = fullItem;
            } else {
                item = parameters as FT;
            }

            mount(this.getUi(), {
                target: el,
                props: {
                    currentItem: item,
                    uiEventListener: uiEventListener,
                },
            });
        } catch (error) {
            console.error('Error processing markdown code block:', error);
        }
    }
}
