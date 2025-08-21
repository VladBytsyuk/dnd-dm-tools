import { get } from "http";
import { parseYaml } from "obsidian";
import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
import type { Filters } from "src/domain/models/common/Filters";
import type { BaseItem } from "src/domain/models/common/BaseItem";
import type { Repository } from "src/domain/repositories/Repository";
import type DndStatblockPlugin from "src/main";
import { mount, type Component } from "svelte";

export abstract class BaseMdCodeBlockProcessor<
    ST extends BaseItem,
    FT extends ST,
    F extends Filters,
>  {

    abstract getCodeBlockName(): string;
    abstract getUi(): Component<{ 
        currentItem: FT, 
        uiEventListener: IUiEventListener,
    }, any, any>

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

    async mdCodeBlockProcessor(
        source: string,
        el: HTMLElement,
        repository: Repository<ST, FT, F>,
        uiEventListener: IUiEventListener,
    ) {
        const parameters = parseYaml(source);
        if (!parameters.name.rus) return;

        let item: FT;
        if (!parameters.name.eng) {
            const fullItem = await repository.getFullItemByUrl(parameters.name.rus);
            if (fullItem == null) return;

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
    }
}
