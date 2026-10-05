import { execFile } from "child_process";
import { copyFile, lstat, mkdir, mkdtemp, readFile, readdir, rename, rm, stat } from "fs/promises";
import { dirname, join } from "path";
import { extract } from "tar";
import { promisify } from "util";

const REQUIRED_FILES = ["main.js", "manifest.json", "sql-wasm.wasm", "styles.css", "owlbear-extension/manifest.json"];
const ROOT_FILES = new Set(REQUIRED_FILES.slice(0, 4));
const MAX_EXTRACTED_BYTES = 250 * 1024 * 1024;
const execFileAsync = promisify(execFile);

export async function installPluginArchive(
	archivePath: string,
	pluginDirectory: string,
	pluginId: string,
	version: string,
	beforeReplace?: (relativePath: string) => void | Promise<void>,
	sevenZipExecutable?: string,
): Promise<void> {
	if (!(await stat(pluginDirectory)).isDirectory()) throw new Error("Каталог плагина не найден.");
	const stagingDirectory = await mkdtemp(join(dirname(pluginDirectory), ".dnd-dm-tools-update-"));
	const extractedDirectory = join(stagingDirectory, "extracted");
	const backupDirectory = join(stagingDirectory, "backup");
	let preserveStaging = false;
	try {
		await mkdir(extractedDirectory);
		const files = new Set<string>();
		const packageDirectory = archivePath.endsWith(".7z")
			? await extractSevenZip(archivePath, extractedDirectory, files, sevenZipExecutable)
			: await extractTarGzip(archivePath, extractedDirectory, files);
		for (const required of REQUIRED_FILES) {
			if (!files.has(required) || !(await stat(join(packageDirectory, required))).isFile()) {
				throw new Error(`В архиве обновления отсутствует ${required}.`);
			}
		}
		const manifest = JSON.parse(await readFile(join(packageDirectory, "manifest.json"), "utf8")) as Record<string, unknown>;
		if (manifest.id !== pluginId || manifest.version !== version) {
			throw new Error("ID или версия плагина в архиве не совпадает с релизом.");
		}
		const orderedFiles = [...files].sort();
		const hadOriginal = new Set<string>();
		for (const relativePath of orderedFiles) {
			const destination = join(pluginDirectory, relativePath);
			await ensureSafeParent(pluginDirectory, relativePath);
			const existing = await lstat(destination).catch((error: NodeJS.ErrnoException) => {
				if (error.code === "ENOENT") return null;
				throw error;
			});
			if (existing && !existing.isFile()) throw new Error(`Нельзя заменить ${relativePath}: это не обычный файл.`);
			if (existing) {
				const backupPath = join(backupDirectory, relativePath);
				await mkdir(dirname(backupPath), { recursive: true });
				await copyFile(destination, backupPath);
				hadOriginal.add(relativePath);
			}
		}
		const touched: string[] = [];
		try {
			for (const relativePath of orderedFiles) {
				await beforeReplace?.(relativePath);
				const destination = join(pluginDirectory, relativePath);
				touched.push(relativePath);
				await rm(destination, { force: true });
				await rename(join(packageDirectory, relativePath), destination);
			}
		} catch (error) {
			const rollbackErrors: string[] = [];
			for (const relativePath of touched.reverse()) {
				const destination = join(pluginDirectory, relativePath);
				try {
					await rm(destination, { force: true });
					if (hadOriginal.has(relativePath)) await copyFile(join(backupDirectory, relativePath), destination);
				} catch (rollbackError) {
					rollbackErrors.push(`${relativePath}: ${errorMessage(rollbackError)}`);
				}
			}
			if (rollbackErrors.length) {
				preserveStaging = true;
				throw new Error(`Не удалось завершить обновление и откатить изменения: ${rollbackErrors.join("; ")}. Резервная копия: ${backupDirectory}`);
			}
			throw error;
		}
	} finally {
		if (!preserveStaging) await rm(stagingDirectory, { recursive: true, force: true });
	}
}

async function extractTarGzip(archivePath: string, directory: string, files: Set<string>): Promise<string> {
	let expandedBytes = 0;
	await extract({
		file: archivePath,
		cwd: directory,
		gzip: true,
		strip: 1,
		strict: true,
		filter: (path, entry) => {
			const type = "type" in entry ? entry.type : "";
			const relativePath = validateArchivePath(path, type);
			if (type === "File" || type === "OldFile") {
				if (files.has(relativePath)) throw new Error("В архиве обновления есть повторяющиеся файлы.");
				files.add(relativePath);
				expandedBytes += entry.size;
				if (expandedBytes > MAX_EXTRACTED_BYTES) throw new Error("Распакованный архив обновления слишком велик.");
			}
			return true;
		},
	});
	return directory;
}

async function extractSevenZip(archivePath: string, directory: string, files: Set<string>, executable?: string): Promise<string> {
	const listing = await runSevenZip(["l", "-slt", "-sccUTF-8", archivePath], executable);
	const entries = listing.split(/\r?\n----------\r?\n/)[1];
	if (!entries) throw new Error("Не удалось прочитать содержимое архива обновления.");
	let expandedBytes = 0;
	for (const block of entries.split(/\r?\n\r?\n/)) {
		const path = /^Path = (.+)$/m.exec(block)?.[1]?.trimEnd();
		if (!path) continue;
		const attributes = /^Attributes = (.+)$/m.exec(block)?.[1] ?? "";
		const isDirectory = attributes.startsWith("D") || /^Folder = \+$/m.test(block);
		const relativePath = validateArchivePath(path.replace(/\\/g, "/"), isDirectory ? "Directory" : "File");
		if (isDirectory) continue;
		if (files.has(relativePath)) throw new Error("В архиве обновления есть повторяющиеся файлы.");
		files.add(relativePath);
		const size = Number(/^Size = (\d+)$/m.exec(block)?.[1]);
		if (!Number.isSafeInteger(size)) throw new Error("Архив обновления содержит файл с некорректным размером.");
		expandedBytes += size;
		if (expandedBytes > MAX_EXTRACTED_BYTES) throw new Error("Распакованный архив обновления слишком велик.");
	}
	await runSevenZip(["x", "-y", "-bd", "-bb0", `-o${directory}`, archivePath], executable);
	const packageDirectory = join(directory, "dnd-dm-tools");
	await verifyExtractedFiles(directory, packageDirectory, files);
	return packageDirectory;
}

async function runSevenZip(args: string[], binary?: string): Promise<string> {
	for (const executable of binary ? [binary] : ["7z", "7zz", "7za"]) {
		try {
			const { stdout } = await execFileAsync(executable, args, { maxBuffer: 4 * 1024 * 1024, windowsHide: true });
			return stdout;
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === "ENOENT") continue;
			throw new Error(`Не удалось распаковать архив 7z: ${errorMessage(error)}`);
		}
	}
	throw new Error("Для установки этого релиза требуется команда 7z, 7zz или 7za.");
}

async function verifyExtractedFiles(directory: string, packageDirectory: string, expectedFiles: Set<string>): Promise<void> {
	const rootEntries = await readdir(directory);
	if (rootEntries.length !== 1 || rootEntries[0] !== "dnd-dm-tools") throw new Error("Архив обновления содержит посторонние файлы.");
	if (!(await lstat(packageDirectory)).isDirectory()) throw new Error("Архив обновления содержит недопустимый каталог плагина.");
	const actualFiles = new Set<string>();
	const visit = async (relativeDirectory: string): Promise<void> => {
		for (const name of await readdir(join(packageDirectory, relativeDirectory))) {
			const relativePath = relativeDirectory ? `${relativeDirectory}/${name}` : name;
			const entry = await lstat(join(packageDirectory, relativePath));
			validateArchivePath(`dnd-dm-tools/${relativePath}`, entry.isDirectory() ? "Directory" : entry.isFile() ? "File" : "Other");
			if (entry.isDirectory()) await visit(relativePath);
			else actualFiles.add(relativePath);
		}
	};
	await visit("");
	if (actualFiles.size !== expectedFiles.size || [...expectedFiles].some((file) => !actualFiles.has(file))) {
		throw new Error("Содержимое архива обновления не совпадает со списком файлов.");
	}
}

function validateArchivePath(path: string, type: string): string {
	if (path.startsWith("/") || path.includes("\\") || path.includes("\0")) throw new Error("Архив обновления содержит недопустимый путь.");
	const parts = path.replace(/\/$/, "").split("/");
	if (parts.some((part) => !part || part === "." || part === "..") || parts[0] !== "dnd-dm-tools") {
		throw new Error("Архив обновления содержит недопустимый путь.");
	}
	const relativePath = parts.slice(1).join("/");
	const isDirectory = type === "Directory";
	const isFile = type === "File" || type === "OldFile";
	if (!isDirectory && !isFile) throw new Error("Архив обновления содержит недопустимый тип файла.");
	if (isDirectory && (relativePath === "" || relativePath === "owlbear-extension" || relativePath.startsWith("owlbear-extension/"))) return relativePath;
	if (isFile && (ROOT_FILES.has(relativePath) || relativePath.startsWith("owlbear-extension/"))) return relativePath;
	throw new Error("Архив обновления содержит посторонние файлы.");
}

async function ensureSafeParent(pluginDirectory: string, relativePath: string): Promise<void> {
	const parts = relativePath.split("/").slice(0, -1);
	let current = pluginDirectory;
	for (const part of parts) {
		current = join(current, part);
		const existing = await lstat(current).catch((error: NodeJS.ErrnoException) => {
			if (error.code === "ENOENT") return null;
			throw error;
		});
		if (existing && !existing.isDirectory()) throw new Error(`Каталог ${current} недоступен для обновления.`);
		if (!existing) await mkdir(current);
	}
}

function errorMessage(error: unknown): string { return error instanceof Error ? error.message : String(error); }
