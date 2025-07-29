import { parseYaml } from "obsidian";
import DndStatblockPlugin from "src/main";
import { type FullSpell } from "src/domain/spell";
import { SpellLayoutManager } from "../settings/spell_layout_manager";
import type { ISpellbook } from "src/data/spellbook";

export function registerSpellMdCodeBlockProcessor(
    plugin: DndStatblockPlugin,
    spellbook: ISpellbook,
    layoutManager: SpellLayoutManager,
) {
    plugin.registerMarkdownCodeBlockProcessor(
        'spell', 
        (source, el, context) => spellMdCodeBlockProcessor(source, el, spellbook, layoutManager),
    );
}

async function spellMdCodeBlockProcessor(
    source: string,
    el: HTMLElement,
    spellbook: ISpellbook,
    layoutManager: SpellLayoutManager,
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

    layoutManager.renderLayout(el, spell);
}
