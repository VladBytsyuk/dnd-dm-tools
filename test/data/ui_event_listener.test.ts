import { UiEventListener } from "src/data/ui_event_listener";
import { describe, it, expect, vi } from 'vitest';
import { App, Notice } from "obsidian";
import * as imageUtils from 'src/domain/utils/image_utils';

vi.mock('obsidian', async () => {
    const actual = await vi.importActual("test/__mocks__/obsidian");
    return {
        ...actual,
        Notice: vi.fn(),
    };
});

vi.mock('src/domain/utils/image_utils', () => ({
    getImageSource: vi.fn(),
}));

describe('UI Event Listener', () => {
    it('should call bestiary feature on beast click', async () => {
        // Arrange
        const app = new App();
        const mockFeature = {
            onItemClick: vi.fn()
        };
        const listener = new UiEventListener(
            app,
            () => mockFeature,
            () => null,
            () => null,
            () => null,
            () => null,
            () => null,
            () => null,
            () => null,
        );
        const url = '/bestiary/some-beast';

        // Act
        await listener.onBeastClick(url);

        // Assert
        expect(mockFeature.onItemClick).toHaveBeenCalledWith(url);
    });

    it('should call spellbook feature on spell click', async () => {
        // Arrange
        const app = new App();
        const mockFeature = {
            onItemClick: vi.fn()
        };
        const listener = new UiEventListener(
            app,
            () => null,
            () => mockFeature,
            () => null,
            () => null,
            () => null,
            () => null,
            () => null,
            () => null,
        );
        const url = '/spell/some-spell';

        // Act
        await listener.onSpellClick(url);

        // Assert
        expect(mockFeature.onItemClick).toHaveBeenCalledWith(url);
    });

    it('should call arsenal feature on weapon click', async () => {
        // Arrange
        const app = new App();
        const mockFeature = {
            onItemClick: vi.fn()
        };
        const listener = new UiEventListener(
            app,
            () => null,
            () => null,
            () => mockFeature,
            () => null,
            () => null,
            () => null,
            () => null,
            () => null,
        );
        const url = '/weapon/some-weapon';

        // Act
        await listener.onWeaponClick(url);

        // Assert
        expect(mockFeature.onItemClick).toHaveBeenCalledWith(url);
    });

    it('should call armory feature on armor click', async () => {
        // Arrange
        const app = new App();
        const mockFeature = {
            onItemClick: vi.fn()
        };
        const listener = new UiEventListener(
            app,
            () => null,
            () => null,
            () => null,
            () => mockFeature,
            () => null,
            () => null,
            () => null,
            () => null,
        );
        const url = '/armor/some-armor';

        // Act
        await listener.onArmorClick(url);

        // Assert
        expect(mockFeature.onItemClick).toHaveBeenCalledWith(url);
    });

    it('should call equipment feature on item click', async () => {
        // Arrange
        const app = new App();
        const mockFeature = {
            onItemClick: vi.fn()
        };
        const listener = new UiEventListener(
            app,
            () => null,
            () => null,
            () => null,
            () => null,
            () => mockFeature,
            () => null,
            () => null,
            () => null,
        );
        const url = '/item/some-item';

        // Act
        await listener.onItemClick(url);

        // Assert
        expect(mockFeature.onItemClick).toHaveBeenCalledWith(url);
    });

    it('should call artifactory feature on artifact click', async () => {
        // Arrange
        const app = new App();
        const mockFeature = {
            onItemClick: vi.fn()
        };
        const listener = new UiEventListener(
            app,
            () => null,
            () => null,
            () => null,
            () => null,
            () => null,
            () => mockFeature,
            () => null,
            () => null,
        );
        const url = '/artifact/some-artifact';

        // Act
        await listener.onArtifactClick(url);

        // Assert
        expect(mockFeature.onItemClick).toHaveBeenCalledWith(url);
    });

    it('should call dm screen feature on screen item click', async () => {
        // Arrange
        const app = new App();
        const mockFeature = {
            onItemClick: vi.fn()
        };
        const listener = new UiEventListener(
            app,
            () => null,
            () => null,
            () => null,
            () => null,
            () => null,
            () => null,
            () => null,
            () => mockFeature,
        );
        const url = '/screen/some-screen-item';

        // Act
        await listener.onScreenItemClick(url);

        // Assert
        expect(mockFeature.onItemClick).toHaveBeenCalledWith(url);
    });

    it('should call background feature on background click', async () => {
        // Arrange
        const app = new App();
        const mockFeature = {
            onItemClick: vi.fn()
        };
        const listener = new UiEventListener(
            app,
            () => null,
            () => null,
            () => null,
            () => null,
            () => null,
            () => null,
            () => mockFeature,
            () => null,
        );
        const url = '/background/some-background';

        // Act
        await listener.onBackgroundClick(url);

        // Assert
        expect(mockFeature.onItemClick).toHaveBeenCalledWith(url);
    });
    
    it('should show notice on dice roll', () => {
        // Arrange
        const app = new App();
        const listener = new UiEventListener(app, () => null, () => null, () => null, () => null, () => null, () => null, () => null, () => null);
        const label = 'Damage';
        const value = {
            total: 10,
            resolvedFormula: '5 + 5'
        };

        // Act
        listener.onDiceRoll(label, value);

        // Assert
        expect(Notice).toHaveBeenCalledWith(`${label}: ${value.total}\n\n${value.resolvedFormula}`);
    });

    it('should get image source on image requested', async () => {
        // Arrange
        const app = new App();
        const listener = new UiEventListener(app, () => null, () => null, () => null, () => null, () => null, () => null, () => null, () => null);
        const imageUrl = 'http://example.com/image.png';
        const expectedSource = 'data:image/png;base64,somesource';
        (imageUtils.getImageSource as vi.Mock).mockResolvedValue(expectedSource);

        // Act
        const source = await listener.onImageRequested(imageUrl);

        // Assert
        expect(imageUtils.getImageSource).toHaveBeenCalledWith(app, imageUrl);
        expect(source).toBe(expectedSource);
    });
});
