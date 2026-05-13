import * as obsidian from "obsidian";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TtgApiService, TtgHtmlService, TtgService } from "src/data/services";

describe("TtgApiService", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("posts TTG JSON requests and returns parsed data", async () => {
		const requestUrl = vi.spyOn(obsidian, "requestUrl").mockResolvedValue({
			status: 200,
			json: { name: { rus: "Огненный шар", eng: "Fireball" } },
		} as any);

		const result = await new TtgApiService().postJson("/spells/fireball");

		expect(result).toEqual({
			ok: true,
			value: { name: { rus: "Огненный шар", eng: "Fireball" } },
		});
		expect(requestUrl).toHaveBeenCalledWith({
			url: "https://ttg.club/api/v1//spells/fireball",
			method: "POST",
			body: undefined,
			contentType: undefined,
		});
	});

	it("sends source-book filters as the JSON request body", async () => {
		const requestUrl = vi.spyOn(obsidian, "requestUrl").mockResolvedValue({
			status: 200,
			json: { url: "/classes/bard" },
		} as any);

		await new TtgApiService().postJson("/classes/bard", {
			sourceBooks: ["PHB", "XGE"],
		});

		expect(requestUrl).toHaveBeenCalledWith({
			url: "https://ttg.club/api/v1//classes/bard",
			method: "POST",
			body: JSON.stringify({
				filter: {
					book: ["PHB", "XGE"],
				},
			}),
			contentType: "application/json",
		});
	});

	it("maps 404 responses to not-found failures", async () => {
		vi.spyOn(obsidian, "requestUrl").mockResolvedValue({
			status: 404,
			json: { message: "Not found" },
		} as any);

		const result = await new TtgApiService().postJson("/spells/missing");

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.reason).toBe("not-found");
		}
	});

	it("maps malformed JSON to invalid-response failures", async () => {
		const parseError = new Error("Unexpected token");
		vi.spyOn(obsidian, "requestUrl").mockResolvedValue({
			status: 200,
			json: async () => {
				throw parseError;
			},
		} as any);

		const result = await new TtgApiService().postJson("/spells/fireball");

		expect(result).toEqual({
			ok: false,
			reason: "invalid-response",
			error: parseError,
		});
	});

	it("maps primitive JSON responses to invalid-response failures", async () => {
		vi.spyOn(obsidian, "requestUrl").mockResolvedValue({
			status: 200,
			json: "not an object",
		} as any);

		const result = await new TtgApiService().postJson("/spells/fireball");

		expect(result).toEqual({
			ok: false,
			reason: "invalid-response",
		});
	});

	it("maps thrown request errors to network failures", async () => {
		const networkError = new Error("offline");
		vi.spyOn(obsidian, "requestUrl").mockRejectedValue(networkError);

		const result = await new TtgApiService().postJson("/spells/fireball");

		expect(result).toEqual({
			ok: false,
			reason: "network",
			error: networkError,
		});
	});
});

describe("TtgHtmlService", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("gets TTG HTML and returns response text", async () => {
		const requestUrl = vi.spyOn(obsidian, "requestUrl").mockResolvedValue({
			status: 200,
			text: "<article>Бард</article>",
		} as any);

		const result = await new TtgHtmlService().getHtml("/classes/fragment/bard");

		expect(result).toEqual({
			ok: true,
			value: "<article>Бард</article>",
		});
		expect(requestUrl).toHaveBeenCalledWith({
			url: "https://ttg.club//classes/fragment/bard",
			method: "GET",
		});
	});

	it("maps non-200 HTML responses to failures", async () => {
		vi.spyOn(obsidian, "requestUrl").mockResolvedValue({
			status: 500,
			text: "error",
		} as any);

		const result = await new TtgHtmlService().getHtml("/classes/fragment/bard");

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.reason).toBe("invalid-response");
		}
	});
});

describe("TtgService", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("returns class JSON with associated fragment HTML", async () => {
		vi.spyOn(obsidian, "requestUrl")
			.mockResolvedValueOnce({
				status: 200,
				json: { url: "/classes/bard", name: { rus: "Бард", eng: "Bard" } },
			} as any)
			.mockResolvedValueOnce({
				status: 200,
				text: "<article>Бард</article>",
			} as any);

		const result = await new TtgService().getClassWithHtml("/classes/bard", {
			sourceBooks: ["PHB"],
		});

		expect(result).toEqual({
			ok: true,
			value: {
				item: { url: "/classes/bard", name: { rus: "Бард", eng: "Bard" } },
				associatedUrl: "/classes/fragment/bard",
				associatedHtml: "<article>Бард</article>",
			},
		});
	});

	it("returns background JSON with associated HTML from the item URL", async () => {
		vi.spyOn(obsidian, "requestUrl")
			.mockResolvedValueOnce({
				status: 200,
				json: { url: "/backgrounds/fragment/199", name: { rus: "Оккультист", eng: "Occultist" } },
			} as any)
			.mockResolvedValueOnce({
				status: 200,
				text: "<section>Оккультист</section>",
			} as any);

		const result = await new TtgService().getBackgroundWithHtml("/backgrounds/occultist");

		expect(result).toEqual({
			ok: true,
			value: {
				item: {
					url: "/backgrounds/fragment/199",
					name: { rus: "Оккультист", eng: "Occultist" },
				},
				associatedUrl: "/backgrounds/fragment/199",
				associatedHtml: "<section>Оккультист</section>",
			},
		});
	});

	it("keeps JSON success when associated HTML fetch fails", async () => {
		vi.spyOn(obsidian, "requestUrl")
			.mockResolvedValueOnce({
				status: 200,
				json: { url: "/classes/bard" },
			} as any)
			.mockResolvedValueOnce({
				status: 404,
				text: "",
			} as any);

		const result = await new TtgService().getClassWithHtml("/classes/bard");

		expect(result).toEqual({
			ok: true,
			value: {
				item: { url: "/classes/bard" },
				associatedUrl: "/classes/fragment/bard",
				associatedHtml: undefined,
			},
		});
	});

	it("exposes DM screen and race operations through JSON service calls", async () => {
		const requestUrl = vi.spyOn(obsidian, "requestUrl")
			.mockResolvedValueOnce({
				status: 200,
				json: { url: "/screens/rules", description: "Rules text" },
			} as any)
			.mockResolvedValueOnce({
				status: 200,
				json: { url: "/races/elf", subraces: [] },
			} as any);
		const service = new TtgService();

		await expect(service.getDmScreenDescription("/screens/rules")).resolves.toEqual({
			ok: true,
			value: { url: "/screens/rules", description: "Rules text" },
		});
		await expect(service.getRaceTree("/races/elf", { sourceBooks: ["PHB"] })).resolves.toEqual({
			ok: true,
			value: { url: "/races/elf", subraces: [] },
		});
		expect(requestUrl).toHaveBeenLastCalledWith({
			url: "https://ttg.club/api/v1//races/elf",
			method: "POST",
			body: JSON.stringify({
				filter: {
					book: ["PHB"],
				},
			}),
			contentType: "application/json",
		});
	});
});
