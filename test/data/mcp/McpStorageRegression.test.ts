// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import DB from "src/data/database/DB";
import { McpEntities, type McpRepository } from "src/data/mcp/McpEntities";
import { MCP_REFERENCE_KINDS, mcpEntitySchemas, mcpEntityTemplates } from "src/data/mcp/McpEntitySchemas";
import { createBestiaryRepository, createSpellbookRepository, createRacesRepository } from "src/data/repositories/factories";
import { createDefaultMediaState } from "src/domain/models/media/MediaState";
import { mockManifest } from "../../__mocks__/data";

const wasm = readFileSync(resolve("node_modules/sql.js/dist/sql-wasm.wasm"));
async function fixture() {
    const adapter = { exists: async () => false, readBinary: async () => wasm.buffer.slice(wasm.byteOffset, wasm.byteOffset + wasm.byteLength), writeBinary: async () => undefined };
    const db = new DB({ vault: { configDir: ".obsidian", adapter } } as any, mockManifest);
    vi.spyOn(db as any, "createSeedOrchestrator").mockReturnValue({ seedAll: async () => undefined });
    await db.initialize();
    return db;
}

describe("MCP storage review regressions", () => {
    it.each(MCP_REFERENCE_KINDS)("accepts existing blank source metadata for %s", (kind) => {
        const data = { ...structuredClone(mcpEntityTemplates[kind]), source: { name: "", shortName: "", group: { name: "", shortName: "" } } };
        expect(mcpEntitySchemas[kind].safeParse(data).success).toBe(true);
        expect(mcpEntitySchemas[kind].safeParse({ ...data, source: { ...data.source, unexpected: "SQL" } }).success).toBe(false);
    });

    it.each(["bestiary", "spellbook", "races"] as const)("returns the persisted canonical full %s on first read", async (kind) => {
        const db = await fixture();
        try {
            const data = { ...structuredClone(mcpEntityTemplates[kind]), url: kind === "spellbook" ? "/spells/cold" : `/${kind}/cold` };
            if (kind !== "races") (data as any).id = 9001;
            const service = { getFullItem: vi.fn(async () => ({ ok: true, value: data })), getRaceTree: vi.fn(async () => ({ ok: true, value: data })) } as any;
            const repo = kind === "bestiary" ? createBestiaryRepository(db, { ttgService: service }) : kind === "spellbook" ? createSpellbookRepository(db, { ttgService: service }) : createRacesRepository(db, { ttgService: service });
            const smallDao = kind === "bestiary" ? db.smallMonsterDao : kind === "spellbook" ? db.smallSpellDao : db.smallRaceDao;
            await db.transaction(async () => { await (smallDao as any).createItem(data); });
            const gateway = new McpEntities({ repositories: { [kind]: repo } as Record<string, McpRepository> as any, getMediaState: createDefaultMediaState, updateMedia: async () => undefined });
            const first = await gateway.getEntity(kind, data.url);
            const second = await gateway.getEntity(kind, data.url);
            expect(first.revision).toBe(second.revision);
            expect(first.data).toEqual(second.data);
            if (kind !== "races") expect(first.data.id).not.toBe(9001);
            expect(service[kind === "races" ? "getRaceTree" : "getFullItem"]).toHaveBeenCalledOnce();
        } finally { await db.dispose(); }
    });

    it("propagates a full-entity cache persistence failure instead of returning an unsaved card", async () => {
        const db = await fixture();
        try {
            const data = structuredClone(mcpEntityTemplates.spellbook);
            const repo = createSpellbookRepository(db, { ttgService: { getFullItem: async () => ({ ok: true, value: data }) } as any });
            vi.spyOn(db.fullSpellDao, "createItem").mockRejectedValueOnce(new Error("Disk full"));
            await expect(repo.getFullItemByUrl(data.url)).rejects.toThrow("Disk full");
            expect(await db.fullSpellDao.readItemByUrl(data.url)).toBeNull();
        } finally { await db.dispose(); }
    });
});
