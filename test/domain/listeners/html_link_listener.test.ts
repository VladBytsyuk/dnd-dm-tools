import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerHtmlLinkListener, HtmlLinkListener } from '../../../src/domain/listeners/html_link_listener';

describe('html_link_listener', () => {
    let mockHtmlLinkListener: HtmlLinkListener;
    let mockNode: HTMLElement;

    beforeEach(() => {
        mockHtmlLinkListener = {
            onBeastClick: vi.fn(),
            onSpellClick: vi.fn(),
            onWeaponClick: vi.fn(),
            onArmorClick: vi.fn(),
            onItemClick: vi.fn(),
            onArtifactClick: vi.fn(),
            onBackgroundClick: vi.fn(),
            onScreenItemClick: vi.fn(),
        };

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
        link.click();

        expect(mockHtmlLinkListener.onBeastClick).toHaveBeenCalledWith('/bestiary/goblin');
    });

    it('should register click listeners for spells', () => {
        const link = document.createElement('a');
        link.setAttribute('href', '/spells/fireball');
        mockNode.appendChild(link);

        registerHtmlLinkListener(mockHtmlLinkListener)(mockNode);
        link.click();

        expect(mockHtmlLinkListener.onSpellClick).toHaveBeenCalledWith('/spells/fireball');
    });

    it('should register click listeners for weapons', () => {
        const link = document.createElement('a');
        link.setAttribute('href', '/weapons/sword');
        mockNode.appendChild(link);

        registerHtmlLinkListener(mockHtmlLinkListener)(mockNode);
        link.click();

        expect(mockHtmlLinkListener.onWeaponClick).toHaveBeenCalledWith('/weapons/sword');
    });

    it('should register click listeners for armors', () => {
        const link = document.createElement('a');
        link.setAttribute('href', '/armors/leather');
        mockNode.appendChild(link);

        registerHtmlLinkListener(mockHtmlLinkListener)(mockNode);
        link.click();

        expect(mockHtmlLinkListener.onArmorClick).toHaveBeenCalledWith('/armors/leather');
    });

    it('should register click listeners for items', () => {
        const link = document.createElement('a');
        link.setAttribute('href', '/items/potion');
        mockNode.appendChild(link);

        registerHtmlLinkListener(mockHtmlLinkListener)(mockNode);
        link.click();

        expect(mockHtmlLinkListener.onItemClick).toHaveBeenCalledWith('/items/potion');
    });

    it('should register click listeners for artifacts', () => {
        const link = document.createElement('a');
        link.setAttribute('href', '/items/magic/ring');
        mockNode.appendChild(link);

        registerHtmlLinkListener(mockHtmlLinkListener)(mockNode);
        link.click();

        expect(mockHtmlLinkListener.onArtifactClick).toHaveBeenCalledWith('/items/magic/ring');
    });

    it('should register click listeners for backgrounds', () => {
        const link = document.createElement('a');
        link.setAttribute('href', '/backgrounds/urchin');
        mockNode.appendChild(link);

        registerHtmlLinkListener(mockHtmlLinkListener)(mockNode);
        link.click();

        expect(mockHtmlLinkListener.onBackgroundClick).toHaveBeenCalledWith('/backgrounds/urchin');
    });

    it('should register click listeners for screen items', () => {
        const link = document.createElement('a');
        link.setAttribute('href', '/screens/conditions');
        mockNode.appendChild(link);

        registerHtmlLinkListener(mockHtmlLinkListener)(mockNode);
        link.click();

        expect(mockHtmlLinkListener.onScreenItemClick).toHaveBeenCalledWith('/screens/conditions');
    });

    it('should not call any listener if href does not match', () => {
        const link = document.createElement('a');
        link.setAttribute('href', '/unknown/page');
        mockNode.appendChild(link);

        registerHtmlLinkListener(mockHtmlLinkListener)(mockNode);
        link.click();

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
        link.click();

        expect(mockHtmlLinkListener.onBeastClick).not.toHaveBeenCalled();
    });
});
