import { createHash } from "crypto";
import { mkdir, readdir, readFile, rename, stat, unlink, utimes, writeFile } from "fs/promises";
import { join } from "path";

const DEFAULT_MAX_BYTES = 250 * 1024 * 1024;
const ROUND_TOKEN_SVG_MARKER = "dnd-dm-tools-round-token-v1";

export type ImageAsset = {
	assetId: string;
	mime: string;
	bytes: Buffer;
};

export type TokenVisualState = "down" | "dead";

export class OwlbearImageAssetStore {
	private initialized = false;

	constructor(
		private readonly directory: string,
		private readonly maxBytes = DEFAULT_MAX_BYTES,
	) {}

	async initialize(): Promise<void> {
		if (this.initialized) return;
		await mkdir(this.directory, { recursive: true });
		this.initialized = true;
		await this.cleanup([]);
	}

	async put(mime: string, bytes: Buffer, protectedAssetIds: string[] = []): Promise<string> {
		await this.initialize();
		const assetId = createHash("sha256").update(mime).update(bytes).digest("hex");
		const destination = this.pathFor(assetId);
		try {
			await stat(destination);
		} catch {
			const temporary = `${destination}.${process.pid}.${Date.now()}.tmp`;
			await writeFile(temporary, bytes, { flag: "wx" });
			try { await rename(temporary, destination); } catch (error) {
				try { await unlink(temporary); } catch { /* best effort cleanup */ }
				if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
			}
		}
		await this.touch(assetId);
		await this.cleanup(protectedAssetIds.concat(assetId));
		return assetId;
	}

	async get(assetId: string): Promise<Buffer | null> {
		await this.initialize();
		if (!/^[a-f0-9]{64}$/.test(assetId)) return null;
		try {
			const bytes = await readFile(this.pathFor(assetId));
			await this.touch(assetId);
			return bytes;
		} catch {
			return null;
		}
	}

	async has(assetId: string): Promise<boolean> {
		return (await this.get(assetId)) !== null;
	}

	async cleanup(protectedAssetIds: string[]): Promise<void> {
		await this.initializeDirectory();
		const protectedSet = new Set(protectedAssetIds);
		const entries = await readdir(this.directory, { withFileTypes: true });
		const files: Array<{ assetId: string; path: string; size: number; mtimeMs: number }> = [];
		for (const entry of entries) {
			if (!entry.isFile() || !/^[a-f0-9]{64}$/.test(entry.name)) continue;
			const assetId = entry.name;
			const filePath = join(this.directory, entry.name);
			const details = await stat(filePath);
			files.push({ assetId, path: filePath, size: details.size, mtimeMs: details.mtimeMs });
		}
		let total = files.reduce((sum, file) => sum + file.size, 0);
		if (total <= this.maxBytes) return;
		for (const file of files.sort((left, right) => left.mtimeMs - right.mtimeMs)) {
			if (total <= this.maxBytes || protectedSet.has(file.assetId)) continue;
			try { await unlink(file.path); total -= file.size; } catch { /* best effort cleanup */ }
		}
	}

	private async initializeDirectory(): Promise<void> {
		await mkdir(this.directory, { recursive: true });
	}

	private pathFor(assetId: string): string { return join(this.directory, assetId); }

	private async touch(assetId: string): Promise<void> {
		const filePath = this.pathFor(assetId);
		const now = new Date();
		try { await utimes(filePath, now, now); } catch { /* best effort */ }
	}
}

export function createFallbackSvg(name: string, colorHex: string | undefined, side: "pc" | "enemy" | "neutral"): ImageAsset {
	const initials = Array.from(name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => Array.from(part)[0] ?? "").join("").toUpperCase()).slice(0, 2).join("") || "?";
	const color = /^#[0-9a-f]{6}$/i.test(colorHex ?? "") ? colorHex! : ({ pc: "#2563eb", enemy: "#dc2626", neutral: "#64748b" }[side]);
	const escapedInitials = initials.replace(/[&<>"']/g, (value) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[value]!));
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><circle cx="256" cy="256" r="248" fill="${color}"/><text x="256" y="286" text-anchor="middle" font-family="sans-serif" font-size="150" font-weight="700" fill="#ffffff">${escapedInitials}</text></svg>`;
	return { assetId: "", mime: "image/svg+xml", bytes: Buffer.from(svg), };
}

export function createRoundTokenSvg(mime: string, bytes: Buffer, width: number, height: number): Buffer {
	const diameter = roundTokenDiameter(width, height);
	const source = `data:${mime};base64,${bytes.toString("base64")}`;
	const radius = diameter / 2;
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${diameter}" height="${diameter}" viewBox="0 0 ${diameter} ${diameter}"><metadata>${ROUND_TOKEN_SVG_MARKER}</metadata><defs><clipPath id="round-token"><circle cx="${radius}" cy="${radius}" r="${radius}"/></clipPath></defs><image href="${source}" width="${diameter}" height="${diameter}" preserveAspectRatio="xMidYMid slice" clip-path="url(#round-token)"/></svg>`;
	return Buffer.from(svg);
}

export function isRoundTokenSvg(bytes: Buffer): boolean {
	return bytes.includes(ROUND_TOKEN_SVG_MARKER);
}

export function roundTokenDiameter(width: number | undefined, height: number | undefined): number {
	const smallestSide = Math.min(width ?? 512, height ?? 512);
	return Number.isFinite(smallestSide) && smallestSide > 0 ? Math.max(1, Math.floor(smallestSide)) : 512;
}

export function createTokenVisualSvg(mime: string, bytes: Buffer, state: TokenVisualState, width: number, height: number): Buffer {
	const { darkeningOpacity, tokenOpacity } = state === "dead"
		? { darkeningOpacity: 0.8, tokenOpacity: 0.5 }
		: { darkeningOpacity: 0.5, tokenOpacity: 0.75 };
	const source = `data:${mime};base64,${bytes.toString("base64")}`;
	const overlaySize = Math.min(width, height) * 0.5;
	const overlayX = (width - overlaySize) / 2;
	const overlayY = (height - overlaySize) / 2;
	const overlay = state === "dead"
		? `<g transform="translate(${overlayX} ${overlayY}) scale(${overlaySize / 24})" fill="none" stroke="#f8fafc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12.5 17-.5-1-.5 1h1z"/><path d="M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="12" r="1"/></g>`
		: `<text x="${width / 2}" y="${height / 2}" fill="#f8fafc" font-family="sans-serif" font-size="${overlaySize}" font-weight="700" text-anchor="middle" dominant-baseline="central">0</text>`;
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><image id="source" href="${source}" width="${width}" height="${height}" preserveAspectRatio="none"/><mask id="alpha" mask-type="alpha"><use href="#source"/></mask></defs><g opacity="${tokenOpacity}"><use href="#source"/><rect width="${width}" height="${height}" fill="#000000" fill-opacity="${darkeningOpacity}" mask="url(#alpha)"/>${overlay}</g></svg>`;
	return Buffer.from(svg);
}
