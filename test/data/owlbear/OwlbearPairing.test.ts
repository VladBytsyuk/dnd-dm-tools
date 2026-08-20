import { describe, expect, it } from "vitest";
import { createOwlbearPairingCode } from "src/data/owlbear/OwlbearPairing";

describe("Owlbear pairing code", () => {
	it("creates a v2 code for the secret-scoped Quick Tunnel WebSocket", () => {
		expect(createOwlbearPairingCode(
			`wss://Brass-Wolf-42.trycloudflare.com/assets/${"s".repeat(32)}/ws`,
			"t".repeat(43),
		)).toBe(`dnd-dm-tools:v2:brass-wolf-42.trycloudflare.com:${"s".repeat(32)}:${"t".repeat(43)}`);
	});

	it.each([
		`ws://test.trycloudflare.com/assets/${"s".repeat(32)}/ws`,
		`wss://example.com/assets/${"s".repeat(32)}/ws`,
		`wss://test.trycloudflare.com/assets/short/ws`,
		`wss://test.trycloudflare.com/assets/${"s".repeat(32)}/ws?token=value`,
	])("rejects an unsafe public WebSocket URL: %s", (url) => {
		expect(createOwlbearPairingCode(url, "t".repeat(43))).toBe("");
	});

	it("rejects an invalid authentication token", () => {
		expect(createOwlbearPairingCode(
			`wss://test.trycloudflare.com/assets/${"s".repeat(32)}/ws`,
			"short",
		)).toBe("");
	});
});
