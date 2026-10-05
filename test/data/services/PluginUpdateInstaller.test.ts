import { afterEach, describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { installPluginArchive } from "src/data/services/PluginUpdateInstaller";

const roots: string[] = [];
afterEach(async () => {
	for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true });
});

async function fixture(manifestId = "dnd-dm-tools", format: "tar.gz" | "7z" = "tar.gz", extraFile = false) {
	const root = await mkdtemp(join(tmpdir(), "plugin-update-test-"));
	roots.push(root);
	const installed = join(root, "plugins", "dnd-dm-tools");
	const packageRoot = join(root, "package");
	const packageDirectory = join(packageRoot, "dnd-dm-tools");
	await mkdir(join(installed, "owlbear-extension"), { recursive: true });
	await mkdir(join(packageDirectory, "owlbear-extension"), { recursive: true });
	await writeFile(join(installed, "main.js"), "old main");
	await writeFile(join(installed, "manifest.json"), JSON.stringify({ id: "dnd-dm-tools", version: "1.2.0" }));
	await writeFile(join(installed, "database.db"), "user database");
	await writeFile(join(installed, "data.json"), "user settings");
	await writeFile(join(installed, "owlbear-extension", "manifest.json"), "old extension");
	await writeFile(join(packageDirectory, "main.js"), "new main");
	await writeFile(join(packageDirectory, "manifest.json"), JSON.stringify({ id: manifestId, version: "1.2.1" }));
	await writeFile(join(packageDirectory, "styles.css"), "new styles");
	await writeFile(join(packageDirectory, "sql-wasm.wasm"), "new wasm");
	await writeFile(join(packageDirectory, "owlbear-extension", "manifest.json"), "new extension");
	if (extraFile) await writeFile(join(packageDirectory, "data.json"), "overwrite user settings");
	const archive = join(root, `release.${format}`);
	if (format === "7z") execFileSync("7z", ["a", "-t7z", "-mx=1", archive, "dnd-dm-tools"], { cwd: packageRoot });
	else execFileSync("tar", ["-czf", archive, "-C", packageRoot, "dnd-dm-tools"]);
	return { installed, archive };
}

describe("installPluginArchive", () => {
	it("updates package files while retaining user data", async () => {
		const { installed, archive } = await fixture();
		await installPluginArchive(archive, installed, "dnd-dm-tools", "1.2.1");
		expect(await readFile(join(installed, "main.js"), "utf8")).toBe("new main");
		expect(await readFile(join(installed, "styles.css"), "utf8")).toBe("new styles");
		expect(await readFile(join(installed, "owlbear-extension", "manifest.json"), "utf8")).toBe("new extension");
		expect(await readFile(join(installed, "database.db"), "utf8")).toBe("user database");
		expect(await readFile(join(installed, "data.json"), "utf8")).toBe("user settings");
	});

	it("installs the legacy 7z release without changing user data", async () => {
		const { installed, archive } = await fixture("dnd-dm-tools", "7z");
		await installPluginArchive(archive, installed, "dnd-dm-tools", "1.2.1");
		expect(await readFile(join(installed, "main.js"), "utf8")).toBe("new main");
		expect(await readFile(join(installed, "database.db"), "utf8")).toBe("user database");
	});

	it("uses an explicit 7z executable when it is absent from PATH", async () => {
		const { installed, archive } = await fixture("dnd-dm-tools", "7z");
		const executable = execFileSync("which", ["7z"], { encoding: "utf8" }).trim();
		const previousPath = process.env.PATH;
		try {
			process.env.PATH = "";
			await installPluginArchive(archive, installed, "dnd-dm-tools", "1.2.1", undefined, executable);
		} finally {
			process.env.PATH = previousPath;
		}
		expect(await readFile(join(installed, "main.js"), "utf8")).toBe("new main");
	});

	it("rejects a 7z archive containing a user data file", async () => {
		const { installed, archive } = await fixture("dnd-dm-tools", "7z", true);
		await expect(installPluginArchive(archive, installed, "dnd-dm-tools", "1.2.1")).rejects.toThrow("посторонние файлы");
		expect(await readFile(join(installed, "data.json"), "utf8")).toBe("user settings");
	});

	it("rejects a package with a mismatched manifest before changing files", async () => {
		const { installed, archive } = await fixture("other-plugin");
		await expect(installPluginArchive(archive, installed, "dnd-dm-tools", "1.2.1")).rejects.toThrow("не совпадает");
		expect(await readFile(join(installed, "main.js"), "utf8")).toBe("old main");
	});

	it("rolls back files already replaced when a later replacement fails", async () => {
		const { installed, archive } = await fixture();
		await expect(installPluginArchive(archive, installed, "dnd-dm-tools", "1.2.1", (path) => {
			if (path === "manifest.json") throw new Error("disk error");
		})).rejects.toThrow("disk error");
		expect(await readFile(join(installed, "main.js"), "utf8")).toBe("old main");
		expect(await readFile(join(installed, "manifest.json"), "utf8")).toContain("1.2.0");
		expect(await readFile(join(installed, "data.json"), "utf8")).toBe("user settings");
	});
});
