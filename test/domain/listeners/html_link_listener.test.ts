import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    getDndEntityLinkListener,
    registerHtmlLinkListener,
    type HtmlLinkListener,
    resolveDndEntityLink,
} from '../../../src/domain/listeners/html_link_listener';

function dispatchLinkClick(link: HTMLAnchorElement) {
    link.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }));
}

describe('html_link_listener', () => {
    let mockHtmlLinkListener: HtmlLinkListener;
    let mockNode: HTMLElement;
    beforeEach(() => {
        mockHtmlLinkListener = createMockHtmlLinkListener();

        mockNode = document.createElement('div');
        document.body.appendChild(mockNode);
    });

    afterEach(() => {
        document.body.removeChild(mockNode);
    });

    it('should register click listeners for beasts', () => {
        const link = document.createElement('a');
        link.setAttribute('href', '/bestiary/goblin');
        mockNode.appendChild(link);

        registerHtmlLinkListener(mockHtmlLinkListener)(mockNode);
        dispatchLinkClick(link);

        expect(mockHtmlLinkListener.onBeastClick).toHaveBeenCalledWith('/bestiary/goblin');
    });

    it('should register click listeners for spells', () => {
        const link = document.createElement('a');
        link.setAttribute('href', '/spells/fireball');
        mockNode.appendChild(link);

        registerHtmlLinkListener(mockHtmlLinkListener)(mockNode);
        dispatchLinkClick(link);

        expect(mockHtmlLinkListener.onSpellClick).toHaveBeenCalledWith('/spells/fireball');
    });

    it('should register click listeners for weapons', () => {
        const link = document.createElement('a');
        link.setAttribute('href', '/weapons/sword');
        mockNode.appendChild(link);

        registerHtmlLinkListener(mockHtmlLinkListener)(mockNode);
        dispatchLinkClick(link);

        expect(mockHtmlLinkListener.onWeaponClick).toHaveBeenCalledWith('/weapons/sword');
    });

    it('should register click listeners for armors', () => {
        const link = document.createElement('a');
        link.setAttribute('href', '/armors/leather');
        mockNode.appendChild(link);

        registerHtmlLinkListener(mockHtmlLinkListener)(mockNode);
        dispatchLinkClick(link);

        expect(mockHtmlLinkListener.onArmorClick).toHaveBeenCalledWith('/armors/leather');
    });

    it('should register click listeners for items', () => {
        const link = document.createElement('a');
        link.setAttribute('href', '/items/potion');
        mockNode.appendChild(link);

        registerHtmlLinkListener(mockHtmlLinkListener)(mockNode);
        dispatchLinkClick(link);

        expect(mockHtmlLinkListener.onItemClick).toHaveBeenCalledWith('/items/potion');
    });

    it('should register click listeners for artifacts', () => {
        const link = document.createElement('a');
        link.setAttribute('href', '/items/magic/ring');
        mockNode.appendChild(link);

        registerHtmlLinkListener(mockHtmlLinkListener)(mockNode);
        dispatchLinkClick(link);

        expect(mockHtmlLinkListener.onArtifactClick).toHaveBeenCalledWith('/items/magic/ring');
    });

    it('should register click listeners for backgrounds', () => {
        const link = document.createElement('a');
        link.setAttribute('href', '/backgrounds/urchin');
        mockNode.appendChild(link);

        registerHtmlLinkListener(mockHtmlLinkListener)(mockNode);
        dispatchLinkClick(link);

        expect(mockHtmlLinkListener.onBackgroundClick).toHaveBeenCalledWith('/backgrounds/urchin');
    });

    it('should register click listeners for screen items', () => {
        const link = document.createElement('a');
        link.setAttribute('href', '/screens/conditions');
        mockNode.appendChild(link);

        registerHtmlLinkListener(mockHtmlLinkListener)(mockNode);
        dispatchLinkClick(link);

        expect(mockHtmlLinkListener.onScreenItemClick).toHaveBeenCalledWith('/screens/conditions');
    });

    it('should not call any listener if href does not match', () => {
        const link = document.createElement('a');
        link.setAttribute('href', '/unknown/page');
        mockNode.appendChild(link);

        registerHtmlLinkListener(mockHtmlLinkListener)(mockNode);
        dispatchLinkClick(link);

        expect(mockHtmlLinkListener.onBeastClick).not.toHaveBeenCalled();
        expect(mockHtmlLinkListener.onSpellClick).not.toHaveBeenCalled();
        expect(mockHtmlLinkListener.onWeaponClick).not.toHaveBeenCalled();
        expect(mockHtmlLinkListener.onArmorClick).not.toHaveBeenCalled();
        expect(mockHtmlLinkListener.onItemClick).not.toHaveBeenCalled();
        expect(mockHtmlLinkListener.onArtifactClick).not.toHaveBeenCalled();
        expect(mockHtmlLinkListener.onBackgroundClick).not.toHaveBeenCalled();
        expect(mockHtmlLinkListener.onScreenItemClick).not.toHaveBeenCalled();
    });

    it('should destroy listeners when destroy is called', () => {
        const link = document.createElement('a');
        link.setAttribute('href', '/bestiary/goblin');
        mockNode.appendChild(link);

        const { destroy } = registerHtmlLinkListener(mockHtmlLinkListener)(mockNode);
        destroy();
        dispatchLinkClick(link);

        expect(mockHtmlLinkListener.onBeastClick).not.toHaveBeenCalled();
    });

    it('should resolve every supported entity prefix', async () => {
        const cases: [string, keyof HtmlLinkListener][] = [
            ['/bestiary/goblin', 'onBeastClick'],
            ['/spells/fireball', 'onSpellClick'],
            ['/screens/conditions', 'onScreenItemClick'],
            ['/weapons/sword', 'onWeaponClick'],
            ['/armors/leather', 'onArmorClick'],
            ['/backgrounds/urchin', 'onBackgroundClick'],
            ['/feats/sharpshooter', 'onFeatClick'],
            ['/races/elf', 'onRaceClick'],
            ['/classes/fighter', 'onClassClick'],
            ['/character-sheets/hero', 'onCharacterSheetClick'],
            ['/items/magic/ring', 'onArtifactClick'],
            ['/items/rope', 'onItemClick'],
        ];

        for (const [url, method] of cases) {
            await resolveDndEntityLink(mockHtmlLinkListener, url);
            expect(mockHtmlLinkListener[method]).toHaveBeenCalledWith(url);
        }
    });

    it('should prefer magic items before regular items', async () => {
        await resolveDndEntityLink(mockHtmlLinkListener, '/items/magic/ring');

        expect(mockHtmlLinkListener.onArtifactClick).toHaveBeenCalledWith('/items/magic/ring');
        expect(mockHtmlLinkListener.onItemClick).not.toHaveBeenCalled();
    });

    it('should return null for unsupported entity prefixes', () => {
        expect(getDndEntityLinkListener(mockHtmlLinkListener, '/unknown/page')).toBeNull();
        expect(resolveDndEntityLink(mockHtmlLinkListener, '/unknown/page')).toBeNull();
    });
});

function createMockHtmlLinkListener(): HtmlLinkListener {
    return {
        onBeastClick: vi.fn(async () => {}),
        onSpellClick: vi.fn(async () => {}),
        onWeaponClick: vi.fn(async () => {}),
        onArmorClick: vi.fn(async () => {}),
        onItemClick: vi.fn(async () => {}),
        onArtifactClick: vi.fn(async () => {}),
        onBackgroundClick: vi.fn(async () => {}),
        onFeatClick: vi.fn(async () => {}),
        onRaceClick: vi.fn(async () => {}),
        onClassClick: vi.fn(async () => {}),
        onCharacterSheetClick: vi.fn(async () => {}),
        onScreenItemClick: vi.fn(async () => {}),
    };
}
