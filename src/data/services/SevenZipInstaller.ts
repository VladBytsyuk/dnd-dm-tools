import { createHash } from "crypto";
import { chmod, lstat, mkdir, mkdtemp, rename, rm, stat, writeFile } from "fs/promises";
import { join } from "path";
import { requestUrl } from "obsidian";
import { extract } from "tar";

const PACKAGE_VERSION = "5.2.0";
const PACKAGE_URL = `https://registry.npmjs.org/7zip-bin/-/7zip-bin-${PACKAGE_VERSION}.tgz`;
const PACKAGE_SHA512 = "ba44cf561a86e2337332ba36a80f4748249254937768deed95bfa17ea602b77111d325aba1e036551dfc30dace1cb43f7158fe0da20c69dd24142b565a8c21fc";
const MAX_PACKAGE_BYTES = 10 * 1024 * 1024;

type SevenZipPackageSource = {
	url: string;
	sha512: string;
	platform: NodeJS.Platform;
	arch: NodeJS.Architecture;
};

export async function ensureSevenZipExecutable(
	pluginDirectory: string,
	onDownload: () => void,
	source: SevenZipPackageSource = { url: PACKAGE_URL, sha512: PACKAGE_SHA512, platform: process.platform, arch: process.arch },
): Promise<string> {
	const platform = source.platform === "win32" ? "win" : source.platform === "darwin" ? "mac" : source.platform;
	const supportedArchitectures: Record<string, string[]> = {
		win: ["x64", "arm64", "ia32"],
		mac: ["x64", "arm64"],
		linux: ["x64", "arm64", "ia32", "arm"],
	};
	if (!supportedArchitectures[platform]?.includes(source.arch)) {
		throw new Error("Для этой платформы нет распаковщика 7z.");
	}
	const filename = platform === "win" ? "7za.exe" : "7za";
	const archiveEntry = `package/${platform}/${source.arch}/${filename}`;
	const cacheDirectory = join(pluginDirectory, "updater-tools");
	const executablePath = join(cacheDirectory, `7za-${PACKAGE_VERSION}-${platform}-${source.arch}${platform === "win" ? ".exe" : ""}`);
	const cached = await lstat(executablePath).catch((error: NodeJS.ErrnoException) => {
		if (error.code === "ENOENT") return null;
		throw error;
	});
	if (cached?.isFile() && cached.size > 0) return executablePath;
	await mkdir(cacheDirectory, { recursive: true });
	const stagingDirectory = await mkdtemp(join(cacheDirectory, ".installing-"));
	try {
		onDownload();
		const response = await requestUrl({ url: source.url, headers: { Accept: "application/octet-stream" } });
		if (response.status !== 200 || response.arrayBuffer.byteLength > MAX_PACKAGE_BYTES) {
			throw new Error("Не удалось скачать распаковщик 7z.");
		}
		const bytes = Buffer.from(response.arrayBuffer);
		if (createHash("sha512").update(bytes).digest("hex") !== source.sha512) {
			throw new Error("Контрольная сумма распаковщика 7z не совпадает.");
		}
		const packagePath = join(stagingDirectory, "7zip-bin.tgz");
		await writeFile(packagePath, bytes);
		const extractDirectory = join(stagingDirectory, "extract");
		await mkdir(extractDirectory);
		let found = false;
		await extract({
			file: packagePath,
			cwd: extractDirectory,
			gzip: true,
			strip: 3,
			strict: true,
			filter: (path, entry) => {
				if (path !== archiveEntry) return false;
				if (!("type" in entry) || (entry.type !== "File" && entry.type !== "OldFile")) {
					throw new Error("Архив распаковщика содержит недопустимый файл.");
				}
				found = true;
				return true;
			},
		});
		const stagedExecutable = join(extractDirectory, filename);
		if (!found || !(await stat(stagedExecutable)).isFile()) throw new Error("Архив распаковщика не содержит нужный файл.");
		if (platform !== "win") await chmod(stagedExecutable, 0o755);
		await rm(executablePath, { force: true });
		await rename(stagedExecutable, executablePath);
		return executablePath;
	} finally {
		await rm(stagingDirectory, { recursive: true, force: true }).catch(() => undefined);
	}
}
