import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as obsidian from "obsidian";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ensureSevenZipExecutable } from "src/data/services/SevenZipInstaller";

const roots: string[] = [];
afterEach(async () => {
	vi.restoreAllMocks();
	for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true });
});

async function packageFixture() {
	const root = await mkdtemp(join(tmpdir(), "sevenzip-package-test-"));
	roots.push(root);
	const packageRoot = join(root, "source");
	const binaryDirectory = join(packageRoot, "package", "linux", "x64");
	await mkdir(binaryDirectory, { recursive: true });
	await writeFile(join(binaryDirectory, "7za"), "#!/bin/sh\necho test-7za\n");
	const archive = join(root, "7zip-bin.tgz");
	execFileSync("tar", ["-czf", archive, "-C", packageRoot, "package"]);
	const bytes = await readFile(archive);
	return {
		root,
		bytes,
		source: {
			url: "https://example.test/7zip-bin.tgz",
			sha512: createHash("sha512").update(bytes).digest("hex"),
			platform: "linux" as const,
			arch: "x64" as const,
		},
	};
}

describe("ensureSevenZipExecutable", () => {
	it("downloads a verified executable and reuses the cached copy", async () => {
		const fixture = await packageFixture();
		const request = vi.spyOn(obsidian, "requestUrl").mockResolvedValue({ status: 200, arrayBuffer: fixture.bytes.buffer.slice(fixture.bytes.byteOffset, fixture.bytes.byteOffset + fixture.bytes.byteLength) } as never);
		const onDownload = vi.fn();
		const pluginDirectory = join(fixture.root, "plugin");
		await mkdir(pluginDirectory);
		const executable = await ensureSevenZipExecutable(pluginDirectory, onDownload, fixture.source);
		expect(await readFile(executable, "utf8")).toContain("test-7za");
		expect((await stat(executable)).mode & 0o111).not.toBe(0);
		expect(await ensureSevenZipExecutable(pluginDirectory, onDownload, fixture.source)).toBe(executable);
		expect(request).toHaveBeenCalledTimes(1);
		expect(onDownload).toHaveBeenCalledTimes(1);
	});

	it("rejects a download with the wrong checksum", async () => {
		const fixture = await packageFixture();
		vi.spyOn(obsidian, "requestUrl").mockResolvedValue({ status: 200, arrayBuffer: fixture.bytes.buffer.slice(fixture.bytes.byteOffset, fixture.bytes.byteOffset + fixture.bytes.byteLength) } as never);
		const pluginDirectory = join(fixture.root, "plugin");
		await mkdir(pluginDirectory);
		await expect(ensureSevenZipExecutable(pluginDirectory, () => undefined, { ...fixture.source, sha512: "0".repeat(128) })).rejects.toThrow("Контрольная сумма");
	});
});
