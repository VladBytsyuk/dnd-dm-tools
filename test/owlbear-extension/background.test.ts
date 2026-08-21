import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const backgroundMock = vi.hoisted(() => {
	let readyChange: ((ready: boolean) => void) | null = null;

	class FakeBroadcastChannel {
		static instances: FakeBroadcastChannel[] = [];
		private readonly listeners: Array<(event: MessageEvent) => void> = [];
		readonly messages: unknown[] = [];

		constructor(_name: string) {
			FakeBroadcastChannel.instances.push(this);
		}

		addEventListener(_type: string, listener: (event: MessageEvent) => void): void {
			this.listeners.push(listener);
		}

		postMessage(message: unknown): void { this.messages.push(message); }

		emit(data: unknown): void {
			for (const listener of this.listeners) listener({ data } as MessageEvent);
		}
	}

	class FakeWebSocket {
		static readonly CONNECTING = 0;
		static readonly OPEN = 1;
		static readonly CLOSING = 2;
		static readonly CLOSED = 3;
		static instances: FakeWebSocket[] = [];
		readyState = FakeWebSocket.CONNECTING;
		onopen: (() => void) | null = null;
		onmessage: ((event: { data: unknown }) => void) | null = null;
		onerror: (() => void) | null = null;
		onclose: ((event: CloseEvent) => void) | null = null;
		readonly sent: Record<string, unknown>[] = [];
		readonly url: string;

		constructor(url: string) {
			this.url = url;
			FakeWebSocket.instances.push(this);
		}

		send(value: string): void {
			this.sent.push(JSON.parse(value) as Record<string, unknown>);
		}

		close(): void {
			this.readyState = FakeWebSocket.CLOSED;
		}

		open(): void {
			this.readyState = FakeWebSocket.OPEN;
			this.onopen?.();
		}

		message(value: Record<string, unknown>): void {
			this.onmessage?.({ data: JSON.stringify({ protocolVersion: 2, messageId: "message-1", ...value }) });
		}
	}

	const obr = {
		onReady: vi.fn((callback: () => void | Promise<void>) => { void callback(); }),
		scene: {
			isReady: vi.fn(),
			setMetadata: vi.fn(),
			onReadyChange: vi.fn((callback: (ready: boolean) => void) => {
				readyChange = callback;
				return () => {};
			}),
		},
	};
	const pushSnapshotToScene = vi.fn();
	const clearManagedSceneItems = vi.fn();
	const pushPreviewToScene = vi.fn();
	const clearPreviewFromScene = vi.fn();

	return {
		FakeBroadcastChannel,
		FakeWebSocket,
		obr,
		pushSnapshotToScene,
		clearManagedSceneItems,
		pushPreviewToScene,
		clearPreviewFromScene,
		getReadyChange: () => readyChange,
		resetReadyChange: () => { readyChange = null; },
	};
});

vi.mock("@owlbear-rodeo/sdk", () => ({ default: backgroundMock.obr }));
vi.mock("../../owlbear-extension/src/owlbearSync", () => ({
	pushSnapshotToScene: backgroundMock.pushSnapshotToScene,
	clearManagedSceneItems: backgroundMock.clearManagedSceneItems,
}));
vi.mock("../../owlbear-extension/src/previewSync", () => ({
	pushPreviewToScene: backgroundMock.pushPreviewToScene,
	clearPreviewFromScene: backgroundMock.clearPreviewFromScene,
}));

function diagnostics(sceneReady: boolean) {
	return {
		sceneReady,
		snapshotLoaded: true,
		linkedCount: 0,
		participantCount: 0,
		staleTokenIds: [],
		missingParticipantIds: [],
		fallbackParticipantIds: [],
		lastError: sceneReady ? undefined : "No active Owlbear scene.",
	};
}

function snapshot() {
	return {
		schemaVersion: 1 as const,
		snapshotId: "snapshot-1",
		encounterId: "encounter-1",
		encounterName: "Test",
		round: 1,
		activeParticipantId: null,
		nextParticipantId: null,
		createdAt: "2026-08-14T00:00:00.000Z",
		participants: [],
		tokenLinks: [],
	};
}

async function loadConnectedBackground() {
	localStorage.setItem("dnd-dm-tools.owlbear.pairing", `dnd-dm-tools:v1:43125:${"a".repeat(32)}`);
	await import("../../owlbear-extension/src/background");
	await vi.waitFor(() => expect(backgroundMock.obr.scene.onReadyChange).toHaveBeenCalledOnce());
	const socket = backgroundMock.FakeWebSocket.instances[0];
	socket.open();
	socket.message({ type: "server.ready" });
	return socket;
}

beforeEach(() => {
	vi.resetModules();
	localStorage.clear();
	backgroundMock.FakeBroadcastChannel.instances = [];
	backgroundMock.FakeWebSocket.instances = [];
	backgroundMock.resetReadyChange();
	backgroundMock.obr.onReady.mockClear();
	backgroundMock.obr.scene.isReady.mockReset().mockResolvedValue(true);
	backgroundMock.obr.scene.setMetadata.mockReset().mockResolvedValue(undefined);
	backgroundMock.obr.scene.onReadyChange.mockClear();
	backgroundMock.pushSnapshotToScene.mockReset();
	backgroundMock.clearManagedSceneItems.mockReset().mockResolvedValue(undefined);
	backgroundMock.pushPreviewToScene.mockReset();
	backgroundMock.clearPreviewFromScene.mockReset().mockResolvedValue(undefined);
	vi.stubGlobal("BroadcastChannel", backgroundMock.FakeBroadcastChannel);
	vi.stubGlobal("WebSocket", backgroundMock.FakeWebSocket);
});

afterEach(() => {
	vi.unstubAllGlobals();
	localStorage.clear();
});

describe("Owlbear background synchronization", () => {
	it("connects v2 pairing through the current Quick Tunnel WebSocket", async () => {
		const secret = "s".repeat(32);
		localStorage.setItem("dnd-dm-tools.owlbear.pairing", `dnd-dm-tools:v2:test.trycloudflare.com:${secret}:${"a".repeat(32)}`);

		await import("../../owlbear-extension/src/background");

		expect(backgroundMock.FakeWebSocket.instances[0].url).toBe(`wss://test.trycloudflare.com/assets/${secret}/ws`);
	});

	it("asks for a fresh v2 code when the tunnel endpoint is unavailable", async () => {
		localStorage.setItem("dnd-dm-tools.owlbear.pairing", `dnd-dm-tools:v2:test.trycloudflare.com:${"s".repeat(32)}:${"a".repeat(32)}`);
		await import("../../owlbear-extension/src/background");
		const channel = backgroundMock.FakeBroadcastChannel.instances[0];

		backgroundMock.FakeWebSocket.instances[0].onerror?.();

		expect(channel.messages).toContainEqual(expect.objectContaining({
			type: "runtime.state",
			state: expect.objectContaining({ lastError: expect.stringContaining("скопируйте новый код сопряжения") }),
		}));
	});

	it("stops automatic reconnection after three failed attempts", async () => {
		vi.useFakeTimers();
		localStorage.setItem("dnd-dm-tools.owlbear.pairing", `dnd-dm-tools:v2:test.trycloudflare.com:${"s".repeat(32)}:${"a".repeat(32)}`);
		await import("../../owlbear-extension/src/background");
		const channel = backgroundMock.FakeBroadcastChannel.instances[0];

		for (let attempt = 0; attempt < 3; attempt += 1) {
			backgroundMock.FakeWebSocket.instances.at(-1)?.onclose?.({ code: 1006, reason: "" } as CloseEvent);
			await vi.advanceTimersByTimeAsync(30_000);
		}
		backgroundMock.FakeWebSocket.instances.at(-1)?.onclose?.({ code: 1006, reason: "" } as CloseEvent);

		expect(backgroundMock.FakeWebSocket.instances).toHaveLength(4);
		expect(channel.messages).toContainEqual(expect.objectContaining({
			type: "runtime.state",
			state: expect.objectContaining({ lastError: expect.stringContaining("после 3 попыток") }),
		}));
	});

	it("does not acknowledge or store a snapshot when the scene is not ready", async () => {
		backgroundMock.pushSnapshotToScene.mockResolvedValue({ diagnostics: diagnostics(false), tokenLinks: [] });
		const socket = await loadConnectedBackground();

		socket.message({ type: "snapshot.publish", snapshotId: "snapshot-1", snapshot: snapshot() });

		await vi.waitFor(() => expect(socket.sent.some((message) => message.type === "snapshot.failed")).toBe(true));
		const { state } = await import("../../owlbear-extension/src/state");
		expect(state.snapshot).toBeNull();
		expect(socket.sent.some((message) => message.type === "snapshot.applied")).toBe(false);
		expect(backgroundMock.obr.scene.setMetadata).not.toHaveBeenCalled();
	});

	it("publishes a sanitized initiative after scene synchronization", async () => {
		backgroundMock.pushSnapshotToScene.mockResolvedValue({ diagnostics: diagnostics(true), tokenLinks: [] });
		const socket = await loadConnectedBackground();
		const current = snapshot();
		current.participants = [{
			participantId: 1,
			name: "Goblin",
			initiative: 12,
			hpCurrent: 10,
			hpMax: 10,
			hpTemporary: 2,
			armorClass: 15,
			side: "enemy",
			isDead: false,
			conditions: [],
		}];

		socket.message({ type: "snapshot.publish", snapshotId: current.snapshotId, snapshot: current });

		await vi.waitFor(() => expect(backgroundMock.obr.scene.setMetadata).toHaveBeenCalledOnce());
		const metadata = backgroundMock.obr.scene.setMetadata.mock.calls[0][0];
		expect(JSON.stringify(metadata)).not.toContain("hpCurrent");
		expect(socket.sent.some((message) => message.type === "snapshot.applied")).toBe(true);
	});

	it("clears the public initiative when Obsidian has no current snapshot", async () => {
		const socket = await loadConnectedBackground();
		socket.message({ type: "snapshot.empty" });

		await vi.waitFor(() => expect(backgroundMock.obr.scene.setMetadata).toHaveBeenCalledWith(expect.objectContaining({ "club.ttg.dnd-dm-tools/publicInitiative": null })));
	});

	it("does not acknowledge a snapshot until public initiative metadata is stored", async () => {
		backgroundMock.pushSnapshotToScene.mockResolvedValue({ diagnostics: diagnostics(true), tokenLinks: [] });
		backgroundMock.obr.scene.setMetadata.mockRejectedValueOnce(new Error("metadata unavailable"));
		const socket = await loadConnectedBackground();

		socket.message({ type: "snapshot.publish", snapshotId: "snapshot-1", snapshot: snapshot() });

		await vi.waitFor(() => expect(socket.sent.some((message) => message.type === "snapshot.failed")).toBe(true));
		expect(socket.sent.some((message) => message.type === "snapshot.applied")).toBe(false);
	});

	it("requests the latest snapshot when the scene becomes ready", async () => {
		const socket = await loadConnectedBackground();
		socket.sent.length = 0;

		backgroundMock.getReadyChange()?.(false);
		backgroundMock.getReadyChange()?.(true);

		expect(socket.sent.filter((message) => message.type === "snapshot.request")).toHaveLength(1);
	});

	it("performs a full scene push for the reconnect command", async () => {
		backgroundMock.pushSnapshotToScene.mockResolvedValue({ diagnostics: diagnostics(true), tokenLinks: [] });
		const socket = await loadConnectedBackground();
		const current = snapshot();
		socket.message({ type: "snapshot.publish", snapshotId: current.snapshotId, snapshot: current });
		await vi.waitFor(() => expect(backgroundMock.pushSnapshotToScene).toHaveBeenCalledOnce());
		backgroundMock.pushSnapshotToScene.mockClear();

		backgroundMock.FakeBroadcastChannel.instances[0].emit({ type: "ui.command", command: "reconnect" });

		await vi.waitFor(() => expect(backgroundMock.pushSnapshotToScene).toHaveBeenCalledWith(current, null));
	});

	it("acknowledges preview publication after applying the scene overlay", async () => {
		backgroundMock.pushPreviewToScene.mockResolvedValue(undefined);
		const socket = await loadConnectedBackground();
		socket.message({
			type: "preview.publish",
			previewId: "preview-1",
			preview: {
				schemaVersion: 1,
				previewId: "preview-1",
				name: "Handout",
				createdAt: "2026-08-17T00:00:00.000Z",
				imageMime: "image/png",
				imageWidth: 100,
				imageHeight: 100,
				imageUrl: "https://example.com/handout.png",
			},
		});

		await vi.waitFor(() => expect(socket.sent.some((message) => message.type === "preview.applied" && message.previewId === "preview-1")).toBe(true));
	});

	it("clears managed scene items and acknowledges a server cleanup command", async () => {
		const socket = await loadConnectedBackground();
		socket.message({ type: "scene.clear", clearId: "clear-1" });

		await vi.waitFor(() => expect(backgroundMock.clearManagedSceneItems).toHaveBeenCalledOnce());
		expect(socket.sent).toContainEqual(expect.objectContaining({ type: "scene.applied", clearId: "clear-1" }));
		const { state } = await import("../../owlbear-extension/src/state");
		expect(state.snapshot).toBeNull();
	});

	it("clears managed scene items before a manual Owlbear disconnect", async () => {
		const socket = await loadConnectedBackground();

		backgroundMock.FakeBroadcastChannel.instances[0].emit({ type: "ui.command", command: "disconnect" });

		await vi.waitFor(() => expect(backgroundMock.clearManagedSceneItems).toHaveBeenCalledOnce());
		expect(backgroundMock.obr.scene.setMetadata).toHaveBeenCalledWith(expect.objectContaining({ "club.ttg.dnd-dm-tools/publicInitiative": null }));
		expect(socket.readyState).toBe(backgroundMock.FakeWebSocket.CLOSED);
	});

	it("closes the socket without writing metadata when no scene is active", async () => {
		backgroundMock.obr.scene.isReady.mockResolvedValue(false);
		const socket = await loadConnectedBackground();

		backgroundMock.FakeBroadcastChannel.instances[0].emit({ type: "ui.command", command: "disconnect" });

		await vi.waitFor(() => expect(socket.readyState).toBe(backgroundMock.FakeWebSocket.CLOSED));
		expect(backgroundMock.obr.scene.setMetadata).not.toHaveBeenCalled();
		expect(localStorage.getItem("dnd-dm-tools.owlbear.manual-disconnect")).toBe("true");
	});

	it("closes the socket and reports diagnostics when scene metadata cleanup fails", async () => {
		backgroundMock.obr.scene.setMetadata.mockRejectedValue(new Error("metadata unavailable"));
		const socket = await loadConnectedBackground();
		const channel = backgroundMock.FakeBroadcastChannel.instances[0];

		channel.emit({ type: "ui.command", command: "disconnect" });

		await vi.waitFor(() => expect(socket.readyState).toBe(backgroundMock.FakeWebSocket.CLOSED));
		expect(channel.messages).toContainEqual(expect.objectContaining({
			type: "runtime.state",
			state: expect.objectContaining({ connectionState: "disconnected", lastError: "metadata unavailable" }),
		}));
	});
});
