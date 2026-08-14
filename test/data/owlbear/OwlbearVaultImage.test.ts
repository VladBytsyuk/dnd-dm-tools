import { EventEmitter } from "node:events";
import type { ClientRequest, IncomingMessage } from "node:http";
import { PassThrough } from "node:stream";
import { App, TFile } from "obsidian";
import { describe, expect, it, vi } from "vitest";

const httpsGet = vi.hoisted(() => vi.fn());

vi.mock("https", () => ({ get: httpsGet, default: { get: httpsGet } }));

import {
	assertOwlbearImageDataUrlSize,
	downloadOwlbearRemoteImage,
	MAX_OWLBEAR_IMAGE_BYTES,
	resolveOwlbearVaultImageFile,
	validateOwlbearRemoteImageUrl,
} from "src/data/owlbear/OwlbearVaultImage";

function mockHttpsResponse(options: { statusCode?: number; headers?: Record<string, string>; body?: Buffer }): { response: PassThrough; request: ClientRequest } {
	const response = new PassThrough();
	Object.assign(response, { statusCode: options.statusCode ?? 200, headers: options.headers ?? {} });
	const request = Object.assign(new EventEmitter(), {
		setTimeout: vi.fn(),
		destroy: vi.fn(),
	}) as unknown as ClientRequest;
	httpsGet.mockImplementationOnce((_url: string, _options: unknown, callback: (response: IncomingMessage) => void) => {
		callback(response as unknown as IncomingMessage);
		queueMicrotask(() => response.end(options.body));
		return request;
	});
	return { response, request };
}

describe("resolveOwlbearVaultImageFile", () => {
	it("resolves relative and obsidian URLs through the vault file index", () => {
		const app = new App();
		const file = new TFile("tokens/goblin.png");
		app.vault.getAbstractFileByPath = (path) => path === file.path ? file : null;

		expect(resolveOwlbearVaultImageFile(app, "tokens/goblin.png")).toBe(file);
		expect(resolveOwlbearVaultImageFile(app, "obsidian://open?file=tokens%2Fgoblin.png")).toBe(file);
	});

	it("rejects paths that are not indexed inside the vault", () => {
		const app = new App();

		expect(() => resolveOwlbearVaultImageFile(app, "../outside.png")).toThrow("не найден внутри vault");
		expect(() => resolveOwlbearVaultImageFile(app, "file:///tmp/outside.png")).toThrow("только HTTP(S), data URL");
	});
});

describe("Owlbear remote image security", () => {
	it("allows ordinary public HTTPS image URLs", () => {
		expect(validateOwlbearRemoteImageUrl("https://cdn.example.com/tokens/goblin.png"))
			.toBe("https://cdn.example.com/tokens/goblin.png");
	});

	it.each([
		"http://cdn.example.com/token.png",
		"https://localhost/token.png",
		"https://127.0.0.1/token.png",
		"https://10.0.0.8/token.png",
		"https://[::1]/token.png",
		"https://cdn.example.com:8443/token.png",
	])("rejects unsafe remote source %s", (source) => {
		expect(() => validateOwlbearRemoteImageUrl(source)).toThrow();
	});

	it("rejects oversized inline images before decoding", () => {
		const oversized = `data:image/png;base64,${"A".repeat(Math.ceil((MAX_OWLBEAR_IMAGE_BYTES + 1) * 4 / 3))}`;

		expect(() => assertOwlbearImageDataUrlSize(oversized)).toThrow("превышает лимит");
	});

	it("downloads a remote image as a bounded stream", async () => {
		mockHttpsResponse({
			headers: { "content-type": "image/png", "content-length": "3" },
			body: Buffer.from([1, 2, 3]),
		});

		const image = await downloadOwlbearRemoteImage("https://cdn.example.com/tokens/goblin.png");

		expect(image.mime).toBe("image/png");
		expect([...image.bytes]).toEqual([1, 2, 3]);
	});

	it("rejects an oversized remote image before reading its body", async () => {
		const { response } = mockHttpsResponse({
			headers: { "content-type": "image/png", "content-length": `${MAX_OWLBEAR_IMAGE_BYTES + 1}` },
		});
		const resume = vi.spyOn(response, "resume");

		await expect(downloadOwlbearRemoteImage("https://cdn.example.com/tokens/giant.png"))
			.rejects.toThrow("превышает лимит");

		expect(resume).toHaveBeenCalledOnce();
	});

	it("aborts a chunked image as soon as it exceeds the limit", async () => {
		const { response } = mockHttpsResponse({
			headers: { "content-type": "image/png" },
			body: Buffer.alloc(MAX_OWLBEAR_IMAGE_BYTES + 1),
		});
		const destroy = vi.spyOn(response, "destroy");

		await expect(downloadOwlbearRemoteImage("https://cdn.example.com/tokens/giant.png"))
			.rejects.toThrow("превышает лимит");

		expect(destroy).toHaveBeenCalledOnce();
	});
});
