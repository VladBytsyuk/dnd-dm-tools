import { TFile, type App } from "obsidian";
import {
	assertOwlbearImageSize,
	downloadOwlbearRemoteImage,
	mimeForOwlbearImagePath,
} from "./OwlbearVaultImage";

const SUPPORTED_MIME_TYPES = new Set([
	"image/png",
	"image/jpeg",
	"image/webp",
	"image/gif",
	"image/svg+xml",
]);

export type OwlbearPreviewImage = {
	name: string;
	mime: string;
	width: number;
	height: number;
	dataUrl: string;
};

export function isSupportedOwlbearPreviewFile(file: TFile): boolean {
	return ["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(file.extension.toLowerCase());
}

export function isSupportedOwlbearPreviewUrl(url: string): boolean {
	try {
		return new URL(url).protocol === "https:";
	} catch {
		return false;
	}
}

export function isSupportedOwlbearPreviewMime(mime: string): boolean {
	return SUPPORTED_MIME_TYPES.has(mime.toLowerCase());
}

export async function loadOwlbearPreviewVaultImage(app: App, file: TFile): Promise<OwlbearPreviewImage> {
	if (!isSupportedOwlbearPreviewFile(file)) throw new Error("Поддерживаются PNG, JPEG, WebP, GIF и SVG.");
	assertOwlbearImageSize(file.stat.size);
	const bytes = new Uint8Array(await app.vault.readBinary(file));
	assertOwlbearImageSize(bytes.byteLength);
	return await createPreviewImage(file.basename, mimeForOwlbearImagePath(file.path), bytes);
}

export async function loadOwlbearPreviewRemoteImage(url: string): Promise<OwlbearPreviewImage> {
	const image = await downloadOwlbearRemoteImage(url);
	if (!isSupportedOwlbearPreviewMime(image.mime)) throw new Error("Поддерживаются PNG, JPEG, WebP, GIF и SVG.");
	const name = decodeURIComponent(new URL(url).pathname.split("/").pop() || "Изображение");
	return await createPreviewImage(name, image.mime, image.bytes);
}

async function createPreviewImage(name: string, mime: string, bytes: Uint8Array): Promise<OwlbearPreviewImage> {
	const dataUrl = createImageDataUrl(bytes, mime);
	const { width, height } = await getImageDimensions(dataUrl);
	return { name, mime, width, height, dataUrl };
}

function createImageDataUrl(bytes: Uint8Array, mime: string): string {
	let binary = "";
	for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index]);
	return `data:${mime};base64,${btoa(binary)}`;
}

function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = () => image.naturalWidth > 0 && image.naturalHeight > 0
			? resolve({ width: image.naturalWidth, height: image.naturalHeight })
			: reject(new Error("не удалось определить размеры изображения"));
		image.onerror = () => reject(new Error("не удалось прочитать изображение"));
		image.src = dataUrl;
	});
}
