import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AUTO_SCROLL_KEY } from "../../owlbear-extension/src/protocol";

vi.mock("@owlbear-rodeo/sdk", () => ({
	default: {
		onReady: vi.fn(async (callback: () => Promise<void>) => callback()),
		player: { getRole: vi.fn(async () => "GM") },
		scene: {
			isReady: vi.fn(async () => false),
			onMetadataChange: vi.fn(),
			onReadyChange: vi.fn(),
		},
	},
}));

beforeEach(() => {
	vi.resetModules();
	localStorage.clear();
	document.body.innerHTML = readFileSync("owlbear-extension/public/index.html", "utf8");
	vi.stubGlobal("BroadcastChannel", class {
		addEventListener() {}
		postMessage() {}
	});
});

afterEach(() => {
	vi.unstubAllGlobals();
	localStorage.clear();
	document.body.replaceChildren();
});

describe("Owlbear auto-scroll preference", () => {
	it("defaults to enabled and saves changes from the GM panel", async () => {
		await import("../../owlbear-extension/src/main");
		await vi.waitFor(() => expect(document.querySelector<HTMLElement>("#service-panel")!.hidden).toBe(false));
		const input = document.querySelector<HTMLInputElement>("#auto-scroll")!;
		expect(input.checked).toBe(true);
		expect(input.closest("label")!.textContent).toContain("Автоскролл к активному токену");

		input.click();
		expect(localStorage.getItem(AUTO_SCROLL_KEY)).toBe("false");
		input.click();
		expect(localStorage.getItem(AUTO_SCROLL_KEY)).toBe("true");
	});

	it("restores the disabled preference when the panel opens", async () => {
		localStorage.setItem(AUTO_SCROLL_KEY, "false");
		await import("../../owlbear-extension/src/main");
		expect(document.querySelector<HTMLInputElement>("#auto-scroll")!.checked).toBe(false);
	});
});
