import { parseYaml } from "obsidian";
import type { IDmScreen } from "src/data/dm_screen";
import type { DmScreenItem } from "src/domain/dm_screen_group";
import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
import type DndStatblockPlugin from "src/main";
import DmScreenItemUi from "src/ui/layout/screen/DmScreenItemUi.svelte";
import { mount } from "svelte";

export function registerScreenMdCodeBlockProcessor(
    plugin: DndStatblockPlugin,
    dmScreen: IDmScreen,
    uiEventListener: IUiEventListener,
) {
    plugin.registerMarkdownCodeBlockProcessor(
        'screen',
        (source, el, context) => screenMdCodeBlockProcessor(source, el, dmScreen, uiEventListener),
    )
}

async function screenMdCodeBlockProcessor(
    source: string,
    el: HTMLElement,
    dmScreen: IDmScreen,
    uiEventListener: IUiEventListener,
) {
    const parameters = parseYaml(source);
    if (!parameters.name.rus) return;

    let screen: DmScreenItem
    if (!parameters.name.eng) {
        const fullScreen = await dmScreen.getFullItemByName(parameters.name.rus);
        if (fullScreen == null) return;

        screen = fullScreen;
    } else {
        screen = parameters as DmScreenItem;
    }

    mount(DmScreenItemUi, {
        target: el,
        props: {
            item: screen,
            uiEventListener: uiEventListener,
        }
    });
}