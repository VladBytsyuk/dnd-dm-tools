import { requestUrl } from "obsidian";
import { compareVersions } from "src/domain/utils/compareVersions";

const RELEASE_API = "https://api.github.com/repos/VladBytsyuk/dnd-dm-tools/releases/latest";
const RELEASE_DOWNLOAD_BASE = "https://github.com/VladBytsyuk/dnd-dm-tools/releases/download";
const RELEASE_PAGE_BASE = "https://github.com/VladBytsyuk/dnd-dm-tools/releases/tag";
const MAX_ARCHIVE_BYTES = 150 * 1024 * 1024;

export type PluginRelease = {
	version: string;
	url: string;
	pageUrl: string;
	archive: { name: string; size: number; digest?: string } | null;
};

export type PluginUpdateStatus =
	| { state: "idle" | "checking" | "current" }
	| { state: "available"; release: PluginRelease }
	| { state: "downloading"; release: PluginRelease; downloadedBytes: number; totalBytes: number }
	| { state: "downloadingTool"; release: PluginRelease }
	| { state: "installing"; release: PluginRelease }
	| { state: "complete"; version: string }
	| { state: "error"; message: string; release?: PluginRelease };

export class PluginUpdateService {
	private status: PluginUpdateStatus = { state: "idle" };
	private operation: Promise<void> | null = null;
	private readonly listeners = new Set<() => void>();

	constructor(
		private readonly pluginId: string,
		private readonly installedVersion: string,
		private readonly pluginDirectory: string | null,
	) {}

	getStatus(): PluginUpdateStatus { return this.status; }
	canInstall(): boolean { return this.pluginDirectory !== null; }

	subscribe(listener: () => void): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	check(): Promise<void> {
		if (this.operation) return this.operation;
		if (this.status.state === "complete") return Promise.resolve();
		this.setStatus({ state: "checking" });
		this.operation = this.checkLatest().finally(() => { this.operation = null; });
		return this.operation;
	}

	install(): Promise<void> {
		if (this.operation) return this.operation;
		const release = this.status.state === "available" || this.status.state === "error" ? this.status.release : undefined;
		if (!release?.archive || !this.pluginDirectory) return Promise.resolve();
		this.operation = this.installRelease(release).finally(() => { this.operation = null; });
		return this.operation;
	}

	private async checkLatest(): Promise<void> {
		try {
			const response = await requestUrl({ url: RELEASE_API, headers: { Accept: "application/vnd.github+json" } });
			const release = parseLatestRelease(response.json);
			this.setStatus(compareVersions(release.version, this.installedVersion) > 0
				? { state: "available", release }
				: { state: "current" });
		} catch (error) {
			this.setStatus({ state: "error", message: errorMessage(error) });
		}
	}

	private async installRelease(release: PluginRelease): Promise<void> {
		try {
			this.setStatus({ state: "downloading", release, downloadedBytes: 0, totalBytes: release.archive!.size });
			const { downloadAndInstallPluginRelease } = await import("./PluginUpdateDesktop");
			await downloadAndInstallPluginRelease(release, this.pluginDirectory!, this.pluginId,
				(downloadedBytes) => this.setStatus({ state: "downloading", release, downloadedBytes, totalBytes: release.archive!.size }),
				() => this.setStatus({ state: "installing", release }),
				() => this.setStatus({ state: "downloadingTool", release }));
			this.setStatus({ state: "complete", version: release.version });
		} catch (error) {
			this.setStatus({ state: "error", message: errorMessage(error), release });
		}
	}

	private setStatus(status: PluginUpdateStatus): void {
		this.status = status;
		for (const listener of this.listeners) listener();
	}
}

export function parseLatestRelease(value: unknown): PluginRelease {
	if (!value || typeof value !== "object") throw new Error("GitHub вернул некорректные данные о релизе.");
	const release = value as Record<string, unknown>;
	const tag = release.tag_name;
	if (typeof tag !== "string" || !tag.startsWith("v") || release.draft !== false || release.prerelease !== false) {
		throw new Error("GitHub вернул некорректные данные о релизе.");
	}
	const version = tag.slice(1);
	compareVersions(version, version);
	if (version.includes("-")) throw new Error("GitHub вернул предварительный релиз вместо стабильного.");
	const assets = Array.isArray(release.assets) ? release.assets : [];
	const archiveNames = [`dnd-dm-tools-${version}.tar.gz`, `dnd-dm-tools-${version}.7z`];
	const asset = archiveNames.map((name) => assets.find((item): item is Record<string, unknown> =>
		!!item && typeof item === "object" && (item as Record<string, unknown>).name === name)).find(Boolean);
	const size = asset?.size;
	if (asset && (typeof size !== "number" || !Number.isInteger(size) || size <= 0 || size > MAX_ARCHIVE_BYTES)) {
		throw new Error("Архив обновления имеет некорректный размер.");
	}
	const digest = asset?.digest;
	if (digest !== undefined && digest !== null && (typeof digest !== "string" || !/^sha256:[a-f\d]{64}$/i.test(digest))) {
		throw new Error("Контрольная сумма архива имеет некорректный формат.");
	}
	return {
		version,
		url: `${RELEASE_DOWNLOAD_BASE}/${tag}`,
		pageUrl: `${RELEASE_PAGE_BASE}/${tag}`,
		archive: asset ? { name: asset.name as string, size: size as number, ...(typeof digest === "string" ? { digest } : {}) } : null,
	};
}

function errorMessage(error: unknown): string { return error instanceof Error ? error.message : String(error); }
