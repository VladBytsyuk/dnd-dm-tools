import { describe, expect, it } from "vitest";
import { parsePairingCode } from "../../owlbear-extension/src/pairing";

describe("Owlbear extension pairing", () => {
	it("parses a v2 Quick Tunnel code into a secure WebSocket URL", () => {
		const secret = "s".repeat(32);
		const token = "t".repeat(43);

		expect(parsePairingCode(`dnd-dm-tools:v2:Brass-Wolf-42.trycloudflare.com:${secret}:${token}`)).toEqual({
			version: 2,
			websocketUrl: `wss://brass-wolf-42.trycloudflare.com/assets/${secret}/ws`,
			token,
		});
	});

	it("keeps v1 localhost codes for development compatibility", () => {
		const token = "a".repeat(32);
		expect(parsePairingCode(`dnd-dm-tools:v1:43125:${token}`)).toEqual({
			version: 1,
			websocketUrl: "ws://localhost:43125/ws",
			token,
		});
	});

	it.each([
		`dnd-dm-tools:v2:example.com:${"s".repeat(32)}:${"t".repeat(43)}`,
		`dnd-dm-tools:v2:test.trycloudflare.com:short:${"t".repeat(43)}`,
		`dnd-dm-tools:v2:test.trycloudflare.com:${"s".repeat(32)}:short`,
		`dnd-dm-tools:v1:80:${"a".repeat(32)}`,
	])("rejects an invalid pairing code: %s", (code) => {
		expect(parsePairingCode(code)).toBeNull();
	});
});
