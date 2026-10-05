import { afterEach, describe, expect, it, vi } from "vitest";
import * as obsidian from "obsidian";
import { PluginUpdateService, parseLatestRelease } from "src/data/services/PluginUpdateService";
import { compareVersions } from "src/domain/utils/compareVersions";

function release(version: string, archive: "tar.gz" | "7z" | null = "tar.gz") {
	return {
		tag_name: `v${version}`,
		draft: false,
		prerelease: false,
		assets: archive ? [{ name: `dnd-dm-tools-${version}.${archive}`, size: 1024, digest: `sha256:${"a".repeat(64)}` }] : [],
	};
}

afterEach(() => vi.restoreAllMocks());

describe("PluginUpdateService", () => {
	it("compares stable and prerelease versions", () => {
		expect(compareVersions("1.2.1", "1.2.0")).toBe(1);
		expect(compareVersions("1.2.0", "1.2.0")).toBe(0);
		expect(compareVersions("1.2.0-beta.1", "1.2.0")).toBe(-1);
		expect(compareVersions("1.2.0", "1.2.0-beta.1")).toBe(1);
	});

	it("shows current status when GitHub has the installed version", async () => {
		vi.spyOn(obsidian, "requestUrl").mockResolvedValue({ json: release("1.2.0") } as never);
		const updater = new PluginUpdateService("dnd-dm-tools", "1.2.0", null);
		await updater.check();
		expect(updater.getStatus()).toEqual({ state: "current" });
	});

	it("shows a newer release and its archive", async () => {
		vi.spyOn(obsidian, "requestUrl").mockResolvedValue({ json: release("1.2.1") } as never);
		const updater = new PluginUpdateService("dnd-dm-tools", "1.2.0", null);
		await updater.check();
		expect(updater.getStatus()).toMatchObject({ state: "available", release: { version: "1.2.1", archive: { name: "dnd-dm-tools-1.2.1.tar.gz" } } });
	});

	it("offers an older release published only as 7z for installation", async () => {
		vi.spyOn(obsidian, "requestUrl").mockResolvedValue({ json: release("1.2.0", "7z") } as never);
		const updater = new PluginUpdateService("dnd-dm-tools", "1.1.2", "/test/plugins/dnd-dm-tools");
		await updater.check();
		expect(updater.getStatus()).toMatchObject({ state: "available", release: { version: "1.2.0", archive: { name: "dnd-dm-tools-1.2.0.7z" } } });
	});

	it("keeps a release visible when its update archive is missing", async () => {
		vi.spyOn(obsidian, "requestUrl").mockResolvedValue({ json: release("1.2.1", null) } as never);
		const updater = new PluginUpdateService("dnd-dm-tools", "1.2.0", null);
		await updater.check();
		expect(updater.getStatus()).toMatchObject({ state: "available", release: { version: "1.2.1", archive: null } });
	});

	it("reports a network error and allows a retry", async () => {
		vi.spyOn(obsidian, "requestUrl")
			.mockRejectedValueOnce(new Error("Нет подключения"))
			.mockResolvedValueOnce({ json: release("1.2.0") } as never);
		const updater = new PluginUpdateService("dnd-dm-tools", "1.2.0", null);
		await updater.check();
		expect(updater.getStatus()).toEqual({ state: "error", message: "Нет подключения" });
		await updater.check();
		expect(updater.getStatus()).toEqual({ state: "current" });
	});

	it("rejects a prerelease response", () => {
		expect(() => parseLatestRelease({ ...release("1.3.0-beta.1"), prerelease: true })).toThrow();
	});
});
