// @vitest-environment node
import { mkdtemp, mkdir, readFile, rm } from "node:fs/promises";
import * as fs from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { FileSystemAdapter } from "obsidian";
import { describe, expect, it, vi } from "vitest";
import DB from "src/data/database/DB";
import { mockManifest } from "../../__mocks__/data";

vi.mock("obsidian", async (importOriginal) => {
    const original = await importOriginal<object>();
    return {
        ...original,
        FileSystemAdapter: class {
            constructor(private readonly basePath: string) {}
            getBasePath() { return this.basePath; }
        },
    };
});

async function fixture() {
    const root = await mkdtemp(join(tmpdir(), "dnd-db-atomic-"));
    const manifest = { ...mockManifest, id: "dnd-dm-tools" };
    const directory = join(root, ".obsidian", "plugins", manifest.id);
    await mkdir(directory, { recursive: true });
    const wasm = await readFile(resolve("node_modules/sql.js/dist/sql-wasm.wasm"));
    const adapter = Object.assign(new FileSystemAdapter(root), {
        exists: async () => false,
        readBinary: async () => wasm.buffer.slice(wasm.byteOffset, wasm.byteOffset + wasm.byteLength),
        writeBinary: vi.fn(),
    });
    const db = new DB({ vault: { configDir: ".obsidian", adapter } } as any, manifest);
    vi.spyOn(db as any, "createSeedOrchestrator").mockReturnValue({ seedAll: async () => undefined });
    await db.initialize();
    return { db, adapter, target: join(directory, "database.db"), dispose: async () => { await db.dispose(); await rm(root, { recursive: true, force: true }); } };
}

describe("desktop database atomic replacement", () => {
    it("writes and flushes a same-directory temporary file before replacing the database", async () => {
        const { db, adapter, target, dispose } = await fixture();
        try {
            const previous = await readFile(target);
            const rename = vi.spyOn(fs.promises, "rename");
            await db.favorites.set("bestiary", "/committed", true);
            expect(rename).toHaveBeenCalledWith(`${target}.tmp`, target);
            expect(await readFile(target)).not.toEqual(previous);
            expect(adapter.writeBinary).not.toHaveBeenCalled();
            await expect(readFile(`${target}.tmp`)).rejects.toMatchObject({ code: "ENOENT" });
        } finally { vi.restoreAllMocks(); await dispose(); }
    });

    it.each(["write", "rename"])("preserves the old database and removes temporary files after a %s failure", async (phase) => {
        const { db, target, dispose } = await fixture();
        try {
            const previous = await readFile(target);
            if (phase === "rename") {
                vi.spyOn(fs.promises, "rename").mockRejectedValueOnce(new Error("Rename failed"));
            } else {
                const open = fs.promises.open.bind(fs.promises);
                vi.spyOn(fs.promises, "open").mockImplementationOnce(async (...args) => {
                    const file = await open(...args);
                    const write = file.writeFile.bind(file);
                    vi.spyOn(file, "writeFile").mockImplementationOnce(async () => {
                        await write(Buffer.from("partial database"));
                        throw new Error("Write failed");
                    });
                    return file;
                });
            }
            await expect(db.favorites.set("bestiary", "/rejected", true)).rejects.toThrow("failed");
            expect(await readFile(target)).toEqual(previous);
            expect(db.favorites.has("bestiary", "/rejected")).toBe(false);
            await expect(readFile(`${target}.tmp`)).rejects.toMatchObject({ code: "ENOENT" });
            vi.restoreAllMocks();
            await db.favorites.set("bestiary", "/next", true);
            expect(db.favorites.has("bestiary", "/next")).toBe(true);
            expect(db.favorites.has("bestiary", "/rejected")).toBe(false);
        } finally { vi.restoreAllMocks(); await dispose(); }
    });
});
