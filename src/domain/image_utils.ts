import { TFile, type App } from "obsidian";

export async function getImageSource(app: App, imageName: string): Promise<string> {
    if (isLocalPath(imageName)) {
        const localPath = await getImagePath(app, imageName);
        if (localPath) {
            return localPath;
        } else {
            return imageName;
        }
    } else {
        return imageName;
    }
}

function isLocalPath(path: string) {
    return !path.startsWith('http://') && !path.startsWith('https://');
}

async function getImagePath(app: App, imageName: string): Promise<string | null> {
    const vault = app.vault;
    const file = vault.getAbstractFileByPath(imageName);
    if (file instanceof TFile) {
        return vault.getResourcePath(file);
    }
    return null;
};
