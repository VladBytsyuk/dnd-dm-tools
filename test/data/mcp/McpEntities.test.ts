import { describe, expect, it, vi } from "vitest";
import { McpEntities, type McpRepository } from "src/data/mcp/McpEntities";
import { MCP_ENTITY_KINDS, MCP_REFERENCE_KINDS, mcpEntitySchemas, mcpEntityTemplates, type McpEntityKind, type McpReferenceKind } from "src/data/mcp/McpEntitySchemas";
import { createDefaultMediaState, createMediaTrack } from "src/domain/models/media/MediaState";
import type { BaseItem } from "src/domain/models/common/BaseItem";

function harness() {
	let state = createDefaultMediaState();
	const vaultFiles: string[] = [];
	const records = new Map<string, BaseItem>();
	const repositories = Object.fromEntries(MCP_REFERENCE_KINDS.map((kind) => [kind, {
		getAllSmallItems: vi.fn(async () => [...records.entries()].filter(([key]) => key.startsWith(`${kind}:`)).map(([, value]) => structuredClone(value))),
		getFullItemByUrl: vi.fn(async (url: string) => structuredClone(records.get(`${kind}:${url}`) ?? null)),
		putItem: vi.fn(async (item: BaseItem, context?: { beforeWrite?: () => Promise<void> }) => { await context?.beforeWrite?.(); records.set(`${kind}:${item.url}`, structuredClone(item)); return { ok: true as const }; }),
		getParentUrl: vi.fn(async () => "/manual/parent"),
	}])) as Record<McpReferenceKind, McpRepository>;
	const onEntitySaved = vi.fn();
	const gateway = new McpEntities({ repositories, getMediaState: () => state, getVaultAudioPaths: () => vaultFiles,
		updateMedia: async (mutator) => { const next = structuredClone(state); mutator(next); state = next; }, onEntitySaved });
	return { gateway, repositories, records, onEntitySaved, vaultFiles, get state() { return state; } };
}
const template = (kind: McpEntityKind) => structuredClone(mcpEntityTemplates[kind]) as Record<string, unknown> & { url: string };

describe("MCP entity schemas", () => {
	it.each(MCP_ENTITY_KINDS)("provides a validated template and JSON schema for %s", (kind) => {
		const { gateway } = harness();
		expect(mcpEntitySchemas[kind].safeParse(template(kind)).success).toBe(true);
		expect(gateway.getEntitySchema(kind).schema).toMatchObject({ type: "object", additionalProperties: false });
	});
	it("rejects unknown fields, wrong model values, unsafe entity URLs and filesystem traversal", () => {
		expect(mcpEntitySchemas.feats.safeParse({ ...template("feats"), sql: "delete from full_feats" }).success).toBe(false);
		expect(mcpEntitySchemas.spellbook.safeParse({ ...template("spellbook"), level: "two" }).success).toBe(false);
		expect(mcpEntitySchemas.spellbook.safeParse({ ...template("spellbook"), source: { shortName: "", name: "", group: { name: "", shortName: "" } } }).success).toBe(false);
		for (const kind of MCP_ENTITY_KINDS) for (const url of ["https://evil.example/entity", "/unknown/id", "//evil.example/entity"]) expect(mcpEntitySchemas[kind].safeParse({ ...template(kind), url }).success).toBe(false);
		expect(mcpEntitySchemas.equipment.safeParse({ ...template("equipment"), url: "/items/magic/misdirected" }).success).toBe(false);
		for (const notePath of ["../secret", "/absolute.md", "C:\\note.md", "folder/../secret.md"]) expect(mcpEntitySchemas.scene.safeParse({ ...template("scene"), notePath }).success).toBe(false);
	});
});

describe("McpEntities", () => {
	it.each(MCP_ENTITY_KINDS)("creates and reads one %s", async (kind) => {
		const { gateway, onEntitySaved } = harness();
		const operation = await gateway.prepareCreate(kind, template(kind));
		const saved = await gateway.commit(operation);
		expect((await gateway.getEntity(kind, saved.url)).revision).toBe(saved.revision);
		expect(onEntitySaved).toHaveBeenCalledWith(kind, saved.url);
		expect((await gateway.searchEntities("", [kind])).items).toHaveLength(1);
	});
	it("does not load full entities during search and denies unknown remote addresses", async () => {
		const { gateway, records, repositories } = harness();
		records.set("feats:/feats/known", { ...template("feats"), url: "/feats/known" } as unknown as BaseItem);
		expect((await gateway.searchEntities("KNOWN", ["feats"])).items).toHaveLength(1);
		expect(repositories.feats.getFullItemByUrl).not.toHaveBeenCalled();
		await expect(gateway.getEntity("feats", "https://attacker.example/secret")).rejects.toThrow("локальном");
		expect(repositories.feats.getFullItemByUrl).not.toHaveBeenCalled();
		await gateway.getEntity("feats", "/feats/known");
		expect(repositories.feats.getFullItemByUrl).toHaveBeenCalledWith("/feats/known");
	});
	it("reports failed full-card loads", async () => {
		const { gateway, records, repositories } = harness();
		records.set("feats:/feats/known", { ...template("feats"), url: "/feats/known" } as unknown as BaseItem);
		vi.mocked(repositories.feats.getFullItemByUrl).mockResolvedValue(null);
		await expect(gateway.getEntity("feats", "/feats/known")).rejects.toThrow("полную");
	});
	it("applies defaults and validates pagination", async () => {
		const { gateway, records } = harness();
		for (let index = 0; index < 25; index++) records.set(`feats:/f/${index}`, { ...template("feats"), url: `/f/${index}` } as unknown as BaseItem);
		expect(await gateway.searchEntities()).toMatchObject({ total: 25, offset: 0, limit: 20, hasMore: true });
		expect((await gateway.searchEntities("", ["feats"], 20)).items).toHaveLength(5);
		await expect(gateway.searchEntities("", undefined, 0, 101)).rejects.toThrow("страницы");
	});
	it("copies remote cards while keeping origin and save context server controlled", async () => {
		const { gateway, records, repositories } = harness();
		const original = { ...template("feats"), url: "/feats/remote" };
		records.set("feats:/feats/remote", original as unknown as BaseItem);
		const read = await gateway.getEntity("feats", original.url);
		const operation = await gateway.prepareUpdate("feats", original.url, { ...original, origin: "manual", description: "changed" }, read.revision);
		expect(operation.url).not.toBe(original.url);
		await expect(gateway.commit(operation)).resolves.toMatchObject({ copied: true });
		expect(repositories.feats.putItem).toHaveBeenCalledWith(expect.objectContaining({ origin: "manual" }), expect.objectContaining({ originalUrl: original.url, originalOrigin: "remote", beforeWrite: expect.any(Function) }));
		expect(records.get("feats:/feats/remote")).toEqual(original);
	});
	it("requires fresh reads, rejects conflicts and consumes confirmed operations once", async () => {
		const { gateway, records } = harness();
		await gateway.commit(await gateway.prepareCreate("feats", template("feats")));
		const read = await gateway.getEntity("feats", "/feats/manual-new-id");
		await expect(gateway.prepareUpdate("feats", read.url, read.data, "stale")).rejects.toThrow("заново");
		const operation = await gateway.prepareUpdate("feats", read.url, { ...read.data, description: "new" }, read.revision);
		expect(Object.isFrozen(operation.data)).toBe(true);
		records.set("feats:/feats/manual-new-id", { ...read.data, description: "intervening" } as unknown as BaseItem);
		await expect(gateway.commit(operation)).rejects.toThrow("изменилась");
		await expect(gateway.commit(operation)).rejects.toThrow("использована");
		await expect(gateway.commit({ ...operation })).rejects.toThrow("недействительна");
	});
	it("does not overwrite existing URLs or mutate manual URLs", async () => {
		const { gateway } = harness();
		await gateway.commit(await gateway.prepareCreate("feats", template("feats")));
		await expect(gateway.prepareCreate("feats", template("feats"))).rejects.toThrow("занят");
		const read = await gateway.getEntity("feats", "/feats/manual-new-id");
		await expect(gateway.prepareUpdate("feats", read.url, { ...read.data, url: "/feats/changed" }, read.revision)).rejects.toThrow("неизменяемый");
	});
	it("preserves existing legacy manual URLs on update while rejecting new arbitrary URLs", async () => {
		const { gateway, records } = harness();
		const child = { ...template("races"), url: "/legacy/child", origin: "manual" };
		const root = { ...template("races"), url: "/legacy/root", origin: "manual", subraces: [child] };
		records.set("races:/legacy/root", root as unknown as BaseItem); records.set("races:/legacy/child", child as unknown as BaseItem);
		const read = await gateway.getEntity("races", root.url);
		const operation = await gateway.prepareUpdate("races", root.url, { ...read.data, description: "changed" }, read.revision);
		expect(operation.data.url).toBe(root.url); expect((operation.data.subraces as { url: string }[])[0].url).toBe(child.url);
		await gateway.commit(operation);
		const updated = await gateway.getEntity("races", root.url);
		await expect(gateway.prepareUpdate("races", root.url, { ...updated.data, subraces: [child, { ...child, url: "/new-arbitrary/child" }] }, updated.revision)).rejects.toThrow();
		await expect(gateway.prepareCreate("races", root)).rejects.toThrow();
	});
	it("serializes competing creates and emits only one successful write", async () => {
		const { gateway, onEntitySaved } = harness();
		const first = await gateway.prepareCreate("feats", template("feats")), second = await gateway.prepareCreate("feats", template("feats"));
		const results = await Promise.allSettled([gateway.commit(first), gateway.commit(second)]);
		expect(results.map((result) => result.status)).toEqual(["fulfilled", "rejected"]);
		expect(onEntitySaved).toHaveBeenCalledTimes(1);
	});
	it("checks the revision inside the actual write transaction", async () => {
		const { gateway, repositories, records } = harness();
		await gateway.commit(await gateway.prepareCreate("feats", template("feats")));
		const read = await gateway.getEntity("feats", "/feats/manual-new-id");
		const operation = await gateway.prepareUpdate("feats", read.url, { ...read.data, description: "agent change" }, read.revision);
		vi.mocked(repositories.feats.putItem).mockImplementationOnce(async (_item, context) => {
			records.set(`feats:${read.url}`, { ...read.data, description: "UI change before transaction" } as unknown as BaseItem);
			await context?.beforeWrite?.();
			return { ok: true };
		});
		await expect(gateway.commit(operation)).rejects.toThrow("изменилась");
		expect(records.get(`feats:${read.url}`)).toMatchObject({ description: "UI change before transaction" });
	});
	it("stops confirmed reference and media writes when the request is no longer active", async () => {
		for (const kind of ["feats", "track"] as const) {
			const { gateway } = harness();
			const operation = await gateway.prepareCreate(kind, template(kind));
			await expect(gateway.commit(operation, () => { throw new Error("cancelled"); })).rejects.toThrow("cancelled");
			expect((await gateway.searchEntities("", [kind])).items).toEqual([]);
		}
	});
	it("does not report a successful save as failed when UI notification fails", async () => {
		const { gateway, onEntitySaved } = harness();
		onEntitySaved.mockRejectedValueOnce(new Error("UI unavailable"));
		const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
		await expect(gateway.commit(await gateway.prepareCreate("track", template("track")))).resolves.toMatchObject({ kind: "track" });
		warning.mockRestore();
	});
	it("reports success with a required reread if the post-save persisted revision is unavailable", async () => {
		const { gateway, repositories, records } = harness();
		vi.mocked(repositories.feats.getFullItemByUrl).mockRejectedValueOnce(new Error("read failed after persistence"));
		const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
		try {
			await expect(gateway.commit(await gateway.prepareCreate("feats", template("feats")))).resolves.toMatchObject({ revision: null, readRequired: true });
			expect(records.has("feats:/feats/manual-new-id")).toBe(true);
		} finally { warning.mockRestore(); }
	});
	it("validates media references and retains playlist order", async () => {
		const { gateway, state } = harness();
		await expect(gateway.prepareCreate("track", { ...template("track"), normalAudioId: "missing" })).rejects.toThrow("Аудиофайл");
		state.audioFiles.push({ id: "audio", path: "audio/song.mp3", alias: "song" });
		await gateway.commit(await gateway.prepareCreate("track", { ...template("track"), normalAudioId: "audio" }));
		await expect(gateway.prepareCreate("scene", { ...template("scene"), trackId: "missing" })).rejects.toThrow("Трек");
		await expect(gateway.prepareCreate("playlist", { ...template("playlist"), items: [{ id: "entry", trackId: "missing" }] })).rejects.toThrow("Трек");
		const items = [{ id: "second", trackId: "new-id" }, { id: "first", trackId: "new-id" }];
		await gateway.commit(await gateway.prepareCreate("playlist", { ...template("playlist"), items }));
		expect((await gateway.getEntity("playlist", "/playlist/new-id")).data.items).toEqual(items);
		await expect(gateway.prepareCreate("adventure", { ...template("adventure"), scenes: [{ id: "missing", position: { x: 0, y: 0 } }] })).rejects.toThrow("сцены");
		expect(gateway.listAudioAssets()).toEqual([{ id: "audio", path: "audio/song.mp3", alias: "song" }]);
	});
	it("rechecks media references after confirmation and preserves unrelated data", async () => {
		const h = harness();
		h.state.tracks.push(createMediaTrack("Existing", "existing"));
		const operation = await h.gateway.prepareCreate("scene", { ...template("scene"), trackId: "existing" });
		h.state.tracks = [];
		await expect(h.gateway.commit(operation)).rejects.toThrow("Трек");
		expect(h.state.scenes).toEqual([]);
	});
	it("copies race trees with fresh descendant URLs and rejects unrelated nested overwrites", async () => {
		const { gateway, records } = harness();
		const child = { ...template("races"), url: "/races/child" };
		const root = { ...template("races"), url: "/races/root", subraces: [child] };
		records.set("races:/races/root", root as unknown as BaseItem);
		records.set("races:/races/child", child as unknown as BaseItem);
		const read = await gateway.getEntity("races", root.url);
		const copy = await gateway.prepareUpdate("races", root.url, read.data, read.revision);
		expect((copy.data.subraces as { url: string }[])[0].url).not.toBe(child.url);
		await gateway.commit(copy);
		await expect(gateway.prepareCreate("races", { ...template("races"), subraces: [child] })).rejects.toThrow("подрасу");
	});
});


describe("MCP tracks from vault audio paths", () => {
	const path = "Music/adventure_begins_loop.mp3";
	it("lists unregistered audio files without registering them", () => {
		const h = harness();
		h.vaultFiles.push(path, path, "Music/Бой.MP3", "Music/theme.ogg", "Music/theme.wav", "Music/theme.m4a", "Music/theme.flac", "Music/theme.aac", "Music/theme.opus", "Notes/song.md");
		h.state.audioFiles.push({ id: "registered", path, alias: "Custom alias" });
		const files = h.gateway.listAudioAssets();
		expect(files).toHaveLength(8);
		expect(files.find((file) => file.path === path)).toEqual({ id: "registered", path, alias: "Custom alias" });
		expect(files.find((file) => file.path === "Music/Бой.MP3")).toEqual({ id: null, path: "Music/Бой.MP3", alias: "Бой" });
		expect(h.state.audioFiles).toHaveLength(1);
	});
	it("registers the file only together with the confirmed track and stores only IDs", async () => {
		const h = harness(); h.vaultFiles.push(path);
		const payload = { ...template("track"), normalAudioPath: path };
		delete payload.normalAudioId; delete payload.combatAudioId;
		const prepared = await h.gateway.prepareCreate("track", payload);
		expect(h.state.audioFiles).toEqual([]); expect(h.state.tracks).toEqual([]);
		await h.gateway.commit(prepared);
		expect(h.state.audioFiles).toEqual([{ id: expect.any(String), path, alias: "adventure_begins_loop" }]);
		expect(h.state.tracks[0].normalAudioId).toBe(h.state.audioFiles[0].id);
		expect(h.state.tracks[0].combatAudioId).toBeNull();
		expect(h.state.tracks[0]).not.toHaveProperty("normalAudioPath");
	});
	it("reuses an existing registration and both variants can use the same file", async () => {
		const h = harness(); h.vaultFiles.push(path);
		h.state.audioFiles.push({ id: "existing", path, alias: "Keep alias" });
		await h.gateway.commit(await h.gateway.prepareCreate("track", { ...template("track"), normalAudioPath: path, combatAudioPath: path }));
		expect(h.state.audioFiles).toHaveLength(1);
		expect(h.state.tracks[0]).toMatchObject({ normalAudioId: "existing", combatAudioId: "existing" });
		expect(h.state.audioFiles[0].alias).toBe("Keep alias");
	});
	it("deduplicates a registration created while another confirmation was pending", async () => {
		const h = harness(); h.vaultFiles.push(path);
		const first = await h.gateway.prepareCreate("track", { ...template("track"), normalAudioPath: path });
		const second = await h.gateway.prepareCreate("track", { ...template("track"), id: "second", url: "/track/second", normalAudioPath: path });
		await Promise.all([h.gateway.commit(first), h.gateway.commit(second)]);
		expect(h.state.audioFiles).toHaveLength(1);
		expect(h.state.tracks.map((track) => track.normalAudioId)).toEqual([h.state.audioFiles[0].id, h.state.audioFiles[0].id]);
	});
	it("updates both variants by path and a path overrides the previous ID", async () => {
		const h = harness(); h.vaultFiles.push(path, "Music/combat.wav");
		h.state.audioFiles.push({ id: "old", path: "Music/old.mp3", alias: "Old" });
		await h.gateway.commit(await h.gateway.prepareCreate("track", { ...template("track"), normalAudioId: "old" }));
		const read = await h.gateway.getEntity("track", "/track/new-id");
		await h.gateway.commit(await h.gateway.prepareUpdate("track", read.url, { ...read.data, normalAudioPath: path, combatAudioPath: "Music/combat.wav" }, read.revision));
		const track = h.state.tracks[0];
		expect(h.state.audioFiles.find((file) => file.id === track.normalAudioId)?.path).toBe(path);
		expect(h.state.audioFiles.find((file) => file.id === track.combatAudioId)?.path).toBe("Music/combat.wav");
		expect(h.state.audioFiles).toHaveLength(3);
	});
	it.each(["Music/missing.mp3", "/absolute.mp3", "../outside.mp3", "Music/../outside.mp3", "https://example.com/song.mp3", "Music/readme.md", "C:\\song.mp3"])("rejects missing, outside or unsupported path %s before confirmation", async (invalid) => {
		const h = harness(); h.vaultFiles.push(path, ...(invalid === "Music/missing.mp3" ? [] : [invalid]));
		await expect(h.gateway.prepareCreate("track", { ...template("track"), normalAudioPath: path, combatAudioPath: invalid })).rejects.toThrow("Аудиофайл");
		expect(h.state.audioFiles).toEqual([]); expect(h.state.tracks).toEqual([]);
	});
	it("does not register anything if the file disappeared or the request was cancelled", async () => {
		const h = harness(); h.vaultFiles.push(path);
		const removed = await h.gateway.prepareCreate("track", { ...template("track"), normalAudioPath: path });
		h.vaultFiles.length = 0;
		await expect(h.gateway.commit(removed)).rejects.toThrow("Аудиофайл");
		h.vaultFiles.push(path);
		const cancelled = await h.gateway.prepareCreate("track", { ...template("track"), normalAudioPath: path });
		await expect(h.gateway.commit(cancelled, () => { throw new Error("cancelled"); })).rejects.toThrow("cancelled");
		expect(h.state.audioFiles).toEqual([]); expect(h.state.tracks).toEqual([]);
	});
});
