import { createHash } from "crypto";
import { createWriteStream } from "fs";
import { chmod, mkdir, mkdtemp, readFile, readdir, rename, rm, stat, writeFile } from "fs/promises";
import { get } from "https";
import type { ClientRequest, IncomingMessage } from "http";
import { basename, join } from "path";
import { extract } from "tar";

export const CLOUDFLARED_VERSION = "2026.5.2";
const MAX_DOWNLOAD_BYTES = 80 * 1024 * 1024;
const MAX_REDIRECTS = 5;

export type CloudflaredArtifact = {
	platform: NodeJS.Platform;
	arch: NodeJS.Architecture;
	filename: string;
	url: string;
	sha256: string;
	size: number;
	archive: "binary" | "tgz";
};

const RELEASE_BASE = `https://github.com/cloudflare/cloudflared/releases/download/${CLOUDFLARED_VERSION}`;
export const CLOUDFLARED_ARTIFACTS: readonly CloudflaredArtifact[] = [
	{ platform: "win32", arch: "x64", filename: "cloudflared-windows-amd64.exe", url: `${RELEASE_BASE}/cloudflared-windows-amd64.exe`, sha256: "20b9638f685333d623798e733effbad2487093f15ba592f6c7752360ff3b7ab7", size: 54_116_816, archive: "binary" },
	{ platform: "darwin", arch: "x64", filename: "cloudflared-darwin-amd64.tgz", url: `${RELEASE_BASE}/cloudflared-darwin-amd64.tgz`, sha256: "7240f709506bc2c1eb9da4d89cf2555499c60280ecb854b7d80e8f17d4b7903d", size: 20_819_466, archive: "tgz" },
	{ platform: "darwin", arch: "arm64", filename: "cloudflared-darwin-arm64.tgz", url: `${RELEASE_BASE}/cloudflared-darwin-arm64.tgz`, sha256: "ba94054c9fd4297645093d59d51442e5e546d07bb0516120e694a13d5b216d38", size: 18_939_602, archive: "tgz" },
	{ platform: "linux", arch: "x64", filename: "cloudflared-linux-amd64", url: `${RELEASE_BASE}/cloudflared-linux-amd64`, sha256: "5286698547f03df745adb2355f04c12dde52ef425491e81f433642d695521886", size: 39_203_902, archive: "binary" },
	{ platform: "linux", arch: "arm64", filename: "cloudflared-linux-arm64", url: `${RELEASE_BASE}/cloudflared-linux-arm64`, sha256: "5a4e8ce2701105271412059f44b6a0bf1ae4542b4d98ff3180c0c019443a5815", size: 36_835_266, archive: "binary" },
];

export type CloudflaredInstallStatus = {
	state: "checking" | "downloading" | "ready" | "error" | "unsupported";
	version: string;
	platform: string;
	arch: string;
	downloadedBytes?: number;
	totalBytes?: number;
	error?: string;
	binaryPath?: string;
};

type InstallManifest = {
	version: string;
	platform: NodeJS.Platform;
	arch: NodeJS.Architecture;
	artifactSha256: string;
	binarySha256: string;
};

export function selectCloudflaredArtifact(platform: NodeJS.Platform, arch: NodeJS.Architecture): CloudflaredArtifact | undefined {
	return CLOUDFLARED_ARTIFACTS.find((artifact) => artifact.platform === platform && artifact.arch === arch);
}

export class CloudflaredInstaller {
	private request: ClientRequest | null = null;
	private operation: Promise<string | null> | null = null;
	private disposed = false;
	private status: CloudflaredInstallStatus;

	constructor(
		private readonly directory: string,
		private readonly onStatus: (status: CloudflaredInstallStatus) => void,
		private readonly platform: NodeJS.Platform = process.platform,
		private readonly arch: NodeJS.Architecture = process.arch,
	) {
		this.status = { state: "checking", version: CLOUDFLARED_VERSION, platform, arch };
	}

	getStatus(): CloudflaredInstallStatus { return this.status; }

	ensureInstalled(force = false): Promise<string | null> {
		if (this.operation) {
			return this.disposed
				? this.operation.then(() => this.ensureInstalled(force))
				: this.operation;
		}
		this.disposed = false;
		this.operation = this.install(force).finally(() => { this.operation = null; });
		return this.operation;
	}

	dispose(): void {
		this.disposed = true;
		this.request?.destroy(new Error("Установка cloudflared отменена."));
		this.request = null;
	}

	private async install(force: boolean): Promise<string | null> {
		const artifact = selectCloudflaredArtifact(this.platform, this.arch);
		if (!artifact) {
			this.setStatus({ state: "unsupported", version: CLOUDFLARED_VERSION, platform: this.platform, arch: this.arch, error: "Эта платформа или архитектура не поддерживается." });
			return null;
		}
		const binaryPath = join(this.directory, this.platform === "win32" ? "cloudflared.exe" : "cloudflared");
		const manifestPath = join(this.directory, "install.json");
		this.setStatus({ state: "checking", version: CLOUDFLARED_VERSION, platform: this.platform, arch: this.arch });
		try {
			await mkdir(this.directory, { recursive: true });
			await this.cleanupInterruptedInstalls();
			if (!force && await this.isInstalled(binaryPath, manifestPath, artifact)) {
				this.setStatus({ state: "ready", version: CLOUDFLARED_VERSION, platform: this.platform, arch: this.arch, binaryPath });
				return binaryPath;
			}
			const stagingDirectory = await mkdtemp(join(this.directory, ".installing-"));
			try {
				const downloadPath = join(stagingDirectory, artifact.filename);
				const artifactHash = await this.download(artifact, downloadPath);
				if (artifactHash !== artifact.sha256) throw new Error("SHA-256 загруженного cloudflared не совпадает с официальным.");
				const stagedBinary = await this.prepareBinary(artifact, downloadPath, stagingDirectory);
				const binaryHash = await hashFile(stagedBinary);
				if (this.disposed) throw new Error("Установка cloudflared отменена.");
				if (this.platform !== "win32") await chmod(stagedBinary, 0o755);
				const stagedManifest = join(stagingDirectory, "install.json");
				const manifest: InstallManifest = { version: CLOUDFLARED_VERSION, platform: this.platform, arch: this.arch, artifactSha256: artifact.sha256, binarySha256: binaryHash };
				await writeFile(stagedManifest, JSON.stringify(manifest, null, 2), "utf8");
				await rm(binaryPath, { force: true });
				await rename(stagedBinary, binaryPath);
				await rm(manifestPath, { force: true });
				await rename(stagedManifest, manifestPath);
			} finally {
				await rm(stagingDirectory, { recursive: true, force: true });
			}
			this.setStatus({ state: "ready", version: CLOUDFLARED_VERSION, platform: this.platform, arch: this.arch, binaryPath });
			return binaryPath;
		} catch (error) {
			if (this.disposed) return null;
			this.setStatus({ state: "error", version: CLOUDFLARED_VERSION, platform: this.platform, arch: this.arch, error: formatError(error) });
			return null;
		}
	}

	private async isInstalled(binaryPath: string, manifestPath: string, artifact: CloudflaredArtifact): Promise<boolean> {
		return await verifyCloudflaredInstallation(binaryPath, manifestPath, artifact, this.platform, this.arch);
	}

	private async download(artifact: CloudflaredArtifact, targetPath: string): Promise<string> {
		this.setStatus({ state: "downloading", version: CLOUDFLARED_VERSION, platform: this.platform, arch: this.arch, downloadedBytes: 0, totalBytes: artifact.size });
		return new Promise<string>((resolve, reject) => {
			const open = (url: string, redirects: number) => {
				if (this.disposed) { reject(new Error("Установка cloudflared отменена.")); return; }
				this.request = get(url, { headers: { "User-Agent": "dnd-dm-tools-cloudflared-installer", Accept: "application/octet-stream" } }, (response) => {
					if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
						response.resume();
						if (redirects >= MAX_REDIRECTS) { reject(new Error("Слишком много перенаправлений при загрузке cloudflared.")); return; }
						open(new URL(response.headers.location, url).toString(), redirects + 1);
						return;
					}
					this.consumeDownload(response, artifact, targetPath).then(resolve, reject);
				});
				this.request.once("error", reject);
				this.request.setTimeout(30_000, () => this.request?.destroy(new Error("Загрузка cloudflared не отвечает более 30 секунд.")));
			};
			open(artifact.url, 0);
		}).finally(() => { this.request = null; });
	}

	private consumeDownload(response: IncomingMessage, artifact: CloudflaredArtifact, targetPath: string): Promise<string> {
		return new Promise((resolve, reject) => {
			if (response.statusCode !== 200) { response.resume(); reject(new Error(`Загрузка cloudflared завершилась с HTTP ${response.statusCode ?? "?"}.`)); return; }
			const declaredSize = Number(response.headers["content-length"] ?? artifact.size);
			if (!Number.isFinite(declaredSize) || declaredSize > MAX_DOWNLOAD_BYTES) { response.resume(); reject(new Error("Файл cloudflared превышает допустимый размер.")); return; }
			const output = createWriteStream(targetPath, { flags: "wx" });
			const hash = createHash("sha256");
			let downloaded = 0;
			let lastReport = 0;
			const fail = (error: Error) => { response.destroy(); output.destroy(); reject(error); };
			response.on("data", (chunk: Buffer) => {
				downloaded += chunk.length;
				if (downloaded > MAX_DOWNLOAD_BYTES) { fail(new Error("Файл cloudflared превышает допустимый размер.")); return; }
				hash.update(chunk);
				const now = Date.now();
				if (now - lastReport >= 250) {
					lastReport = now;
					this.setStatus({ state: "downloading", version: CLOUDFLARED_VERSION, platform: this.platform, arch: this.arch, downloadedBytes: downloaded, totalBytes: declaredSize });
				}
			});
			response.once("error", fail);
			output.once("error", fail);
			output.once("finish", () => {
				if (downloaded !== artifact.size) { reject(new Error(`Получено ${downloaded} байт вместо ожидаемых ${artifact.size}.`)); return; }
				resolve(hash.digest("hex"));
			});
			response.pipe(output);
		});
	}

	private async prepareBinary(artifact: CloudflaredArtifact, downloadPath: string, stagingDirectory: string): Promise<string> {
		if (artifact.archive === "binary") return downloadPath;
		const extractDirectory = join(stagingDirectory, "extract");
		await mkdir(extractDirectory);
		let extractedExpectedFile = false;
		await extract({
			cwd: extractDirectory,
			file: downloadPath,
			gzip: true,
			strict: true,
			filter: (path, entry) => {
				const allowed = path === "cloudflared" && basename(path) === path && "type" in entry && entry.type === "File";
				if (allowed) extractedExpectedFile = true;
				return allowed;
			},
		});
		if (!extractedExpectedFile) throw new Error("Архив cloudflared не содержит ожидаемый бинарный файл.");
		return join(extractDirectory, "cloudflared");
	}

	private async cleanupInterruptedInstalls(): Promise<void> {
		const entries = await readdir(this.directory, { withFileTypes: true });
		await Promise.all(entries
			.filter((entry) => entry.isDirectory() && entry.name.startsWith(".installing-"))
			.map((entry) => rm(join(this.directory, entry.name), { recursive: true, force: true })));
	}

	private setStatus(status: CloudflaredInstallStatus): void {
		this.status = status;
		this.onStatus(status);
	}
}

async function hashFile(path: string): Promise<string> {
	const bytes = await readFile(path);
	return createHash("sha256").update(bytes).digest("hex");
}

export async function verifyCloudflaredInstallation(
	binaryPath: string,
	manifestPath: string,
	artifact: CloudflaredArtifact,
	platform: NodeJS.Platform,
	arch: NodeJS.Architecture,
): Promise<boolean> {
	try {
		const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as InstallManifest;
		if (manifest.version !== CLOUDFLARED_VERSION || manifest.platform !== platform || manifest.arch !== arch || manifest.artifactSha256 !== artifact.sha256) return false;
		if (!(await stat(binaryPath)).isFile()) return false;
		return await hashFile(binaryPath) === manifest.binarySha256;
	} catch { return false; }
}

function formatError(error: unknown): string { return error instanceof Error ? error.message : String(error); }
