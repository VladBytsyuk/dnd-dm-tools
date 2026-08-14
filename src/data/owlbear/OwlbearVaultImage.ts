import { normalizePath, TFile, type App } from "obsidian";

export const MAX_OWLBEAR_IMAGE_BYTES = 8 * 1024 * 1024;

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
