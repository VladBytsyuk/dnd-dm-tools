import { normalizePath, TFile, type App } from "obsidian";
import { get } from "https";
import type { IncomingMessage } from "http";

export const MAX_OWLBEAR_IMAGE_BYTES = 8 * 1024 * 1024;
const REMOTE_IMAGE_TIMEOUT_MS = 30_000;
const MAX_REMOTE_IMAGE_REDIRECTS = 3;

export type OwlbearRemoteImage = {
	bytes: Uint8Array;
	mime: string;
};

export function resolveOwlbearVaultImageFile(app: App, source: string): TFile {
	const filePath = source.startsWith("obsidian://")
		? decodeURIComponent(new URLSearchParams(source.split("?", 2)[1] ?? "").get("file") ?? "")
		: source;
	if (!filePath || /^[a-z][a-z0-9+.-]*:/i.test(filePath)) {
		throw new Error("поддерживаются только HTTP(S), data URL и файлы внутри vault");
	}
	const file = app.vault.getAbstractFileByPath(normalizePath(filePath));
	if (!(file instanceof TFile)) throw new Error("файл изображения не найден внутри vault");
	return file;
}

export function validateOwlbearRemoteImageUrl(source: string): string {
	const url = new URL(source);
	if (url.protocol !== "https:") throw new Error("внешние изображения разрешены только по HTTPS");
	if (url.username || url.password) throw new Error("URL изображения не должен содержать учётные данные");
	if (url.port && url.port !== "443") throw new Error("нестандартный порт изображения запрещён");
	if (isPrivateHostname(url.hostname)) throw new Error("локальные и приватные адреса изображений запрещены");
	return url.href;
}

export async function downloadOwlbearRemoteImage(source: string): Promise<OwlbearRemoteImage> {
	return await downloadOwlbearRemoteImageUrl(validateOwlbearRemoteImageUrl(source), 0);
}

export function mimeForOwlbearImagePath(path: string): string {
	const extension = path.split(/[?#]/, 1)[0].split(".").pop()?.toLowerCase();
	if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
	if (extension === "webp") return "image/webp";
	if (extension === "gif") return "image/gif";
	if (extension === "svg") return "image/svg+xml";
	return "image/png";
}

export function assertOwlbearImageSize(byteLength: number): void {
	if (!Number.isFinite(byteLength) || byteLength < 0 || byteLength > MAX_OWLBEAR_IMAGE_BYTES) {
		throw new Error(`изображение превышает лимит ${MAX_OWLBEAR_IMAGE_BYTES / 1024 / 1024} МБ`);
	}
}

export function assertOwlbearImageDataUrlSize(dataUrl: string): void {
	assertOwlbearImageSize(getOwlbearImageDataUrlByteLength(dataUrl));
}

export function getOwlbearImageDataUrlByteLength(dataUrl: string): number {
	const comma = dataUrl.indexOf(",");
	if (comma < 0) throw new Error("некорректный data URL изображения");
	const payload = dataUrl.slice(comma + 1);
	let byteLength: number;
	if (/;base64(?:;|$)/i.test(dataUrl.slice(0, comma))) {
		const base64 = payload.replace(/\s/g, "");
		const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
		byteLength = Math.floor(base64.length * 3 / 4) - padding;
	} else {
		byteLength = new TextEncoder().encode(decodeURIComponent(payload)).byteLength;
	}
	return byteLength;
}

function downloadOwlbearRemoteImageUrl(url: string, redirects: number): Promise<OwlbearRemoteImage> {
	return new Promise((resolve, reject) => {
		const request = get(url, { headers: { "User-Agent": "dnd-dm-tools-owlbear-image" } }, (response) => {
			if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
				response.resume();
				if (redirects >= MAX_REMOTE_IMAGE_REDIRECTS) {
					reject(new Error("Слишком много перенаправлений при загрузке изображения."));
					return;
				}
				try {
					const redirectedUrl = validateOwlbearRemoteImageUrl(new URL(response.headers.location, url).href);
					downloadOwlbearRemoteImageUrl(redirectedUrl, redirects + 1).then(resolve, reject);
				} catch (error) {
					reject(error);
				}
				return;
			}
			consumeOwlbearRemoteImage(response, url).then(resolve, reject);
		});
		request.once("error", reject);
		request.setTimeout(REMOTE_IMAGE_TIMEOUT_MS, () => request.destroy(new Error("Загрузка изображения не отвечает более 30 секунд.")));
	});
}

function consumeOwlbearRemoteImage(response: IncomingMessage, sourceUrl: string): Promise<OwlbearRemoteImage> {
	return new Promise((resolve, reject) => {
		if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
			response.resume();
			reject(new Error(`HTTP ${response.statusCode ?? "?"}`));
			return;
		}
		try {
			const contentLength = Number(response.headers["content-length"]);
			if (Number.isFinite(contentLength)) assertOwlbearImageSize(contentLength);
			const mime = response.headers["content-type"]?.split(";", 1)[0] || mimeForOwlbearImagePath(sourceUrl);
			if (!mime.startsWith("image/")) throw new Error("файл не является изображением");
			const chunks: Buffer[] = [];
			let byteLength = 0;
			let settled = false;
			const fail = (error: Error): void => {
				if (settled) return;
				settled = true;
				response.destroy();
				reject(error);
			};
			response.on("data", (chunk: Buffer) => {
				byteLength += chunk.length;
				if (byteLength > MAX_OWLBEAR_IMAGE_BYTES) {
					fail(new Error(`изображение превышает лимит ${MAX_OWLBEAR_IMAGE_BYTES / 1024 / 1024} МБ`));
					return;
				}
				chunks.push(chunk);
			});
			response.once("error", fail);
			response.once("end", () => {
				if (settled) return;
				settled = true;
				resolve({ bytes: new Uint8Array(Buffer.concat(chunks)), mime });
			});
		} catch (error) {
			response.resume();
			reject(error);
		}
	});
}

function isPrivateHostname(rawHostname: string): boolean {
	const hostname = rawHostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
	if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local")) return true;
	if (hostname === "::" || hostname === "::1" || hostname === "0:0:0:0:0:0:0:1") return true;
	if (/^(?:fc|fd|fe[89ab])/i.test(hostname)) return true;
	const mappedIpv4 = hostname.match(/(?:^|:)ffff:(\d+\.\d+\.\d+\.\d+)$/i)?.[1];
	const ipv4 = mappedIpv4 ?? (/^\d+\.\d+\.\d+\.\d+$/.test(hostname) ? hostname : null);
	if (!ipv4) return false;
	const octets = ipv4.split(".").map(Number);
	if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) return true;
	const [first, second] = octets;
	return first === 0
		|| first === 10
		|| first === 127
		|| (first === 100 && second >= 64 && second <= 127)
		|| (first === 169 && second === 254)
		|| (first === 172 && second >= 16 && second <= 31)
		|| (first === 192 && (second === 0 || second === 168))
		|| (first === 198 && (second === 18 || second === 19))
		|| first >= 224;
}
