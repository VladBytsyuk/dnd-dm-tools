import type { Workspace } from "obsidian";
import type { Bestiary } from "src/data/bestiary";
import type { DmScreen } from "src/data/dm_screen";
import type { Spellbook } from "src/data/spellbook";
import { openSidePanelBestiary } from "src/ui/components/ribbon/side_panel_bestiary";
import { openSidePanelDmScreen } from "src/ui/components/ribbon/side_panel_dm_screen";
import { openSidePanelSpellbook } from "src/ui/components/ribbon/side_panel_spellbook";

export interface HtmlLinkListener {
    onBeastClick: (url: string) => void;
    onSpellClick: (url: string) => void;
    onScreenItemClick: (url: string) => void;
}

export function HtmlLinkListener(
    workspace: Workspace,
    bestiary: Bestiary,
    spellbook: Spellbook,
    dmScreen: DmScreen, 
): HtmlLinkListener {
    return {
        onBeastClick: onBeastClick(bestiary, workspace),
        onSpellClick: onSpellUrlClick(spellbook, workspace),
        onScreenItemClick: onScreenItemlUrlClick(dmScreen, workspace),
    };
}

interface LinkListener {
    href: string;
    onClick: (url: string) => void;
}

function LinkListener(href: string, onClick: (url: string) => void): LinkListener {
    return { href, onClick };
}

export const registerHtmlLinkListener = (htmlLinkListener: HtmlLinkListener) => (node: HTMLElement) => {
    return addHtmlLinkLiteners(
        [
            LinkListener('/bestiary/', htmlLinkListener.onBeastClick),
            LinkListener('/spells/', htmlLinkListener.onSpellClick),
            LinkListener('/screens/', htmlLinkListener.onScreenItemClick),
        ]
    )(node);
}

const addHtmlLinkLiteners = (linkListeners: LinkListener[]) => (node: HTMLElement) => {
    const handleLinkClick = (e: MouseEvent) => {  
        const link = e.currentTarget as HTMLAnchorElement;
        const url = link.getAttribute('href')!;
        const listener = linkListeners.find(it => url.contains(it.href));
        if (listener) {
            e.preventDefault();
            listener.onClick(url);
        }
    }
    const hrefs = linkListeners.map(it => it.href); 
    const selector = hrefs.splice(1).reduce((acc, href) => `${acc}, a[href^="${href}"]`, `a[href^="${hrefs[0]}"]`);
    const links = node.querySelectorAll<HTMLAnchorElement>(selector);       
    links.forEach(link => {
        link.style.cursor = 'pointer';
        link.addEventListener('click', handleLinkClick);
    });
    return {    
        destroy() {
            links.forEach(link => link.removeEventListener('click', handleLinkClick));
        }
    };
}

const onBeastClick = (bestiary: Bestiary, workspace: Workspace) => async (url: string) => {
    const fullMonster = await bestiary.getFullMonsterByUrl(url);
    if (fullMonster) await openSidePanelBestiary(workspace, fullMonster);
}

const onSpellUrlClick = (spellbook: Spellbook, workspace: Workspace) => async (url: string) => {
    const fullSpell = await spellbook.getFullSpellByUrl(url);
    if (fullSpell) await openSidePanelSpellbook(workspace, fullSpell);
};

const onScreenItemlUrlClick = (dmScreeen: DmScreen, workspace: Workspace) => async (url: string) => {
    const screenItem = await dmScreeen.getScreenItemByUrl(url);
    if (screenItem) {
        await openSidePanelDmScreen(workspace, undefined, screenItem);
    } else {
        const screenGroup = await dmScreeen.getScreenGroupByUrl(url);
        if (screenGroup) {
            await openSidePanelDmScreen(workspace, screenGroup, undefined);
        }
    }
};
