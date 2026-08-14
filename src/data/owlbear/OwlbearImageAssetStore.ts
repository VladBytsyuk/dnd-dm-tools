import { createHash } from "crypto";
import { mkdir, readdir, readFile, rename, stat, unlink, utimes, writeFile } from "fs/promises";
import { join } from "path";

const DEFAULT_MAX_BYTES = 250 * 1024 * 1024;

export type ImageAsset = {
	assetId: string;
	mime: string;
	bytes: Buffer;
};

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
