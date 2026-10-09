import { EventEmitter } from "node:events";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ spawn: vi.fn(), get: vi.fn(), mkdir: vi.fn(), writeFile: vi.fn() }));
vi.mock("child_process", () => ({ default: { spawn: mocks.spawn }, spawn: mocks.spawn }));
vi.mock("fs/promises", () => ({ default: { mkdir: mocks.mkdir, writeFile: mocks.writeFile }, mkdir: mocks.mkdir, writeFile: mocks.writeFile }));
vi.mock("https", () => ({ default: { get: mocks.get }, get: mocks.get }));

import { CloudflareQuickTunnel } from "src/data/owlbear/CloudflareQuickTunnel";

class FakeChild extends EventEmitter {
	stdout = new EventEmitter();
	stderr = new EventEmitter();
	exitCode: number | null = null;
	signalCode: string | null = null;
	kill = vi.fn((signal: string) => {
		Promise.resolve().then(() => {
			this.signalCode = signal;
			this.stderr.emit("data", Buffer.from('{"level":"error","message":"Connection terminated"}\n'));
			this.emit("exit", null, signal);
		});
		return true;
	});
}

function fixture(onReady = vi.fn()) {
	const onUnavailable = vi.fn();
	const tunnel = new CloudflareQuickTunnel("/cloudflared", 32123, "/config", "/assets/session", onReady, onUnavailable, vi.fn());
	return { tunnel, onReady, onUnavailable };
}

async function launch(tunnel: CloudflareQuickTunnel): Promise<FakeChild> {
	tunnel.start();
	await vi.waitFor(() => expect(mocks.spawn).toHaveBeenCalledOnce());
	return mocks.spawn.mock.results[0].value;
}

beforeEach(() => {
	vi.useFakeTimers();
	mocks.spawn.mockReset().mockImplementation(() => new FakeChild());
	mocks.mkdir.mockReset().mockResolvedValue(undefined);
	mocks.writeFile.mockReset().mockResolvedValue(undefined);
	mocks.get.mockReset().mockImplementation((_url, _options, callback) => {
		const request = new EventEmitter() as EventEmitter & { destroy: (error: Error) => void };
		request.destroy = vi.fn(error => request.emit("error", error));
		Promise.resolve().then(() => {
			if (Date.now() < 40_000) request.emit("error", new Error("getaddrinfo ENOTFOUND new-host.trycloudflare.com"));
			else callback({ statusCode: 200, resume: vi.fn() });
		});
		return request;
	});
	vi.setSystemTime(0);
});

afterEach(() => {
	vi.clearAllTimers();
	vi.useRealTimers();
});

describe("Quick Tunnel startup and restart", () => {
	it("waits for a newly created hostname to resolve without replacing the tunnel after 30 seconds", async () => {
		const { tunnel, onReady } = fixture();
		const child = await launch(tunnel);
		child.stdout.emit("data", Buffer.from("https://new-host.trycloudflare.com"));
		await vi.advanceTimersByTimeAsync(35_000);
		expect(child.kill).not.toHaveBeenCalled();
		expect(tunnel.getStatus().state).toBe("starting");
		await vi.advanceTimersByTimeAsync(6_000);
		expect(onReady).toHaveBeenCalledWith("https://new-host.trycloudflare.com");
		expect(tunnel.getStatus().state).toBe("ready");
		expect(mocks.spawn).toHaveBeenCalledOnce();
		await tunnel.stop();
	});

	it("keeps a short DNS error separate from shutdown diagnostics when health checks expire", async () => {
		vi.setSystemTime(-200_000);
		const { tunnel } = fixture();
		const child = await launch(tunnel);
		child.stdout.emit("data", Buffer.from("https://new-host.trycloudflare.com\n"));
		await vi.advanceTimersByTimeAsync(90_500);
		const status = tunnel.getStatus();
		expect(status.state).toBe("retrying");
		expect(status.error).toContain("Не удалось разрешить DNS-адрес new-host.trycloudflare.com");
		expect(status.error).not.toContain("Connection terminated");
		expect(status.diagnostic).toContain("Connection terminated");
		expect(status.diagnostic).toContain("ENOTFOUND");
		await tunnel.stop();
	});

	it("ignores output and pending health checks from the process being restarted", async () => {
		const { tunnel, onReady } = fixture();
		const oldChild = await launch(tunnel);
		oldChild.stdout.emit("data", Buffer.from("https://old-host.trycloudflare.com"));
		await tunnel.restart();
		const newChild = mocks.spawn.mock.results[1].value as FakeChild;
		oldChild.stderr.emit("data", Buffer.from("old process failure"));
		await vi.advanceTimersByTimeAsync(40_000);
		expect(onReady).not.toHaveBeenCalled();
		newChild.stdout.emit("data", Buffer.from("https://new-host.trycloudflare.com"));
		await vi.advanceTimersByTimeAsync(0);
		expect(onReady).toHaveBeenCalledOnce();
		expect(tunnel.getStatus()).toEqual({ state: "ready", publicHost: "https://new-host.trycloudflare.com" });
		await tunnel.stop();
	});

	it("does not publish ready after a restart while the ready callback is pending", async () => {
		vi.setSystemTime(50_000);
		let completeReady!: () => void;
		const onReady = vi.fn(() => new Promise<void>(resolve => { completeReady = resolve; }));
		const { tunnel } = fixture(onReady);
		const oldChild = await launch(tunnel);
		oldChild.stdout.emit("data", Buffer.from("https://old-host.trycloudflare.com"));
		await vi.advanceTimersByTimeAsync(0);
		expect(onReady).toHaveBeenCalledOnce();
		await tunnel.restart();
		completeReady();
		await vi.advanceTimersByTimeAsync(0);
		expect(tunnel.getStatus().state).toBe("starting");
		await tunnel.stop();
	});

	it("bounds a stalled DNS lookup even before a socket is connected", async () => {
		const requests: Array<EventEmitter & { destroy: ReturnType<typeof vi.fn> }> = [];
		mocks.get.mockImplementation(() => {
			const request = Object.assign(new EventEmitter(), { destroy: vi.fn() });
			request.destroy.mockImplementation(error => request.emit("error", error));
			requests.push(request);
			return request;
		});
		const { tunnel, onReady } = fixture();
		const child = await launch(tunnel);
		child.stdout.emit("data", Buffer.from("https://new-host.trycloudflare.com"));
		await vi.advanceTimersByTimeAsync(5_000);
		expect(requests[0].destroy).toHaveBeenCalledWith(expect.objectContaining({ message: "Проверка туннеля превысила 5 секунд." }));
		expect(onReady).not.toHaveBeenCalled();
		await tunnel.stop();
		await vi.advanceTimersByTimeAsync(500);
		expect(tunnel.getStatus().state).toBe("stopped");
	});
});
