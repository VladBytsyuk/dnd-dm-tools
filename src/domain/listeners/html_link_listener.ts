// ---- public ----
export interface HtmlLinkListener {
    onBeastClick: (url: string) => Promise<void>;
    onSpellClick: (url: string) => Promise<void>;
    onWeaponClick: (url: string) => Promise<void>;
    onArmorClick: (url: string) => Promise<void>;
    onScreenItemClick: (url: string) => Promise<void>;
}

export const registerHtmlLinkListener = (htmlLinkListener: HtmlLinkListener) => (node: HTMLElement) => {
    return addHtmlLinkLiteners(
        [
            LinkListener('/bestiary/', htmlLinkListener.onBeastClick),
            LinkListener('/spells/', htmlLinkListener.onSpellClick),
            LinkListener('/screens/', htmlLinkListener.onScreenItemClick),
            LinkListener('/weapons/', htmlLinkListener.onWeaponClick),
            LinkListener('/armors/', htmlLinkListener.onArmorClick),
        ]
    )(node);
}

// ---- private ---- 
interface LinkListener {
    href: string;
    onClick: (url: string) => Promise<void>;
}

function LinkListener(href: string, onClick: (url: string) => Promise<void>): LinkListener {
    return { href, onClick };
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
