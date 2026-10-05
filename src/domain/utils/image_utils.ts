import { TFile, type App } from "obsidian";

export async function getImageSource(app: App, imageName: string): Promise<string> {
    const file = resolveVaultImageFile(app, imageName);
    return file ? app.vault.getResourcePath(file) : imageName;
}

export function resolveVaultImageFile(app: App, imageName: string): TFile | null {
    const image = imageName.trim();
    if (!image || isAbsoluteSystemPath(image) || !isLocalPath(image)) return null;

    const filePath = isObsidianUrl(image) ? getObsidianFilePath(image) : normalizeVaultLink(image);
    if (!filePath) return null;

    const vaultPath = filePath.replace(/^\/+/, "");
    const file = app.vault.getAbstractFileByPath(filePath)
        ?? app.vault.getAbstractFileByPath(vaultPath)
        ?? app.metadataCache.getFirstLinkpathDest(vaultPath, "");
    return file instanceof TFile ? file : null;
}

function isLocalPath(path: string) {
    return !path.startsWith('http://') && !path.startsWith('https://')
}

function isObsidianUrl(path: string) {
    return path.startsWith('obsidian://');
}

function isAbsoluteSystemPath(path: string): boolean {
    return /^[a-z]:[\\/]/iu.test(path) || path.startsWith("file://");
}

function getObsidianFilePath(url: string): string {
    try {
        const parsed = new URL(url);
        const path = parsed.searchParams.get("file") ?? parsed.searchParams.get("path") ?? "";
        return normalizeVaultLink(path);
    } catch {
        return "";
    }
}

function normalizeVaultLink(value: string): string {
    let path = value.trim();
    const wikilink = path.match(/^!?\[\[([\s\S]*?)\]\]$/u);
    if (wikilink) path = wikilink[1];
    path = path.split(/[|#]/u, 1)[0].trim();
    try { path = decodeURIComponent(path); } catch { /* Keep malformed percent sequences as a literal path. */ }
    return path.replace(/^\.\//u, "");
}
