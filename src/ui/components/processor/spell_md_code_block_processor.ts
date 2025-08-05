import { parseYaml } from "obsidian";
import DndStatblockPlugin from "src/main";
import { type FullSpell } from "src/domain/models/spell/FullSpell";
import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
import SpellFullUi from "src/ui/layout/spell/SpellFullUi.svelte";
import { mount } from "svelte";
import type { Spellbook } from "src/domain/repositories/Spellbook";

export function registerSpellMdCodeBlockProcessor(
    plugin: DndStatblockPlugin,
    spellbook: Spellbook,
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
    spellbook: Spellbook,
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

    mount(SpellFullUi, {
        target: el,
        props: {
            spell: spell,
            uiEventListener: uiEventListener,
        },
    });
}
