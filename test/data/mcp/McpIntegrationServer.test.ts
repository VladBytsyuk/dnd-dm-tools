// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { request } from "node:http";
import { Client, StreamableHTTPClientTransport, type ElicitResult } from "@modelcontextprotocol/client";
import { McpIntegrationServer, mcpUnavailableReason } from "src/data/mcp/McpIntegrationServer";
import { McpEntities, type McpRepository } from "src/data/mcp/McpEntities";
import { MCP_REFERENCE_KINDS, mcpEntityTemplates, type McpReferenceKind } from "src/data/mcp/McpEntitySchemas";
import { createDefaultMediaState } from "src/domain/models/media/MediaState";
import type { BaseItem } from "src/domain/models/common/BaseItem";

const TOKEN = "integration-test-secret-".repeat(3);
const closers: (() => Promise<unknown>)[] = [];
afterEach(async () => { for (const close of closers.splice(0).reverse()) await close().catch(() => {}); });

async function fixture() {
	let media = createDefaultMediaState();
	const vaultFiles: string[] = [];
	const records = new Map<string, BaseItem>();
	const loaded = new Set<string>();
	const fullLoads = vi.fn();
	const writes = vi.fn();
	const repositories = Object.fromEntries(MCP_REFERENCE_KINDS.map((kind) => [kind, {
		getAllSmallItems: async () => [...records.entries()].filter(([key]) => key.startsWith(`${kind}:`)).map(([, value]) => structuredClone(value)),
		getFullItemByUrl: async (url: string) => { if (!loaded.has(url)) { fullLoads(url); loaded.add(url); } return structuredClone(records.get(`${kind}:${url}`) ?? null); },
		putItem: async (item: BaseItem, context?: { beforeWrite?: () => Promise<void> }) => { await context?.beforeWrite?.(); writes(item); records.set(`${kind}:${item.url}`, structuredClone(item)); return { ok: true as const }; },
	}])) as Record<McpReferenceKind, McpRepository>;
	const entities = new McpEntities({ repositories, getMediaState: () => media, getVaultAudioPaths: () => vaultFiles, updateMedia: async (mutator) => { const next = structuredClone(media); mutator(next); media = next; } });
	const server = new McpIntegrationServer(entities, "1.0.0", TOKEN);
	closers.push(() => server.stop());
	const port = await server.start();
	const url = `http://127.0.0.1:${port}/mcp`;
	return { server, entities, port, url, records, fullLoads, writes, vaultFiles };
}
async function connect(url: string, era: "legacy" | "modern", response: ElicitResult | null = { action: "accept", content: { confirm: true } }, handler?: () => Promise<ElicitResult>) {
	const client = new Client({ name: "integration-test", version: "1.0.0" }, {
		capabilities: response === null ? {} : { elicitation: { form: {} } },
		...(era === "modern" ? { versionNegotiation: { mode: "auto" as const } } : {}),
	});
	const elicitation = vi.fn(handler ?? (async () => response!));
	if (response !== null) client.setRequestHandler("elicitation/create", elicitation);
	const transport = new StreamableHTTPClientTransport(new URL(url), { requestInit: { headers: { Authorization: `Bearer ${TOKEN}` } } });
	closers.push(() => client.close());
	await client.connect(transport);
	expect(client.getProtocolEra()).toBe(era);
	return { client, transport, elicitation };
}
function data(result: { structuredContent?: Record<string, unknown> }) { return result.structuredContent?.result as Record<string, unknown>; }
function raw(url: string, body: object, headers: Record<string, string> = {}) {
	return new Promise<{ status: number; text: string }>((resolve, reject) => {
		const call = request(url, { method: "POST", headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json", Accept: "application/json, text/event-stream", ...headers } }, (response) => {
			let text = ""; response.setEncoding("utf8"); response.on("data", (chunk) => { text += chunk; }); response.on("end", () => resolve({ status: response.statusCode!, text }));
		});
		call.on("error", reject); call.end(JSON.stringify(body));
	});
}
const envelope = { "io.modelcontextprotocol/protocolVersion": "2026-07-28", "io.modelcontextprotocol/clientCapabilities": { elicitation: { form: {} } }, "io.modelcontextprotocol/clientInfo": { name: "raw-test", version: "1.0.0" } };
async function modernCall(url: string, args: Record<string, unknown>, extra: Record<string, unknown> = {}) {
	const response = await raw(url, { jsonrpc: "2.0", id: crypto.randomUUID(), method: "tools/call", params: { name: "create_entity", arguments: args, _meta: envelope, ...extra } }, { "MCP-Protocol-Version": "2026-07-28", "Mcp-Method": "tools/call", "Mcp-Name": "create_entity" });
	const payload = JSON.parse(response.text.startsWith("event:") || response.text.startsWith("data:") ? response.text.split("\n").find((line) => line.startsWith("data:"))!.slice(5) : response.text);
	return { ...response, payload };
}

describe.each(["legacy", "modern"] as const)("MCP over real HTTP: %s", (era) => {
	it("advertises exactly seven tools without deletion and reads with lazy full loading", async () => {
		const h = await fixture();
		h.records.set("feats:/feats/known", { ...structuredClone(mcpEntityTemplates.feats), url: "/feats/known" } as BaseItem);
		const { client } = await connect(h.url, era);
		expect((await client.listTools()).tools.map((tool) => tool.name).sort()).toEqual(["create_entity", "get_entity", "get_entity_schema", "list_audio_assets", "list_entity_types", "search_entities", "update_entity"]);
		const search = data(await client.callTool({ name: "search_entities", arguments: { query: "known" } }));
		expect(search.total).toBe(1); expect(h.fullLoads).not.toHaveBeenCalled();
		for (let i = 0; i < 2; i++) expect(data(await client.callTool({ name: "get_entity", arguments: { kind: "feats", url: "/feats/known" } }))).toHaveProperty("revision");
		expect(h.fullLoads).toHaveBeenCalledTimes(1);
		expect(await client.callTool({ name: "get_entity", arguments: { kind: "feats", url: "https://unknown.example/feats" } })).toMatchObject({ isError: true });
		expect(h.fullLoads).toHaveBeenCalledTimes(1);
		expect(data(await client.callTool({ name: "get_entity_schema", arguments: { kind: "feats" } }))).toHaveProperty("schema");
	});
	it("creates and updates only after individual explicit confirmations", async () => {
		const h = await fixture(), { client, elicitation } = await connect(h.url, era);
		const created = data(await client.callTool({ name: "create_entity", arguments: { kind: "feats", data: structuredClone(mcpEntityTemplates.feats) } }));
		expect(created).toHaveProperty("url"); expect(h.writes).toHaveBeenCalledTimes(1); expect(elicitation).toHaveBeenCalledTimes(1);
		const read = data(await client.callTool({ name: "get_entity", arguments: { kind: "feats", url: created.url } }));
		const updated = await client.callTool({ name: "update_entity", arguments: { kind: "feats", url: created.url, expectedRevision: read.revision, data: { ...(read.data as object), description: "Updated" } } });
		expect(updated.isError).not.toBe(true); expect(h.writes).toHaveBeenCalledTimes(2); expect(elicitation).toHaveBeenCalledTimes(2);
	});
	it("adds an unregistered vault file to a track and then a playlist", async () => {
		const h = await fixture();
		const path = "Music/adventure_begins_loop.mp3"; h.vaultFiles.push(path);
		const { client, elicitation } = await connect(h.url, era);
		expect(data(await client.callTool({ name: "list_audio_assets", arguments: {} }))).toEqual([{ id: null, path, alias: "adventure_begins_loop" }]);
		const created = await client.callTool({ name: "create_entity", arguments: { kind: "track", data: { ...structuredClone(mcpEntityTemplates.track), normalAudioPath: path } } });
		expect(created.isError).not.toBe(true);
		const assets = data(await client.callTool({ name: "list_audio_assets", arguments: {} })) as unknown as Array<{ id: string }>;
		expect(assets[0].id).toEqual(expect.any(String));
		expect(data(await client.callTool({ name: "get_entity", arguments: { kind: "track", url: "/track/new-id" } })).data).toMatchObject({ normalAudioId: assets[0].id });
		const playlist = await client.callTool({ name: "create_entity", arguments: { kind: "playlist", data: { ...structuredClone(mcpEntityTemplates.playlist), items: [{ id: "first", trackId: "new-id" }] } } });
		expect(playlist.isError).not.toBe(true); expect(elicitation).toHaveBeenCalledTimes(2);
	});
	it("does not register the selected file when track creation is declined", async () => {
		const h = await fixture(); h.vaultFiles.push("Music/new.mp3");
		const { client } = await connect(h.url, era, { action: "decline" });
		const created = await client.callTool({ name: "create_entity", arguments: { kind: "track", data: { ...structuredClone(mcpEntityTemplates.track), normalAudioPath: "Music/new.mp3" } } });
		expect(created.isError).toBe(true);
		expect(h.entities.listAudioAssets()).toEqual([{ id: null, path: "Music/new.mp3", alias: "new" }]);
		expect((await h.entities.searchEntities("", ["track"])).total).toBe(0);
	});
	it.each(["bestiary", "adventure"] as const)("shows a compact confirmation for large %s content", async (kind) => {
		const h = await fixture(), { client, elicitation } = await connect(h.url, era);
		const hiddenContent = "Содержимое, которое не должно попасть в запрос разрешения. ".repeat(500);
		const payload = kind === "bestiary"
			? { ...structuredClone(mcpEntityTemplates.bestiary), name: { rus: "Огр", eng: "Ogre" }, description: hiddenContent }
			: { ...structuredClone(mcpEntityTemplates.adventure), name: "Поход", campaignName: hiddenContent };
		const created = await client.callTool({ name: "create_entity", arguments: { kind, data: payload } });
		expect(created.isError).not.toBe(true);
		const request = elicitation.mock.calls[0][0] as { params: { message: string } };
		expect(request.params.message).toBe(`Тип сущности: ${kind === "bestiary" ? "Существо (статблок)" : "Приключение"}\nИмя: ${kind === "bestiary" ? "Огр" : "Поход"}\nТип изменения: Создание`);
		expect(request.params.message).not.toContain(hiddenContent);
		const read = data(await client.callTool({ name: "get_entity", arguments: { kind, url: data(created).url } }));
		await client.callTool({ name: "update_entity", arguments: { kind, url: read.url, expectedRevision: read.revision, data: read.data } });
		const update = elicitation.mock.calls[1][0] as { params: { message: string } };
		expect(update.params.message).toContain("Тип изменения: Изменение");
		expect(update.params.message).not.toContain(hiddenContent);
	});
	it.each([{ action: "decline" }, { action: "cancel" }, { action: "accept", content: { confirm: false } }] as ElicitResult[])("does not write after %j", async (response) => {
		const h = await fixture(), { client } = await connect(h.url, era, response);
		const result = await client.callTool({ name: "create_entity", arguments: { kind: "feats", data: structuredClone(mcpEntityTemplates.feats) } });
		expect(result).toMatchObject({ isError: true }); expect(h.writes).not.toHaveBeenCalled();
	});
	it("cannot write when the client has no elicitation capability", async () => {
		const h = await fixture(), { client } = await connect(h.url, era, null);
		const result = await client.callTool({ name: "create_entity", arguments: { kind: "feats", data: structuredClone(mcpEntityTemplates.feats) } }).catch((error: Error) => error);
		expect(result instanceof Error || (result as { isError?: boolean }).isError).toBeTruthy(); expect(h.writes).not.toHaveBeenCalled();
	});
});

describe("MCP HTTP boundary and lifecycle", () => {
	it("rejects missing/wrong tokens, forged Host, hostile Origin and other paths", async () => {
		const h = await fixture();
		for (const [headers, status] of [[{ Authorization: "" }, 401], [{ Authorization: "Bearer wrong" }, 401], [{ Host: "evil.example" }, 403], [{ Origin: "https://evil.example" }, 403]] as const) expect((await raw(h.url, {}, headers)).status).toBe(status);
		expect((await raw(h.url.replace("/mcp", "/other"), {})).status).toBe(404);
	});
	it("stops and restarts on the same configured port", async () => {
		const h = await fixture();
		await connect(h.url, "legacy"); await h.server.stop();
		expect(await h.server.start(h.port)).toBe(h.port);
		const { client } = await connect(h.url, "modern"); expect((await client.listTools()).tools).toHaveLength(7);
	});
	it("invalidates a pending confirmation when stopped", async () => {
		const h = await fixture();
		let release!: (value: ElicitResult) => void;
		let prompted!: () => void;
		const prompt = new Promise<void>((resolve) => { prompted = resolve; });
		const { client } = await connect(h.url, "modern", { action: "accept", content: { confirm: true } }, async () => { prompted(); return new Promise((resolve) => { release = resolve; }); });
		const writing = client.callTool({ name: "create_entity", arguments: { kind: "feats", data: structuredClone(mcpEntityTemplates.feats) } }).catch((error: Error) => error);
		await prompt; await h.server.stop(); release({ action: "accept", content: { confirm: true } });
		await writing; expect(h.writes).not.toHaveBeenCalled();
	});
	it("rejects forged modern input responses without a server challenge", async () => {
		const h = await fixture();
		const response = await modernCall(h.url, { kind: "feats", data: structuredClone(mcpEntityTemplates.feats) }, { inputResponses: { confirm: { action: "accept", content: { confirm: true } } } });
		expect(response.payload.result?.isError || response.payload.error).toBeTruthy(); expect(h.writes).not.toHaveBeenCalled();
	});
	it("binds modern challenges to exact arguments and refuses replay", async () => {
		const h = await fixture(), args = { kind: "feats", data: structuredClone(mcpEntityTemplates.feats) };
		const challenge = await modernCall(h.url, args);
		expect(challenge.payload.result).toMatchObject({ resultType: "input_required", requestState: expect.any(String) });
		const extra = { requestState: challenge.payload.result.requestState, inputResponses: { confirm: { action: "accept", content: { confirm: true } } } };
		const tampered = await modernCall(h.url, { ...args, data: { ...args.data, description: "tampered" } }, extra);
		expect(tampered.payload.result?.isError || tampered.payload.error).toBeTruthy(); expect(h.writes).not.toHaveBeenCalled();
		const replay = await modernCall(h.url, args, extra);
		expect(replay.payload.result?.isError || replay.payload.error).toBeTruthy(); expect(h.writes).not.toHaveBeenCalled();
	});
	it("rejects expired confirmation without writing", async () => {
		const h = await fixture(), args = { kind: "feats", data: structuredClone(mcpEntityTemplates.feats) };
		const challenge = await modernCall(h.url, args);
		const now = Date.now();
		const clock = vi.spyOn(Date, "now").mockReturnValue(now + 5 * 60_000 + 1);
		try {
			const answer = await modernCall(h.url, args, { requestState: challenge.payload.result.requestState, inputResponses: { confirm: { action: "accept", content: { confirm: true } } } });
			expect(answer.payload.result?.isError || answer.payload.error).toBeTruthy();
			expect(h.writes).not.toHaveBeenCalled();
		} finally { clock.mockRestore(); }
	});
	it("does not apply a successful modern confirmation twice", async () => {
		const h = await fixture(), args = { kind: "feats", data: structuredClone(mcpEntityTemplates.feats) };
		const challenge = await modernCall(h.url, args);
		const extra = { requestState: challenge.payload.result.requestState, inputResponses: { confirm: { action: "accept", content: { confirm: true } } } };
		const saved = await modernCall(h.url, args, extra);
		expect(saved.payload.result?.isError).not.toBe(true);
		expect(h.writes).toHaveBeenCalledOnce();
		const replay = await modernCall(h.url, args, extra);
		expect(replay.payload.result?.isError || replay.payload.error).toBeTruthy();
		expect(h.writes).toHaveBeenCalledOnce();
	});
	it("rejects oversized and non-JSON requests before the SDK", async () => {
		const h = await fixture();
		expect((await raw(h.url, { data: "x".repeat(1_048_576) })).status).toBe(413);
		expect((await raw(h.url, {}, { "Content-Type": "text/plain" })).status).toBe(415);
		expect(h.writes).not.toHaveBeenCalled();
	});
	it("cancels a listener startup when stopped before listen completes", async () => {
		const h = await fixture();
		await h.server.stop();
		const starting = h.server.start(h.port);
		await h.server.stop();
		await expect(starting).rejects.toThrow("отменён");
		// The canceled listener released its port, so it can be bound again.
		expect(await h.server.start(h.port)).toBe(h.port);
	});
	it("validates runtime availability without loading a separate process", () => {
		expect(mcpUnavailableReason(false, "22.0.0")).toContain("настольном"); expect(mcpUnavailableReason(true, "18.0.0")).toContain("20"); expect(mcpUnavailableReason(true, "20.19.0")).toBeNull();
	});
});
