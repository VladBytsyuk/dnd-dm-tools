import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { OwlbearImageAssetStore, createFallbackSvg } from "src/data/owlbear/OwlbearImageAssetStore";

const temporaryDirectories: string[] = [];

afterEach(async () => {
	await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

async function createStore(maxBytes = 250 * 1024 * 1024): Promise<OwlbearImageAssetStore> {
	const directory = await mkdtemp(join(tmpdir(), "dnd-dm-tools-owlbear-"));
	temporaryDirectories.push(directory);
	return new OwlbearImageAssetStore(directory, maxBytes);
}

describe("Owlbear image asset store", () => {
	it("deduplicates content and reads assets after reinitialization", async () => {
		const directory = await mkdtemp(join(tmpdir(), "dnd-dm-tools-owlbear-"));
		temporaryDirectories.push(directory);
		const store = new OwlbearImageAssetStore(directory);
		const bytes = Buffer.from("same image");
		const first = await store.put("image/png", bytes);
		const second = await store.put("image/png", bytes);

		expect(second).toBe(first);
		const reinitializedStore = new OwlbearImageAssetStore(directory);
		expect(await reinitializedStore.get(first)).toEqual(bytes);
	});

	it("creates a safe initials fallback token", () => {
		const fallback = createFallbackSvg("Лесной Разбойник", "#123456", "enemy");
		const svg = fallback.bytes.toString("utf8");

		expect(fallback.mime).toBe("image/svg+xml");
		expect(svg).toContain("ЛР");
		expect(svg).toContain("#123456");
		expect(svg).toContain('width="512" height="512"');
	});

	it("evicts least recently used assets while keeping protected assets", async () => {
		const store = await createStore(10);
		const protectedAsset = await store.put("image/png", Buffer.from("123456"));
		const evictedAsset = await store.put("image/png", Buffer.from("abcdef"), [protectedAsset]);
		await store.put("image/png", Buffer.from("uvwxyz"), [protectedAsset]);

		expect(await store.get(protectedAsset)).not.toBeNull();
		expect(await store.get(evictedAsset)).toBeNull();
		const files = await readdir((store as unknown as { directory: string }).directory);
		expect(files).toHaveLength(2);
	});
});
