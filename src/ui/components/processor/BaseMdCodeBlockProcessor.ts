import { parseYaml } from "obsidian";
import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
import type { Filters } from "src/domain/models/common/Filters";
import type { BaseItem } from "src/domain/models/common/BaseItem";
import type { Repository } from "src/domain/repositories/Repository";
import type DndStatblockPlugin from "src/main";
import { mount, type Component } from "svelte";
import RedesignedMarkdownCard from "src/ui/design-system/RedesignedMarkdownCard.svelte";
import type { PanelKey } from "src/domain/models/assistant/AssistantWorkspace";

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

    protected getRedesignedUi(): { component: Component<any, any, any>; props?: Record<string, unknown> } | undefined {
        return undefined;
    }

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
            (source, el) => this.mdCodeBlockProcessor(source, el, repository, uiEventListener, plugin),
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
        plugin: DndStatblockPlugin,
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

            const panelKey = panelKeyForCodeBlock(this.getCodeBlockName());
            const redesigned = plugin.getSettings().redesignEnabled && Boolean(panelKey);
            const customRedesignedUi = redesigned ? this.getRedesignedUi() : undefined;
            const component = customRedesignedUi?.component ?? (redesigned ? RedesignedMarkdownCard : this.getUi());
            mount(component, {
                target: el,
                props: {
                    currentItem: item,
                    uiEventListener: uiEventListener,
                    ...(customRedesignedUi?.props ?? (redesigned ? { panelKey } : {})),
                },
            });
        } catch (error) {
            console.error('Error processing markdown code block:', error);
        }
    }
}

function panelKeyForCodeBlock(name: string): PanelKey | undefined {
	const keys: Record<string, PanelKey> = {
		statblock: "bestiary", screen: "dm-screen", spell: "spellbook", weapon: "arsenal", armor: "armory",
        equip: "equipment", artifact: "artifactory", background: "backgrounds", feat: "feats",
        race: "races", "dnd-class": "classes",
    };
    return keys[name];
}
