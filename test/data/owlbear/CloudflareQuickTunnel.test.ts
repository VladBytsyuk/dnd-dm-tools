import { describe, expect, it } from "vitest";
import { buildQuickTunnelArguments, findQuickTunnelOrigin } from "src/data/owlbear/CloudflareQuickTunnel";

describe("Cloudflare Quick Tunnel", () => {
	it("uses an explicit empty config, loopback asset origin and disables auto-update", () => {
		expect(buildQuickTunnelArguments("/plugin/cloudflared/quick-tunnel.yml", 32123)).toEqual([
			"tunnel",
			"--config", "/plugin/cloudflared/quick-tunnel.yml",
			"--url", "http://127.0.0.1:32123",
			"--no-autoupdate",
			"--output", "json",
		]);
	});

	it("finds the generated HTTPS host in accumulated stdout or stderr", () => {
		const firstChunk = '{"message":"Your quick Tunnel has been created! Visit it at ht';
		const secondChunk = 'tps://brass-wolf-42.trycloudflare.com"}';

		expect(findQuickTunnelOrigin(firstChunk)).toBeNull();
		expect(findQuickTunnelOrigin(firstChunk + secondChunk)).toBe("https://brass-wolf-42.trycloudflare.com");
	});

	it("ignores non-Cloudflare and non-HTTPS URLs", () => {
		expect(findQuickTunnelOrigin("http://local.trycloudflare.com https://example.com")).toBeNull();
	});
});
