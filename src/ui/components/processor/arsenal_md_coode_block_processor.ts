import { parseYaml } from "obsidian";
import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
import type { FullWeapon } from "src/domain/models/weapon/FullWeapon";
import type { Arsenal } from "src/domain/repositories/Arsenal";
import type DndStatblockPlugin from "src/main";
import WeaponFullUi from "src/ui/layout/weapon/WeaponFullUi.svelte";
import { mount } from "svelte";

export function regissterArsenalMdCodeBlockProcessor(
    plugin: DndStatblockPlugin,
    arsenal: Arsenal,
        uiEventListener: IUiEventListener,
) {
    plugin.registerMarkdownCodeBlockProcessor(
        'weapon', 
        (source, el) => arsenalMdCodeBlockProcessor(source, el, arsenal, uiEventListener),
    );
}

async function arsenalMdCodeBlockProcessor(
    source: string,
    el: HTMLElement,
    arsenal: Arsenal,
    uiEventListener: IUiEventListener,
) {
    const parameters = parseYaml(source);
    if (!parameters.name.rus) return;

    let weapon: FullWeapon;
    if (!parameters.name.eng) {
        const fullWeapon = await arsenal.getFullItemByUrl(parameters.name.rus);
        if (fullWeapon == null) return;

        weapon = fullWeapon;
    } else {
        weapon = parameters as FullWeapon;
    }

    mount(WeaponFullUi, {
        target: el,
        props: {
            currentItem: weapon,
            uiEventListener: uiEventListener,
        },
    });
}
