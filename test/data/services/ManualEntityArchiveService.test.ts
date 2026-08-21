import { describe, expect, it, vi } from "vitest";
import { ManualEntityArchiveService } from "src/data/services/ManualEntityArchiveService";

const item = { name: { rus: "Кобольд", eng: "Kobold" }, url: "/bestiary/kobold-custom" };

function createService(origin = new Map<string, "remote" | "manual">()) {
	const origins = {
		listManual: vi.fn(async () => [...origin.entries()].filter(([, value]) => value === "manual").map(([url]) => ({ kind: "bestiary" as const, url }))),
		exists: vi.fn(async (_kind: string, url: string) => origin.has(url)),
		get: vi.fn(async (_kind: string, url: string) => origin.get(url) ?? "remote"),
	};
	const repository = {
		getFullItemByUrl: vi.fn(async () => item),
		putItem: vi.fn(async () => ({ ok: true })),
	};
	return { service: new ManualEntityArchiveService(origins as any, { bestiary: repository as any }, "1.1.2"), origins, repository };
}

describe("ManualEntityArchiveService", () => {
	it("exports only manual entities", async () => {
		const { service } = createService(new Map([[item.url, "manual"]]));

		const archive = await service.exportArchive();

		expect(archive.schemaVersion).toBe(1);
		expect(archive.entities).toEqual([{ kind: "bestiary", url: item.url, item }]);
	});

	it("updates a matching manual entity and skips a remote collision", async () => {
		const { service, repository } = createService(new Map([[item.url, "manual"], ["/bestiary/remote", "remote"]]));
		const report = await service.importArchive({
			schemaVersion: 1,
			exportedAt: "2026-08-21T00:00:00.000Z",
			pluginVersion: "1.1.2",
			entities: [
				{ kind: "bestiary", url: item.url, item },
				{ kind: "bestiary", url: "/bestiary/remote", item: { ...item, url: "/bestiary/remote" } },
			],
		});

		expect(report).toEqual({ created: 0, updated: 1, skipped: 1, failed: 0 });
		expect(repository.putItem).toHaveBeenCalledWith(expect.objectContaining({ origin: "manual" }), {
			originalUrl: item.url,
			originalOrigin: "manual",
		});
	});

	it("rejects an unsupported archive version", async () => {
		const { service } = createService();
		await expect(service.importArchive({ schemaVersion: 2, entities: [] })).rejects.toThrow("Неподдерживаемая версия");
	});
});
