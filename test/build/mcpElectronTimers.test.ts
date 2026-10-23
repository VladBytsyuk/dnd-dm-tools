// @vitest-environment node
import { build } from "esbuild";
import { createRequire } from "node:module";
import { randomInt } from "node:crypto";
import { runInThisContext } from "node:vm";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import type { McpIntegrationServer } from "src/data/mcp/McpIntegrationServer";
import type { McpEntities } from "src/data/mcp/McpEntities";

type ServerConstructor = new (entities: McpEntities, version: string, token: string) => McpIntegrationServer;
let bundledSource: string;
beforeAll(async () => {
	const result = await build({
		entryPoints: ["src/data/mcp/McpIntegrationServer.ts"], bundle: true, write: false,
		format: "cjs", platform: "node", target: "es2018", minify: true,
	});
	bundledSource = result.outputFiles[0].text;
});

describe("production MCP in the Obsidian renderer", () => {
	it.each(["legacy", "modern"] as const)("starts, serves %s clients and restarts when global timers return numeric IDs", async era => {
		// Electron exposes browser timers even though Node builtins are available.
		const browserSetInterval = vi.fn(() => 42);
		const browserClearInterval = vi.fn();
		const module = { exports: {} as { McpIntegrationServer: ServerConstructor } };
		const evaluate = runInThisContext(`(function(module, exports, require, setInterval, clearInterval) { ${bundledSource}\n })`);
		evaluate(module, module.exports, createRequire(import.meta.url), browserSetInterval, browserClearInterval);
		const token = "electron-timer-regression-".repeat(3);
		const entities = { listEntityTypes: () => [] } as unknown as McpEntities;
		const server = new module.exports.McpIntegrationServer(entities, "test", token);
		const clients: Client[] = [];
		try {
			// Keep the listener outside the usual client ephemeral-port range, so
			// parallel HTTP tests cannot claim its port between stop and restart.
			let port = 0;
			for (let attempt = 0; attempt < 10 && !port; attempt++) {
				try { port = await server.start(randomInt(10_000, 20_000)); }
				catch (error) { if ((error as NodeJS.ErrnoException).code !== "EADDRINUSE") throw error; }
			}
			expect(port).toBeGreaterThan(0);
			for (let attempt = 0; attempt < 2; attempt++) {
				if (attempt) expect(await server.start(port)).toBe(port);
				const client = new Client({ name: "electron-timer-test", version: "test" }, {
					capabilities: {}, ...(era === "modern" ? { versionNegotiation: { mode: "auto" as const } } : {}),
				});
				clients.push(client);
				await client.connect(new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${port}/mcp`), {
					// Avoid reusing a fetch-pool socket closed by the immediate restart.
					requestInit: { headers: { Authorization: `Bearer ${token}`, Connection: "close" } },
				}));
				expect(client.getProtocolEra()).toBe(era);
				expect((await client.listTools()).tools).toHaveLength(13);
				await client.close();
				await server.stop();
			}
		} finally {
			await Promise.allSettled(clients.map(client => client.close()));
			await server.stop();
		}
	});
});
