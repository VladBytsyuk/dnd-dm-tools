import { beforeEach, describe, expect, it, vi } from "vitest";
import { waitFor } from "@testing-library/dom";
import DndStatblockPlugin from "src/main";
import { createDefaultPluginSettings } from "src/domain/models/settings/PluginSettings";

const mocks = vi.hoisted(() => ({
	start: vi.fn<[number], Promise<number>>(),
	stop: vi.fn<[], Promise<void>>(),
	createServer: vi.fn(),
	unavailable: vi.fn<[], string | null>(),
}));

vi.mock("obsidian", async () => ({
	...await import("./__mocks__/obsidian"),
	Platform: { isDesktopApp: true },
	PluginSettingTab: class {}, ItemView: class {}, Modal: class {}, AbstractInputSuggest: class {},
}));
vi.mock("src/data/mcp/McpEntities", () => ({ McpEntities: class {} }));
vi.mock("src/data/mcp/McpIntegrationServer", () => ({
	mcpUnavailableReason: mocks.unavailable,
	McpIntegrationServer: class {
		constructor(...args: unknown[]) { mocks.createServer(...args); }
		start = mocks.start;
		stop = mocks.stop;
	},
}));

beforeEach(() => {
	vi.clearAllMocks();
	mocks.start.mockReset().mockResolvedValue(43127);
	mocks.stop.mockReset().mockResolvedValue(undefined);
	mocks.unavailable.mockReset().mockReturnValue(null);
});

function pluginWithSettings() {
	const plugin = new DndStatblockPlugin({} as any);
	const saveData = vi.fn(async () => {});
	Object.assign(plugin, { settings: createDefaultPluginSettings(), manifest: { version: "1.3.6" }, saveData, getMcpEntities: () => ({}) });
	for (const key of ["bestiaryFeature", "spellbookFeature", "arsenalFeature", "armoryFeature", "equipmentFeature", "artifactoryFeature", "backgroundFeature", "featFeature", "raceFeature"]) {
		Object.assign(plugin, { [key]: { repository: {} } });
	}
	return { plugin, saveData };
}

describe("plugin MCP lifecycle", () => {
	it("does not start a server with the default disabled setting", async () => {
		const { plugin } = pluginWithSettings();
		await plugin.retryMcp();
		expect(mocks.createServer).not.toHaveBeenCalled();
		expect(plugin.getMcpRuntimeStatus()).toEqual({ running: false, port: null });
	});

	it("generates credentials once and reuses the saved token and port on restart", async () => {
		const { plugin, saveData } = pluginWithSettings();
		await plugin.setMcpEnabled(true);
		const token = plugin.getSettings().mcp.authToken;
		expect(token).toMatch(/^[a-f0-9]{64}$/);
		expect(mocks.start).toHaveBeenNthCalledWith(1, 0);
		expect(plugin.getMcpRuntimeStatus()).toEqual({ running: true, port: 43127 });
		expect(plugin.getSettings().mcp.port).toBe(43127);
		await plugin.retryMcp();
		expect(mocks.start).toHaveBeenNthCalledWith(2, 43127);
		expect(mocks.createServer.mock.calls.map(call => call[2])).toEqual([token, token]);
		expect(saveData).toHaveBeenCalled();
		expect(plugin.getSettings().mcp.authToken).toBe(token);
	});

	it("stops when disabled and releases runtime listeners", async () => {
		const { plugin } = pluginWithSettings();
		await plugin.setMcpEnabled(true);
		const listener = vi.fn();
		const unsubscribe = plugin.subscribeMcpRuntimeStatus(listener);
		await plugin.setMcpEnabled(false);
		expect(mocks.stop).toHaveBeenCalledOnce();
		expect(mocks.createServer).toHaveBeenCalledOnce();
		expect(plugin.getMcpRuntimeStatus()).toEqual({ running: false, port: 43127 });
		expect(listener).toHaveBeenCalledOnce();
		unsubscribe();
		await plugin.retryMcp();
		expect(listener).toHaveBeenCalledOnce();
	});

	it("revokes server access before a queued settings save completes", async () => {
		const { plugin, saveData } = pluginWithSettings();
		await plugin.setMcpEnabled(true);
		let release!: () => void;
		saveData.mockImplementationOnce(() => new Promise<void>((resolve) => { release = resolve; }));
		const disabling = plugin.setMcpEnabled(false);
		expect(mocks.stop).toHaveBeenCalledOnce();
		await waitFor(() => expect(release).toBeTypeOf("function"));
		release();
		await disabling;
		expect(plugin.getMcpRuntimeStatus().running).toBe(false);
	});
	it("reuses persisted connection parameters in a fresh plugin instance", async () => {
		const first = pluginWithSettings().plugin;
		await first.setMcpEnabled(true);
		const persisted = structuredClone(first.getSettings());
		const restarted = pluginWithSettings().plugin;
		Object.assign(restarted, { settings: persisted });
		await restarted.retryMcp();
		expect(mocks.start).toHaveBeenNthCalledWith(2, persisted.mcp.port);
		expect(mocks.createServer.mock.calls[1][2]).toBe(persisted.mcp.authToken);
		expect(restarted.getSettings().mcp).toEqual(persisted.mcp);
	});

	it("keeps the stored endpoint and token when a port is occupied and retries them", async () => {
		const { plugin } = pluginWithSettings();
		Object.assign(plugin.getSettings().mcp, { enabled: true, port: 43129, authToken: "saved-token" });
		mocks.start.mockRejectedValueOnce(new Error("EADDRINUSE"));
		await plugin.retryMcp();
		expect(plugin.getMcpRuntimeStatus()).toEqual({ running: false, port: 43129, error: "EADDRINUSE" });
		expect(plugin.getSettings().mcp).toEqual({ enabled: true, readOnly: false, port: 43129, authToken: "saved-token" });
		mocks.start.mockResolvedValueOnce(43129);
		await plugin.retryMcp();
		expect(mocks.start.mock.calls).toEqual([[43129], [43129]]);
		expect(plugin.getMcpRuntimeStatus()).toEqual({ running: true, port: 43129 });
	});

	it("rejects enabling an unsupported runtime before saving or starting", async () => {
		const { plugin, saveData } = pluginWithSettings();
		mocks.unavailable.mockReturnValue("Node.js 20 required");
		await expect(plugin.setMcpEnabled(true)).rejects.toThrow("Node.js 20 required");
		expect(plugin.getSettings().mcp.enabled).toBe(false);
		expect(saveData).not.toHaveBeenCalled();
		expect(mocks.createServer).not.toHaveBeenCalled();
	});

	it("stops an in-flight startup when the user disables MCP", async () => {
		const { plugin } = pluginWithSettings();
		let finishStart!: (port: number) => void;
		mocks.start.mockImplementationOnce(() => new Promise(resolve => { finishStart = resolve; }));
		const enabling = plugin.setMcpEnabled(true);
		await waitFor(() => expect(mocks.start).toHaveBeenCalledOnce());
		const disabling = plugin.setMcpEnabled(false);
		finishStart(43127);
		await Promise.all([enabling, disabling]);
		expect(plugin.getSettings().mcp.enabled).toBe(false);
		expect(plugin.getMcpRuntimeStatus().running).toBe(false);
		expect(mocks.stop).toHaveBeenCalled();
		expect(mocks.createServer).toHaveBeenCalledOnce();
	});

	it("validates and applies a port change after revoking the old server", async () => {
		const { plugin, saveData } = pluginWithSettings();
		await plugin.setMcpEnabled(true);
		await expect(plugin.setMcpPort(80)).rejects.toThrow("1024");
		expect(mocks.stop).not.toHaveBeenCalled();
		mocks.start.mockResolvedValueOnce(43128);
		await plugin.setMcpPort(43128);
		expect(mocks.start).toHaveBeenLastCalledWith(43128);
		expect(mocks.stop).toHaveBeenCalledOnce();
		expect(plugin.getSettings().mcp.port).toBe(43128);
		const calls = saveData.mock.invocationCallOrder;
		expect(mocks.stop.mock.invocationCallOrder[0]).toBeLessThan(calls[calls.length - 2]);
		await plugin.setMcpPort(null);
		expect(mocks.start).toHaveBeenLastCalledWith(0);
	});

	it("rotates credentials and restarts with read-only mode", async () => {
		const { plugin } = pluginWithSettings();
		await plugin.setMcpEnabled(true);
		const token = plugin.getSettings().mcp.authToken;
		await plugin.rotateMcpToken();
		expect(plugin.getSettings().mcp.authToken).not.toBe(token);
		expect(mocks.createServer.mock.calls[1][2]).toBe(plugin.getSettings().mcp.authToken);
		await plugin.setMcpReadOnly(true);
		expect(plugin.getSettings().mcp.readOnly).toBe(true);
		expect(mocks.createServer.mock.calls[2][3]).toBe(true);
		expect(mocks.stop).toHaveBeenCalledTimes(2);
	});

	it("fails closed when saving changed configuration fails", async () => {
		const { plugin, saveData } = pluginWithSettings();
		await plugin.setMcpEnabled(true);
		saveData.mockRejectedValueOnce(new Error("Disk full"));
		const change = plugin.rotateMcpToken();
		expect(mocks.stop).toHaveBeenCalledOnce();
		await expect(change).rejects.toThrow("Disk full");
		expect(mocks.createServer).toHaveBeenCalledOnce();
		expect(plugin.getMcpRuntimeStatus()).toMatchObject({ running: false, error: "Disk full" });
	});

	it("applies concurrent configuration changes serially and starts only the newest configuration", async () => {
		const { plugin } = pluginWithSettings();
		await plugin.setMcpEnabled(true);
		const mode = plugin.setMcpReadOnly(true);
		const port = plugin.setMcpPort(43130);
		mocks.start.mockResolvedValueOnce(43130);
		await Promise.all([mode, port]);
		expect(plugin.getSettings().mcp).toMatchObject({ readOnly: true, port: 43130 });
		expect(mocks.createServer).toHaveBeenCalledTimes(2);
		expect(mocks.createServer.mock.calls[1][3]).toBe(true);
		expect(mocks.start).toHaveBeenLastCalledWith(43130);
	});

	it("waits for revocation to finish before persisting a new configuration", async () => {
		const { plugin, saveData } = pluginWithSettings();
		await plugin.setMcpEnabled(true);
		const savedBefore = saveData.mock.calls.length;
		let finishStop!: () => void;
		mocks.stop.mockImplementationOnce(() => new Promise(resolve => { finishStop = resolve; }));
		const change = plugin.setMcpReadOnly(true);
		expect(mocks.stop).toHaveBeenCalledOnce();
		await Promise.resolve();
		expect(saveData).toHaveBeenCalledTimes(savedBefore);
		finishStop();
		await change;
		expect(plugin.getSettings().mcp.readOnly).toBe(true);
	});

	it("invalidates an in-flight startup before changing to read-only", async () => {
		const { plugin } = pluginWithSettings();
		let finishStart!: (port: number) => void;
		mocks.start.mockImplementationOnce(() => new Promise(resolve => { finishStart = resolve; }));
		const enabling = plugin.setMcpEnabled(true);
		await waitFor(() => expect(mocks.start).toHaveBeenCalledOnce());
		const change = plugin.setMcpReadOnly(true);
		expect(mocks.stop).toHaveBeenCalledOnce();
		finishStart(43128);
		await Promise.all([enabling, change]);
		expect(mocks.createServer.mock.calls.map(call => call[3])).toEqual([false, true]);
		expect(plugin.getMcpRuntimeStatus()).toEqual({ running: true, port: 43127 });
	});
});
