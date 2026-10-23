// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import initSqlJs from "sql.js";
import { describe, expect, it, vi } from "vitest";
import DB from "src/data/database/DB";
import { McpEntities, mcpEntityRevision, type McpBatchAction, type McpEntitiesDependencies, type McpRepository } from "src/data/mcp/McpEntities";
import { createMcpPersistence } from "src/data/mcp/McpPersistence";
import { MCP_ENTITY_URL_PREFIXES, MCP_REFERENCE_KINDS, mcpEntityTemplates, type McpEntityKind, type McpReferenceKind } from "src/data/mcp/McpEntitySchemas";
import * as factories from "src/data/repositories/factories";
import { McpOperationsDao } from "src/data/database/McpOperationsDao";
import { MediaSqlDao } from "src/data/database/MediaSqlDao";
import { createMediaScene, type MediaState } from "src/domain/models/media/MediaState";
import { mockManifest } from "../../__mocks__/data";
import { EmptyFullCharacterSheet } from "src/domain/models/character";

const wasm = readFileSync(resolve("node_modules/sql.js/dist/sql-wasm.wasm"));
const repositoryFactories = {
    bestiary: factories.createBestiaryRepository, spellbook: factories.createSpellbookRepository,
    arsenal: factories.createArsenalRepository, armory: factories.createArmoryRepository,
    equipment: factories.createEquipmentRepository, artifactory: factories.createArtifactoryRepository,
    backgrounds: factories.createBackgroundRepository, feats: factories.createFeatsRepository, races: factories.createRacesRepository,
};

function entity(kind: McpEntityKind, id: string, values: Record<string, unknown> = {}): Record<string, unknown> {
    return { ...structuredClone(mcpEntityTemplates[kind]), url: `${MCP_ENTITY_URL_PREFIXES[kind]}${id}`, ...(!MCP_REFERENCE_KINDS.includes(kind as McpReferenceKind) ? { id } : {}), ...values };
}
function create(kind: McpEntityKind, id: string, values: Record<string, unknown> = {}): McpBatchAction { return { operation: "create", kind, data: entity(kind, id, values) }; }
function musicBatch(): McpBatchAction[] {
    return [
        create("bestiary", "creature", { hits: { average: 7, text: "7 (2к6)" }, environment: ["лес"] }),
        create("track", "music", { normalAudioPath: "Music/adventure.mp3" }),
        create("playlist", "playlist", { items: [{ id: "first", trackId: "music" }] }),
        create("scene", "scene", { trackId: "music", notePath: "Campaign/Scene.md", campaignName: "Кампания" }),
        create("adventure", "adventure", { playlistId: "playlist", campaignName: "Кампания", scenes: [{ id: "scene", position: { x: 123, y: 45 } }] }),
    ];
}

async function fixture() {
    let persisted: Uint8Array, failAtomicWrite = false;
    let db!: DB;
    const adapter = {
        exists: async () => false,
        readBinary: async () => wasm.buffer.slice(wasm.byteOffset, wasm.byteOffset + wasm.byteLength),
        writeBinary: vi.fn(async (_path: string, data: ArrayBuffer) => {
            // Pending/running metadata may persist; fail only the transaction which
            // contains the entity writes and successful receipt together.
            if (failAtomicWrite && db?.mcpOperationsDao?.get("disk-failure")?.status === "succeeded") throw new Error("Disk full");
            persisted = new Uint8Array(data.slice(0));
        }),
    };
    db = new DB({ vault: { configDir: ".obsidian", adapter } } as any, { ...mockManifest, id: "dnd-dm-tools" });
    vi.spyOn(db as any, "createSeedOrchestrator").mockReturnValue({ seedAll: async () => undefined });
    await db.initialize();
    const repositories = Object.fromEntries(MCP_REFERENCE_KINDS.map(kind => [kind, repositoryFactories[kind](db)])) as Record<McpReferenceKind, McpRepository>;
    let media = db.media.read();
    const notify = vi.fn((kind: McpEntityKind, url: string) => {
        const repository = repositories[kind as McpReferenceKind] as McpRepository & { notifyExternalChange?(url: string): void } | undefined;
        repository?.notifyExternalChange?.(url);
    });
    const publish = vi.fn((state: MediaState) => { media = state; });
    const paths = ["Music/adventure.mp3", "Music/battle.ogg"];
    const dependencies: McpEntitiesDependencies = {
        readBarrier: () => db.whenIdle(),
        repositories, getMediaState: () => media, getVaultAudioPaths: () => paths,
        updateMedia: async (mutator, beforeWrite) => { const next = structuredClone(media); mutator(next); await db.media.save(next, beforeWrite); publish(db.media.read()); },
        onEntitySaved: notify,
    };
    const persistence = createMcpPersistence(db, dependencies, publish);
    const gateway = new McpEntities({ ...dependencies, ...persistence });
    async function apply(actions: McpBatchAction[], operationId: string) {
        await gateway.beginOperation(operationId, mcpEntityRevision(actions));
        const writes = await gateway.prepareBatch(actions);
        return await gateway.commitOperation(operationId, writes);
    }
    async function undo(targetId: string, operationId: string) {
        await gateway.beginOperation(operationId, mcpEntityRevision({ undo: targetId }));
        const writes = await gateway.prepareUndo(targetId);
        return await gateway.commitOperation(operationId, writes);
    }
    return { db, adapter, gateway, dependencies, persistence, media: () => media, publish, notify, paths, apply, undo,
        persisted: () => persisted!, failWrites: () => { failAtomicWrite = true; }, dispose: () => db.dispose() };
}

describe("MCP persistent operations and shared transactions", () => {
    it("commits reference cards, audio registrations, ordered media links and a successful receipt together", async () => {
        const f = await fixture();
        try {
            const result = await f.apply(musicBatch(), "music-batch");
            expect(result).toHaveProperty("items");
            expect(f.publish).toHaveBeenCalledOnce();
            expect(f.notify).toHaveBeenCalledTimes(5);
            const receipt = await f.gateway.getOperation("music-batch", true);
            expect(receipt.status).toBe("succeeded");
            expect(receipt.changes).toHaveLength(5);
            expect((await f.gateway.getOperation("music-batch")).changes).toBeUndefined();
            expect((await f.gateway.listOperations()).items[0].changes).toBeUndefined();
            const SQL = await initSqlJs({ wasmBinary: wasm });
            const reopened = new SQL.Database(f.persisted());
            try {
                expect(new McpOperationsDao(reopened).get("music-batch")?.result).toEqual(result);
                const media = new MediaSqlDao(reopened).read();
                expect(media.audioFiles).toMatchObject([{ path: "Music/adventure.mp3" }]);
                expect(media.tracks[0].normalAudioId).toBe(media.audioFiles[0].id);
                expect(media.playlists[0].items).toEqual([{ id: "first", trackId: "music" }]);
                expect(media.scenes[0]).toMatchObject({ trackId: "music", notePath: "Campaign/Scene.md" });
                expect(media.adventures[0]).toMatchObject({ playlistId: "playlist", scenes: [{ id: "scene", position: { x: 123, y: 45 } }] });
            } finally { reopened.close(); }
            expect((await f.gateway.getEntity("bestiary", "/bestiary/creature")).data).toMatchObject({ hits: { text: "7 (2к6)" }, environment: ["лес"] });
            // Restart reloads media through the SQL mapper. Receipt revisions must
            // identify the same records rather than the pre-normalization inputs.
            f.publish(f.db.media.read());
            for (const change of receipt.changes!) {
                const current = await f.gateway.getEntity(change.kind, change.url);
                expect(current.data).toEqual(change.after);
                expect(current.revision).toBe(mcpEntityRevision(change.after));
            }
        } finally { await f.dispose(); }
    });

    it.each(["last-action", "disk"])("rolls back the whole mixed batch after a %s failure without publishing UI changes", async (failure) => {
        const f = await fixture();
        try {
            const actions = musicBatch();
            const id = failure === "disk" ? "disk-failure" : "last-action-failure";
            await f.gateway.beginOperation(id, mcpEntityRevision(actions));
            const writes = await f.gateway.prepareBatch(actions);
            if (failure === "disk") f.failWrites();
            else await f.db.transaction(async sql => { sql.exec("CREATE TRIGGER reject_adventure BEFORE INSERT ON media_entities WHEN NEW.kind = 'adventures' BEGIN SELECT RAISE(ABORT, 'Last action failed'); END;"); });
            await expect(f.gateway.commitOperation(id, writes)).rejects.toThrow(failure === "disk" ? "Disk full" : "Last action failed");
            expect(await f.db.fullMonsterDao.readItemByUrl("/bestiary/creature")).toBeNull();
            expect(await f.db.smallMonsterDao.readItemByUrl("/bestiary/creature")).toBeNull();
            expect(f.db.media.read()).toEqual(f.media());
            expect(f.db.media.read().audioFiles).toEqual([]);
            expect(f.publish).not.toHaveBeenCalled();
            expect(f.notify).not.toHaveBeenCalled();
            expect((await f.gateway.getOperation(id)).status).toBe("failed");
            expect((await f.gateway.getOperation(id)).changes).toBeUndefined();
        } finally { await f.dispose(); }
    });

    it("does not expose a provisional successful receipt while the database file is still being saved", async () => {
        const f = await fixture();
        let release!: () => void;
        const gate = new Promise<void>(resolveGate => { release = resolveGate; });
        try {
            let entered!: () => void;
            const writing = new Promise<void>(resolveWriting => { entered = resolveWriting; });
            const originalWrite = f.adapter.writeBinary.getMockImplementation()!;
            f.adapter.writeBinary.mockImplementation(async (path, data) => {
                if (f.db.mcpOperationsDao.get("disk-failure")?.status === "succeeded") { entered(); await gate; }
                return originalWrite(path, data);
            });
            f.failWrites();
            const saving = f.apply([create("feats", "provisional")], "disk-failure").catch(error => error);
            await writing;
            let settled = false;
            const receipt = f.gateway.getOperation("disk-failure").then(operation => { settled = true; return operation; });
            await new Promise(resolveTick => setImmediate(resolveTick));
            expect(settled).toBe(false);
            release();
            expect(await saving).toBeInstanceOf(Error);
            expect((await receipt).status).not.toBe("succeeded");
        } finally { release(); await f.dispose(); }
    });

    it("binds operation IDs to exact requests and recovers unfinished operations on restart", async () => {
        const f = await fixture();
        try {
            const first = await f.gateway.beginOperation("same-id", "request-hash");
            expect(first.isNew).toBe(true);
            const duplicate = await f.gateway.beginOperation("same-id", "request-hash");
            expect(duplicate.isNew).toBe(false);
            await expect(f.gateway.beginOperation("same-id", "different-hash")).rejects.toMatchObject({ code: "idempotency_conflict" });
            await f.gateway.beginOperation("running-id", "running-hash");
            await f.gateway.finishOperation("running-id", "running");
            await f.apply([create("feats", "created")], "completed");
            const SQL = await initSqlJs({ wasmBinary: wasm });
            const reopened = new SQL.Database(f.persisted());
            try {
                const dao = new McpOperationsDao(reopened); dao.initialize(); dao.interruptPending();
                expect(dao.get("same-id")?.status).toBe("interrupted");
                expect(dao.get("running-id")?.status).toBe("interrupted");
                expect(dao.get("completed")?.status).toBe("succeeded");
            } finally { reopened.close(); }
            const repeat = await f.gateway.beginOperation("completed", mcpEntityRevision([create("feats", "created")]));
            expect(repeat).toMatchObject({ isNew: false, status: "succeeded" });
            expect(repeat.result).toEqual((await f.gateway.getOperation("completed")).result);
            expect((await f.gateway.searchEntities("", ["feats"])).total).toBe(1);
        } finally { await f.dispose(); }
    });

    it("marks unfinished receipts interrupted when the actual database manager reopens its saved file", async () => {
        const f = await fixture();
        let restarted: DB | undefined;
        try {
            await f.gateway.beginOperation("waiting", "waiting-hash");
            await f.gateway.beginOperation("running", "running-hash");
            await f.gateway.finishOperation("running", "running");
            await f.apply([create("feats", "persisted")], "done");
            const saved = f.persisted();
            const adapter = {
                exists: async (path: string) => path.endsWith("database.db"),
                readBinary: async (path: string) => {
                    const bytes = path.endsWith(".wasm") ? wasm : saved;
                    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
                },
                writeBinary: async () => undefined,
            };
            restarted = new DB({ vault: { configDir: ".obsidian", adapter } } as any, { ...mockManifest, id: "dnd-dm-tools" });
            vi.spyOn(restarted as any, "createSeedOrchestrator").mockReturnValue({ seedAll: async () => undefined });
            await restarted.initialize();
            expect(restarted.mcpOperationsDao.get("waiting")?.status).toBe("interrupted");
            expect(restarted.mcpOperationsDao.get("running")?.status).toBe("interrupted");
            expect(restarted.mcpOperationsDao.get("done")?.status).toBe("succeeded");
            expect(await restarted.fullFeatDao.readItemByUrl("/feats/persisted")).not.toBeNull();
        } finally { await restarted?.dispose(); await f.dispose(); }
    });

    it("invalidates the shared UI repository list and filter caches after atomic create, edit and undo", async () => {
        const f = await fixture();
        try {
            const shared = f.dependencies.repositories.spellbook;
            expect(await shared.getAllSmallItems()).toEqual([]);
            expect(await shared.getAllFilters!()).toMatchObject({ levels: [], schools: [] });
            await f.apply([create("spellbook", "spell", { level: 5, school: "Иллюзия" })], "create-spell");
            expect(await shared.getAllSmallItems()).toMatchObject([{ level: 5, school: "Иллюзия" }]);
            expect(await shared.getAllFilters!()).toMatchObject({ levels: [5], schools: ["Иллюзия"] });
            const original = await f.gateway.getEntity("spellbook", "/spells/spell");
            await f.apply([{ operation: "patch", kind: "spellbook", url: original.url, expectedRevision: original.revision, changes: { level: 3, school: "Воплощение" } }], "edit-spell");
            expect(await shared.getAllSmallItems()).toMatchObject([{ level: 3, school: "Воплощение" }]);
            expect(await shared.getAllFilters!()).toMatchObject({ levels: [3], schools: ["Воплощение"] });
            await f.undo("edit-spell", "undo-edit-spell");
            expect(await shared.getAllSmallItems()).toMatchObject([{ level: 5, school: "Иллюзия" }]);
            expect(await shared.getAllFilters!()).toMatchObject({ levels: [5], schools: ["Иллюзия"] });
            await f.undo("create-spell", "undo-create-spell");
            expect(await shared.getAllSmallItems()).toEqual([]);
            expect(await shared.getAllFilters!()).toMatchObject({ levels: [], schools: [] });
        } finally { await f.dispose(); }
    });

    it("blocks undo when a character sheet equipment entry contains the created card's linkedUrl", async () => {
        const f = await fixture();
        try {
            await f.apply([create("armory", "armor")], "create-armor");
            const sheet = EmptyFullCharacterSheet();
            sheet.url = "/character/hero";
            sheet.name = { rus: "Герой", eng: "Hero" };
            sheet.data.equipmentList = [{
                id: "equipped-armor", name: { value: "Доспех" }, onCharacter: true, isMagic: false, isAttuned: false,
                linkedUrl: "/armors/armor", linkedType: "armor", notes: { value: "" }, notesVisibility: false,
            }];
            await f.db.transaction(async () => { await f.db.characterSheetDao.createItem(sheet); });
            await expect(f.undo("create-armor", "undo-equipped-armor")).rejects.toMatchObject({ code: "dependency" });
            expect(await f.db.fullArmorDao.readItemByUrl("/armors/armor")).not.toBeNull();
            expect((await f.db.characterSheetDao.readFullItemByUrl(sheet.url))?.data.equipmentList?.[0].linkedUrl).toBe("/armors/armor");
        } finally { await f.dispose(); }
    });

    it("patches nested fields without removing siblings, replaces arrays and enforces nullability and immutable identities", async () => {
        const f = await fixture();
        try {
            await f.apply([create("bestiary", "monster", { ability: { str: 10, dex: 11, con: 12, int: 13, wiz: 14, cha: 15 }, languages: ["Общий", "Эльфийский"] })], "original");
            const original = await f.gateway.getEntity("bestiary", "/bestiary/monster");
            const action: McpBatchAction = { operation: "patch", kind: "bestiary", url: original.url, expectedRevision: original.revision, changes: { name: { rus: "Новое имя" }, ability: { str: 20 }, languages: ["Драконий"] } };
            await f.apply([action], "patch");
            const updated = await f.gateway.getEntity("bestiary", original.url);
            expect(updated.data).toMatchObject({ name: { rus: "Новое имя", eng: "" }, ability: { str: 20, dex: 11, con: 12, int: 13, wiz: 14, cha: 15 }, languages: ["Драконий"] });
            await expect(f.gateway.preparePatch("bestiary", updated.url, { name: null }, updated.revision)).rejects.toThrow();
            await expect(f.gateway.preparePatch("bestiary", updated.url, { url: "/bestiary/other" }, updated.revision)).rejects.toThrow("неизменяемый");
            await expect(f.gateway.preparePatch("bestiary", updated.url, JSON.parse('{"__proto__":{"polluted":true}}'), updated.revision)).rejects.toThrow("Недопустимое поле");
            await expect(f.gateway.preparePatch("bestiary", updated.url, { description: "stale" }, original.revision)).rejects.toThrow("изменилась");
            await f.apply([create("track", "clear", { normalAudioPath: "Music/adventure.mp3" })], "track");
            const track = await f.gateway.getEntity("track", "/track/clear");
            await f.apply([{ operation: "patch", kind: "track", url: track.url, expectedRevision: track.revision, changes: { normalAudioId: null } }], "clear-track");
            expect((await f.gateway.getEntity("track", track.url)).data.normalAudioId).toBeNull();
        } finally { await f.dispose(); }
    });

    it("undoes an entire creation batch atomically and never removes the underlying audio registration", async () => {
        const f = await fixture();
        try {
            await f.apply(musicBatch(), "create-all");
            const audio = structuredClone(f.media().audioFiles);
            await f.undo("create-all", "undo-all");
            expect(await f.db.smallMonsterDao.readItemByUrl("/bestiary/creature")).toBeNull();
            expect(f.media()).toMatchObject({ tracks: [], playlists: [], scenes: [], adventures: [], audioFiles: audio });
            expect((await f.gateway.getOperation("create-all")).undoneBy).toBe("undo-all");
            expect((await f.gateway.getOperation("undo-all"))).toMatchObject({ status: "succeeded", undoTargetId: "create-all" });
            await expect(f.gateway.prepareUndo("create-all")).rejects.toMatchObject({ code: "undo_unavailable" });
            await expect(f.gateway.prepareUndo("undo-all")).rejects.toMatchObject({ code: "undo_unavailable" });
        } finally { await f.dispose(); }
    });

    it("restores prior reference and media versions when undoing a mixed update batch", async () => {
        const f = await fixture();
        try {
            await f.apply([create("feats", "feat", { description: "До" }), create("scene", "scene", { campaignName: "До" })], "original");
            const feat = await f.gateway.getEntity("feats", "/feats/feat"), scene = await f.gateway.getEntity("scene", "/scene/scene");
            await f.apply([
                { operation: "patch", kind: "feats", url: feat.url, expectedRevision: feat.revision, changes: { description: "После" } },
                { operation: "patch", kind: "scene", url: scene.url, expectedRevision: scene.revision, changes: { campaignName: "После" } },
            ], "update");
            await f.undo("update", "undo-update");
            expect((await f.gateway.getEntity("feats", feat.url)).data).toEqual(feat.data);
            expect((await f.gateway.getEntity("scene", scene.url)).data).toEqual(scene.data);
        } finally { await f.dispose(); }
    });

    it("preserves race hierarchy through creation undo and update undo with added descendants", async () => {
        const f = await fixture();
        try {
            const child = entity("races", "child");
            await f.apply([create("races", "parent", { subraces: [child] })], "create-tree");
            expect(await f.db.fullRaceDao.readParentUrl("/races/child")).toBe("/races/parent");
            const initial = await f.gateway.getEntity("races", "/races/parent");
            await f.apply([{ operation: "patch", kind: "races", url: initial.url, expectedRevision: initial.revision, changes: { subraces: [child, entity("races", "new-child")] } }], "grow-tree");
            expect(await f.db.fullRaceDao.readItemByUrl("/races/new-child")).not.toBeNull();
            await f.undo("grow-tree", "shrink-tree");
            expect(await f.db.fullRaceDao.readItemByUrl("/races/new-child")).toBeNull();
            expect((await f.gateway.getEntity("races", initial.url)).data).toEqual(initial.data);
            await f.undo("create-tree", "remove-tree");
            expect(await f.db.fullRaceDao.readItemByUrl("/races/parent")).toBeNull();
            expect(await f.db.fullRaceDao.readItemByUrl("/races/child")).toBeNull();
            expect(await f.db.smallRaceDao.readItemByUrl("/races/child")).toBeNull();
        } finally { await f.dispose(); }
    });

    it("rejects invalid, duplicate and forward-referencing batch actions before any entity write", async () => {
        const f = await fixture();
        try {
            await expect(f.gateway.prepareBatch([])).rejects.toMatchObject({ code: "validation" });
            await expect(f.gateway.prepareBatch(Array.from({ length: 51 }, (_, index) => create("feats", `feat-${index}`)))).rejects.toMatchObject({ code: "validation" });
            await expect(f.gateway.prepareBatch([create("feats", "duplicate"), create("feats", "duplicate")])).rejects.toThrow();
            await expect(f.gateway.prepareBatch([create("playlist", "forward", { items: [{ id: "item", trackId: "future-track" }] }), create("track", "future-track")])).rejects.toThrow();
            expect((await f.gateway.searchEntities("", ["feats", "playlist", "track"])).total).toBe(0);
            expect(f.publish).not.toHaveBeenCalled();
        } finally { await f.dispose(); }
    });

    it("blocks undo after card content changes, including a change made after confirmation", async () => {
        const f = await fixture();
        try {
            await f.apply([create("feats", "feat")], "create");
            const before = await f.gateway.getEntity("feats", "/feats/feat");
            const writes = await f.gateway.prepareUndo("create");
            await f.gateway.beginOperation("undo", "undo-request");
            await f.apply([{ operation: "patch", kind: "feats", url: before.url, expectedRevision: before.revision, changes: { description: "Изменено" } }], "changed");
            await expect(f.gateway.commitOperation("undo", writes)).rejects.toMatchObject({ code: "conflict" });
            expect((await f.gateway.getEntity("feats", before.url)).data.description).toBe("Изменено");
            await expect(f.gateway.prepareUndo("create")).rejects.toMatchObject({ code: "conflict" });
        } finally { await f.dispose(); }
    });

    it.each([
        { kind: "arsenal", url: "/weapons/weapon", owner: "bestiary", fields: { actions: [{ name: "Атака", value: "Описание", weaponUrl: "/weapons/weapon" }] } },
        { kind: "armory", url: "/armors/armor", owner: "bestiary", fields: { armors: [{ name: "Доспех", type: "armor", url: "/armors/armor" }] } },
        { kind: "equipment", url: "/items/item", owner: "artifactory", fields: { detailType: [{ name: "Предмет", type: "item", url: "/items/item" }] } },
        { kind: "bestiary", url: "/bestiary/creature", owner: "bestiary", fields: { bonusActions: [{ name: "Действие", value: "Описание", entityUrl: "/bestiary/creature" }] } },
    ] as const)("blocks undo creation of a $kind used by another card's structured URL field", async ({ kind, url, owner, fields }) => {
        const f = await fixture();
        try {
            await f.apply([create(kind, "target", { url })], "target");
            await f.apply([create(owner, "foreign-owner", fields)], "owner");
            const before = await f.gateway.getEntity(kind, url);
            await expect(f.undo("target", "undo-foreign-reference")).rejects.toMatchObject({ code: "dependency" });
            expect((await f.gateway.getEntity(kind, url)).data).toEqual(before.data);
            expect((await f.gateway.getOperation("target")).undoneBy).toBeUndefined();
        } finally { await f.dispose(); }
    });

    it("allows undo when both ends of a structured reference were created in the same group", async () => {
        const f = await fixture();
        try {
            await f.apply([create("arsenal", "weapon"), create("bestiary", "monster", { actions: [{ name: "Атака", value: "Описание", weaponUrl: "/weapons/weapon" }] })], "linked-group");
            await f.undo("linked-group", "undo-linked-group");
            expect(await f.db.fullWeaponDao.readItemByUrl("/weapons/weapon")).toBeNull();
            expect(await f.db.fullMonsterDao.readItemByUrl("/bestiary/monster")).toBeNull();
        } finally { await f.dispose(); }
    });

    it.each(["foreign-scene", "foreign-playlist", "foreign-adventure-playlist", "foreign-adventure-scene", "favorite", "active-scene", "active-adventure", "parent-race"])("blocks undo with a %s dependency without deleting any part of the operation", async (dependency) => {
        const f = await fixture();
        try {
            if (dependency === "favorite") {
                await f.apply([create("feats", "first"), create("feats", "second")], "target");
                await f.db.favorites.set("feats", "/feats/first", true);
            } else if (dependency === "parent-race") {
                await f.apply([create("races", "child")], "target");
                await f.db.transaction(async sql => {
                    // Simulate a legitimate subsequent hierarchy edit in the UI.
                    sql.exec("UPDATE full_races SET parent_url = '/races/foreign-parent' WHERE url = '/races/child';");
                    sql.exec("UPDATE small_races SET parent_url = '/races/foreign-parent' WHERE url = '/races/child';");
                });
            } else if (dependency === "foreign-scene") {
                await f.apply([create("track", "track")], "target");
                await f.dependencies.updateMedia(state => { state.scenes.push({ ...createMediaScene("Чужая сцена", "foreign"), trackId: "track" }); });
            } else if (dependency === "foreign-playlist") {
                await f.apply([create("track", "track")], "target");
                await f.apply([create("playlist", "foreign", { items: [{ id: "item", trackId: "track" }] })], "foreign");
            } else if (dependency === "foreign-adventure-playlist") {
                await f.apply([create("playlist", "playlist")], "target");
                await f.apply([create("adventure", "foreign", { playlistId: "playlist" })], "foreign");
            } else if (dependency === "foreign-adventure-scene") {
                await f.apply([create("scene", "scene")], "target");
                await f.apply([create("adventure", "foreign", { scenes: [{ id: "scene", position: { x: 0, y: 0 } }] })], "foreign");
            } else if (dependency === "active-scene") {
                await f.apply([create("scene", "scene")], "target");
                await f.dependencies.updateMedia(state => { state.activeSceneId = "scene"; });
            } else {
                await f.apply([create("adventure", "adventure")], "target");
                await f.dependencies.updateMedia(state => { state.activeAdventureId = "adventure"; });
            }
            const media = structuredClone(f.media()), notifications = f.notify.mock.calls.length;
            await expect(f.undo("target", "undo-blocked")).rejects.toMatchObject({ code: "dependency" });
            expect(f.media()).toEqual(media);
            expect((await f.gateway.getOperation("target")).undoneBy).toBeUndefined();
            expect(f.notify).toHaveBeenCalledTimes(notifications);
            if (dependency === "favorite") {
                expect(await f.db.smallFeatDao.readItemByUrl("/feats/first")).not.toBeNull();
                expect(await f.db.smallFeatDao.readItemByUrl("/feats/second")).not.toBeNull();
            }
        } finally { await f.dispose(); }
    });
});
