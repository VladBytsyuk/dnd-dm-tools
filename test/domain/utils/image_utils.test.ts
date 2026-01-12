import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getImageSource } from '../../../src/domain/utils/image_utils';
import * as obsidian from 'obsidian';
import { MockTFile } from 'obsidian';

vi.mock('obsidian', async (importActual) => {
    const actual = await importActual<typeof obsidian>();

    // Define MockTFile directly inside the mock factory
    class MockTFile {
        path: string;
        vault: any;

        constructor(vault: any, path: string) {
            this.vault = vault;
            this.path = path;
        }
    }

    return {
        ...actual,
        TFile: MockTFile, // Export our custom MockTFile
        MockTFile: MockTFile, // Also export MockTFile so it can be used in tests
    };
});

describe('image_utils', () => {
    let mockApp: any;
    let mockVault: any;

    beforeEach(() => {
        mockApp = {
            vault: {
                adapter: {
                    getResourcePath: vi.fn((path: string) => `app://${path}`),
                },
                getAbstractFileByPath: vi.fn(),
                getResourcePath: vi.fn((file: TFile) => `vault://${file.path}`),
            },
        };
        mockVault = mockApp.vault;
    });

    it('should return the image name if it is a regular http URL', async () => {
        const imageUrl = 'http://example.com/image.png';
        const result = await getImageSource(mockApp, imageUrl);
        expect(result).toBe(imageUrl);
        expect(mockVault.getAbstractFileByPath).not.toHaveBeenCalled();
    });

    it('should return the image name if it is a regular https URL', async () => {
        const imageUrl = 'https://example.com/image.png';
        const result = await getImageSource(mockApp, imageUrl);
        expect(result).toBe(imageUrl);
        expect(mockVault.getAbstractFileByPath).not.toHaveBeenCalled();
    });

            it('should handle local paths that exist in the vault', async () => {
                const localPath = 'path/to/local/image.png';
                const mockFile = new MockTFile(mockApp.vault, localPath);
                mockVault.getAbstractFileByPath.mockReturnValue(mockFile);
        const result = await getImageSource(mockApp, localPath);
        expect(result).toBe(`vault://${localPath}`);
        expect(mockVault.getAbstractFileByPath).toHaveBeenCalledWith(localPath);
        expect(mockVault.getResourcePath).toHaveBeenCalledWith(mockFile);
    });

    it('should return the local path if it does not exist in the vault', async () => {
        const localPath = 'path/to/nonexistent/image.png';
        mockVault.getAbstractFileByPath.mockReturnValue(null);

        const result = await getImageSource(mockApp, localPath);
        expect(result).toBe(localPath);
        expect(mockVault.getAbstractFileByPath).toHaveBeenCalledWith(localPath);
        expect(mockVault.getResourcePath).not.toHaveBeenCalled();
    });

    it('should handle obsidian URLs', async () => {
        const obsidianUrl = 'obsidian://open?vault=MyVault&file=images%2Fmy_image.png';
        mockVault.adapter.getResourcePath.mockReturnValue('app://images/my_image.png');

        const result = await getImageSource(mockApp, obsidianUrl);
        expect(result).toBe('app://images/my_image.png');
        expect(mockVault.adapter.getResourcePath).toHaveBeenCalledWith('images/my_image.png');
    });
});
