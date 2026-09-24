import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(packageRoot, "src", "lib");
const sourceExtensions = new Set([".js", ".mjs", ".svelte", ".ts"]);
const forbiddenPackages = new Set(["electron", "obsidian"]);
const importPattern = /(?:from\s*|import\s*(?:\(\s*)?)["']([^"']+)["']/g;

async function getSourceFiles(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = await Promise.all(entries.map(async (entry) => {
		const entryPath = path.join(directory, entry.name);
		if (entry.isDirectory()) return getSourceFiles(entryPath);
		return sourceExtensions.has(path.extname(entry.name)) ? [entryPath] : [];
	}));
	return files.flat();
}

function isForbiddenImport(specifier, importer) {
	if (forbiddenPackages.has(specifier) || specifier.startsWith("electron/") || specifier.startsWith("obsidian/")) return true;
	if (specifier === "src" || specifier.startsWith("src/") || specifier.startsWith("@/")) return true;
	if (!specifier.startsWith(".")) return false;

	const resolvedPath = path.resolve(path.dirname(importer), specifier);
	return resolvedPath !== sourceRoot && !resolvedPath.startsWith(`${sourceRoot}${path.sep}`);
}

const violations = [];
for (const filePath of await getSourceFiles(sourceRoot)) {
	const source = await readFile(filePath, "utf8");
	for (const match of source.matchAll(importPattern)) {
		if (isForbiddenImport(match[1], filePath)) {
			violations.push(`${path.relative(packageRoot, filePath)}: ${match[1]}`);
		}
	}
}

if (violations.length > 0) {
	console.error("Design-system boundary violations:\n" + violations.join("\n"));
	process.exitCode = 1;
}
