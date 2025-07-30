import { parseYaml } from "obsidian";
import DndStatblockPlugin from "src/main";
import { type FullSpell } from "src/domain/spell";
import type { ISpellbook } from "src/data/spellbook";
import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
import FullSpellUi from "src/ui/layout/spell/FullSpellUi.svelte";
import { mount } from "svelte";

export function registerSpellMdCodeBlockProcessor(
    plugin: DndStatblockPlugin,
    spellbook: ISpellbook,
    uiEventListener: IUiEventListener,
) {
    plugin.registerMarkdownCodeBlockProcessor(
        'spell', 
        (source, el, context) => spellMdCodeBlockProcessor(source, el, spellbook, uiEventListener),
    );
}

async function spellMdCodeBlockProcessor(
    source: string,
    el: HTMLElement,
    spellbook: ISpellbook,
    uiEventListener: IUiEventListener,
) {
    const parameters = parseYaml(source);
    if (!parameters.name.rus) return;

    let spell: FullSpell
    if (!parameters.name.eng) {
        const fullSpell = await spellbook.getFullSpellByName(parameters.name.rus);
        if (fullSpell == null) return;

        spell = fullSpell;
    } else {
        spell = parameters as FullSpell
    }

    mount(FullSpellUi, {
        target: el,
        props: {
            spell: spell,
            uiEventListener: uiEventListener,
        },
    });
}
