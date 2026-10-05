import { createHash } from "crypto";
import { createWriteStream } from "fs";
import { mkdtemp, rm } from "fs/promises";
import { get } from "https";
import type { IncomingMessage } from "http";
import { tmpdir } from "os";
import { join } from "path";
import { pipeline } from "stream/promises";
import type { PluginRelease } from "./PluginUpdateService";
import { installPluginArchive } from "./PluginUpdateInstaller";
import { ensureSevenZipExecutable } from "./SevenZipInstaller";

const MAX_ARCHIVE_BYTES = 150 * 1024 * 1024;

export async function downloadAndInstallPluginRelease(
	release: PluginRelease,
	pluginDirectory: string,
	pluginId: string,
	onProgress: (downloadedBytes: number) => void,
	onInstall: () => void,
	onToolDownload: () => void,
): Promise<void> {
	const archive = release.archive!;
	const downloadDirectory = await mkdtemp(join(tmpdir(), "dnd-dm-tools-update-"));
	try {
		const archivePath = join(downloadDirectory, archive.name);
		await downloadArchive(release, archivePath, onProgress);
		const sevenZipExecutable = archive.name.endsWith(".7z")
			? await ensureSevenZipExecutable(pluginDirectory, onToolDownload)
			: undefined;
		onInstall();
		await installPluginArchive(archivePath, pluginDirectory, pluginId, release.version, undefined, sevenZipExecutable);
	} finally {
		await rm(downloadDirectory, { recursive: true, force: true }).catch(() => undefined);
	}
}

async function downloadArchive(release: PluginRelease, targetPath: string, onProgress: (bytes: number) => void): Promise<void> {
	const archive = release.archive!;
	const response = await openDownload(`${release.url}/${archive.name}`, 0);
	const declaredSize = Number(response.headers["content-length"] ?? archive.size);
	if (!Number.isFinite(declaredSize) || declaredSize > MAX_ARCHIVE_BYTES || declaredSize !== archive.size) {
		response.destroy();
		throw new Error("Размер загружаемого архива не совпадает с данными GitHub.");
	}
	const hash = createHash("sha256");
	let downloaded = 0;
	let lastReport = 0;
	response.on("data", (chunk: Buffer) => {
		downloaded += chunk.length;
		if (downloaded > MAX_ARCHIVE_BYTES || downloaded > archive.size) {
			response.destroy(new Error("Архив обновления превышает ожидаемый размер."));
			return;
		}
		hash.update(chunk);
		const now = Date.now();
		if (now - lastReport >= 150) { lastReport = now; onProgress(downloaded); }
	});
	await pipeline(response, createWriteStream(targetPath, { flags: "wx" }));
	if (downloaded !== archive.size) throw new Error("Архив обновления загружен не полностью.");
	if (archive.digest && hash.digest("hex") !== archive.digest.slice(7).toLowerCase()) {
		throw new Error("Контрольная сумма архива обновления не совпадает.");
	}
	onProgress(downloaded);
}

function openDownload(url: string, redirects: number): Promise<IncomingMessage> {
	return new Promise((resolve, reject) => {
		if (!url.startsWith("https://")) { reject(new Error("Небезопасный адрес загрузки обновления.")); return; }
		const request = get(url, { headers: { "User-Agent": "dnd-dm-tools-updater", Accept: "application/octet-stream" } }, (response) => {
			if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
				response.resume();
				if (redirects >= 5) { reject(new Error("Слишком много перенаправлений при загрузке обновления.")); return; }
				resolve(openDownload(new URL(response.headers.location, url).toString(), redirects + 1));
				return;
			}
			if (response.statusCode !== 200) {
				response.resume();
				reject(new Error(`Не удалось скачать обновление: HTTP ${response.statusCode ?? "?"}.`));
				return;
			}
			resolve(response);
		});
		request.once("error", reject);
		request.setTimeout(30_000, () => request.destroy(new Error("Загрузка обновления не отвечает более 30 секунд.")));
	});
}
