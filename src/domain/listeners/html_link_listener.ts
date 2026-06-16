// ---- public ----
export interface HtmlLinkListener {
    onBeastClick: (url: string) => Promise<void>;
    onSpellClick: (url: string) => Promise<void>;
    onWeaponClick: (url: string) => Promise<void>;
    onArmorClick: (url: string) => Promise<void>;
    onItemClick: (url: string) => Promise<void>;
    onArtifactClick: (url: string) => Promise<void>;
    onBackgroundClick: (url: string) => Promise<void>;
    onFeatClick: (url: string) => Promise<void>;
    onRaceClick: (url: string) => Promise<void>;
    onClassClick: (url: string) => Promise<void>;
    onCharacterSheetClick: (url: string) => Promise<void>;
    onScreenItemClick: (url: string) => Promise<void>;
}

export const registerHtmlLinkListener = (htmlLinkListener: HtmlLinkListener) => (node: HTMLElement) => {
    return addHtmlLinkListeners(getDndEntityLinkListeners(htmlLinkListener))(node);
}

export function resolveDndEntityLink(htmlLinkListener: HtmlLinkListener, url: string): Promise<void> | null {
    const listener = getDndEntityLinkListener(htmlLinkListener, url);
    return listener ? listener.onClick(url) : null;
}

export function getDndEntityLinkListener(
    htmlLinkListener: HtmlLinkListener,
    url: string,
): DndEntityLinkListener | null {
    return getDndEntityLinkListeners(htmlLinkListener)
        .find(it => url.startsWith(it.href)) ?? null;
}

export function getDndEntityLinkSelector(): string {
    const hrefs = DND_ENTITY_LINK_HREFS;
    return hrefs.slice(1).reduce((acc, href) => `${acc}, a[href^="${href}"]`, `a[href^="${hrefs[0]}"]`);
}

// ---- private ---- 
const DND_ENTITY_LINK_HREFS = [
    '/bestiary/',
    '/spells/',
    '/screens/',
    '/weapons/',
    '/armors/',
    '/backgrounds/',
    '/feats/',
    '/races/',
    '/classes/',
    '/character-sheets/',
    '/items/magic/',
    '/items/',
] as const;

export interface DndEntityLinkListener {
    href: string;
    onClick: (url: string) => Promise<void>;
}

function LinkListener(href: string, onClick: (url: string) => Promise<void>): DndEntityLinkListener {
    return { href, onClick };
}

function getDndEntityLinkListeners(htmlLinkListener: HtmlLinkListener): DndEntityLinkListener[] {
    return [
        LinkListener('/bestiary/', htmlLinkListener.onBeastClick),
        LinkListener('/spells/', htmlLinkListener.onSpellClick),
        LinkListener('/screens/', htmlLinkListener.onScreenItemClick),
        LinkListener('/weapons/', htmlLinkListener.onWeaponClick),
        LinkListener('/armors/', htmlLinkListener.onArmorClick),
        LinkListener('/backgrounds/', htmlLinkListener.onBackgroundClick),
        LinkListener('/feats/', htmlLinkListener.onFeatClick),
        LinkListener('/races/', htmlLinkListener.onRaceClick),
        LinkListener('/classes/', htmlLinkListener.onClassClick),
        LinkListener('/character-sheets/', htmlLinkListener.onCharacterSheetClick),
        LinkListener('/items/magic/', htmlLinkListener.onArtifactClick),
        LinkListener('/items/', htmlLinkListener.onItemClick),
    ];
}

const addHtmlLinkListeners = (linkListeners: DndEntityLinkListener[]) => (node: HTMLElement) => {
    const handleLinkClick = (e: MouseEvent) => {  
        const link = e.currentTarget as HTMLAnchorElement;
        const url = link.getAttribute('href')!;
        const listener = linkListeners.find(it => url.startsWith(it.href));
        if (listener) {
            e.preventDefault();
            listener.onClick(url);
        }
    }
    const selector = getDndEntityLinkSelector();
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
