import type { Workspace } from "obsidian";
import type { DmScreen } from "src/data/dm_screen";
import type { Spellbook } from "src/data/spellbook";
import { openSidePanelDmScreen } from "src/ui/components/ribbon/side_panel_dm_screen";
import { openSidePanelSpellbook } from "src/ui/components/ribbon/side_panel_spellbook";

export interface HtmlLinkListener {
    onSpellClick: (url: string) => void;
    onScreenItemClick: (url: string) => void;
}

export function HtmlLinkListener(
    workspace: Workspace,
    spellbook: Spellbook,
    dmScreen: DmScreen, 
): HtmlLinkListener {
    return {
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
