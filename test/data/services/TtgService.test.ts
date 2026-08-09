import * as obsidian from "obsidian";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TtgApiService, TtgHtmlService, TtgService } from "src/data/services";

describe("TtgApiService", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("gets TTG v2 JSON requests and returns parsed data", async () => {
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
			url: "https://new.ttg.club/api/v2/spells/fireball",
			method: "GET",
		});
	});

	it("uses source-book filters for v2 search fallback selection", async () => {
		const requestUrl = vi.spyOn(obsidian, "requestUrl").mockResolvedValue({
			status: 200,
			json: { url: "/classes/bard" },
		} as any);

		await new TtgApiService().postJson("/classes/bard", {
			sourceBooks: ["PHB", "XGE"],
		});

		expect(requestUrl).toHaveBeenCalledWith({
			url: "https://new.ttg.club/api/v2/classes/bard",
			method: "GET",
		});
	});

	it("falls back to v2 search and ignores 2024 results when a compatible result exists", async () => {
		const requestUrl = vi.spyOn(obsidian, "requestUrl")
			.mockResolvedValueOnce({
				status: 404,
				json: { message: "missing" },
			} as any)
			.mockResolvedValueOnce({
				status: 404,
				json: { message: "missing legacy" },
			} as any)
			.mockResolvedValueOnce({
				status: 200,
				json: [
					{ url: "/spells/fireball-2024", srdVersion: "2024" },
					{
						url: "/spells/ognennyj-shar",
						name: { rus: "Огненный шар", eng: "Fireball" },
						source: { name: { label: "PHB", rus: "Книга игрока", eng: "Player's Handbook" } },
						srdVersion: "2014",
					},
				],
			} as any)
			.mockResolvedValueOnce({
				status: 200,
				json: { url: "/spells/ognennyj-shar" },
			} as any);

		const result = await new TtgApiService().postJson("/spells/fireball", { sourceBooks: ["PHB"] });

		expect(result).toEqual({ ok: true, value: { url: "/spells/ognennyj-shar" } });
		expect(requestUrl).toHaveBeenNthCalledWith(2, {
			url: "https://ttg.club/api/v1/spells/fireball",
			method: "POST",
			body: JSON.stringify({ filter: { book: ["PHB"] } }),
			contentType: "application/json",
		});
		expect(requestUrl).toHaveBeenNthCalledWith(3, {
			url: "https://new.ttg.club/api/v2/spells/search?q=fireball",
			method: "GET",
		});
		expect(requestUrl).toHaveBeenNthCalledWith(4, {
			url: "https://new.ttg.club/api/v2/spells/ognennyj-shar",
			method: "GET",
		});
	});

	it("falls back to legacy detail before v2 search when v2 direct lookup fails", async () => {
		const requestUrl = vi.spyOn(obsidian, "requestUrl")
			.mockResolvedValueOnce({
				status: 404,
				json: { message: "missing" },
			} as any)
			.mockResolvedValueOnce({
				status: 200,
				json: { url: "/spells/fireball", name: { rus: "Огненный шар", eng: "Fireball" } },
			} as any);

		const result = await new TtgApiService().postJson("/spells/fireball");

		expect(result).toEqual({
			ok: true,
			value: { url: "/spells/fireball", name: { rus: "Огненный шар", eng: "Fireball" } },
		});
		expect(requestUrl).toHaveBeenCalledTimes(2);
		expect(requestUrl).toHaveBeenNthCalledWith(2, {
			url: "https://ttg.club/api/v1/spells/fireball",
			method: "POST",
			body: undefined,
			contentType: undefined,
		});
	});

	it("does not resolve unrelated broad v2 magic item search results", async () => {
		const requestUrl = vi.spyOn(obsidian, "requestUrl")
			.mockResolvedValueOnce({
				status: 404,
				json: { message: "missing" },
			} as any)
			.mockResolvedValueOnce({
				status: 404,
				json: { message: "missing legacy item" },
			} as any)
			.mockResolvedValueOnce({
				status: 200,
				json: [
					{
						url: "ammunition-1-2-or-3-dmg",
						name: { rus: "Боеприпас +1, +2 или +3", eng: "Ammunition +1, +2, or +3" },
						source: { name: { label: "DMG" } },
						srdVersion: "2014",
					},
				],
			} as any);

		const result = await new TtgApiService().postJson("/items/magic/everbright_lantern");

		expect(result.ok).toBe(false);
		expect(requestUrl).toHaveBeenCalledTimes(3);
		expect(requestUrl).toHaveBeenNthCalledWith(2, {
			url: "https://ttg.club/api/v1/items/magic/everbright_lantern",
			method: "POST",
			body: undefined,
			contentType: undefined,
		});
		expect(requestUrl).toHaveBeenNthCalledWith(3, {
			url: "https://new.ttg.club/api/v2/magic-items/search?q=everbright_lantern",
			method: "GET",
		});
		expect(requestUrl).not.toHaveBeenCalledWith({
			url: "https://new.ttg.club/api/v2/magic-items/ammunition-1-2-or-3-dmg",
			method: "GET",
		});
	});

	it("falls back to legacy detail when a v2 direct response is 2024 content", async () => {
		const requestUrl = vi.spyOn(obsidian, "requestUrl")
			.mockResolvedValueOnce({
				status: 200,
				json: {
					url: "fireball-phb",
					srdVersion: "5.2.1",
					name: { rus: "Огненный шар", eng: "Fireball" },
				},
			} as any)
			.mockResolvedValueOnce({
				status: 200,
				json: { url: "/spells/fireball", srdVersion: "2014" },
			} as any);

		const result = await new TtgApiService().postJson("/spells/fireball");

		expect(result).toEqual({ ok: true, value: { url: "/spells/fireball", srdVersion: "2014" } });
		expect(requestUrl).toHaveBeenNthCalledWith(2, {
			url: "https://ttg.club/api/v1/spells/fireball",
			method: "POST",
			body: undefined,
			contentType: undefined,
		});
	});

	it("falls back to legacy detail when Obsidian throws a v2 404 request error", async () => {
		const requestUrl = vi.spyOn(obsidian, "requestUrl")
			.mockRejectedValueOnce(new Error("Request failed, status 404"))
			.mockResolvedValueOnce({
				status: 200,
				json: { url: "/bestiary/wildfire_spirit", name: { rus: "Дух дикого огня", eng: "Wildfire Spirit" } },
			} as any);

		const result = await new TtgApiService().postJson("/bestiary/wildfire_spirit");

		expect(result).toEqual({
			ok: true,
			value: {
				url: "/bestiary/wildfire_spirit",
				name: { rus: "Дух дикого огня", eng: "Wildfire Spirit" },
			},
		});
		expect(requestUrl).toHaveBeenNthCalledWith(1, {
			url: "https://new.ttg.club/api/v2/bestiary/wildfire_spirit",
			method: "GET",
		});
		expect(requestUrl).toHaveBeenNthCalledWith(2, {
			url: "https://ttg.club/api/v1/bestiary/wildfire_spirit",
			method: "POST",
			body: undefined,
			contentType: undefined,
		});
	});

	it("preserves legacy monster shape after fallback so monster UI fields remain defined", async () => {
		vi.spyOn(obsidian, "requestUrl")
			.mockRejectedValueOnce(new Error("Request failed, status 404"))
			.mockResolvedValueOnce({
				status: 200,
				json: {
					name: { rus: "Дух дикого огня", eng: "Wildfire Spirit" },
					size: { rus: "Маленький", eng: "small", cell: "1 клетка" },
					type: { name: "элементаль" },
					challengeRating: "—",
					url: "/bestiary/wildfire_spirit",
					source: {
						shortName: "TCE",
						name: "Котел Таши со всякой всячиной",
						group: { name: "Официальные источники", shortName: "Basic" },
					},
					actions: [{ name: "Семя пламени", value: "<p>Огонь.</p>" }],
					images: [],
				},
			} as any);

		const result = await new TtgService().getFullItem("/bestiary/wildfire_spirit");

		expect(result).toEqual({
			ok: true,
			value: expect.objectContaining({
				name: { rus: "Дух дикого огня", eng: "Wildfire Spirit" },
				size: { rus: "Маленький", eng: "small", cell: "1 клетка" },
				type: { name: "элементаль" },
				source: expect.objectContaining({ shortName: "TCE" }),
				actions: [{ name: "Семя пламени", value: "<p>Огонь.</p>" }],
			}),
		});
	});

	it("adds monster UI defaults to v2 bestiary responses without legacy nested fields", async () => {
		vi.spyOn(obsidian, "requestUrl").mockResolvedValueOnce({
			status: 200,
			json: {
				name: { rus: "Дух дикого огня", eng: "Wildfire Spirit" },
				header: "Маленький элементаль, без мировоззрения",
				cr: "—",
				ac: "13",
				hit: { hit: 10, text: "10 (5 + пятикратный уровень заклинания)" },
				abilities: {
					str: { value: 10 },
					dex: { value: 14 },
					con: { value: 14 },
					int: { value: 13 },
					wis: { value: 15 },
					cha: { value: 11 },
				},
				source: {
					name: { label: "TCE", rus: "Котел Таши со всякой всячиной", eng: "Tasha's Cauldron of Everything" },
				},
				actions: [{ name: { rus: "Семя пламени", eng: "Flame Seed" }, description: "<p>Огонь.</p>" }],
			},
		} as any);

		const result = await new TtgService().getFullItem("/bestiary/wildfire_spirit");

		expect(result).toEqual({
			ok: true,
			value: expect.objectContaining({
				name: { rus: "Дух дикого огня", eng: "Wildfire Spirit" },
				size: { rus: "", eng: "", cell: "" },
				type: "Маленький элементаль, без мировоззрения",
				senses: { passivePerception: "", senses: [] },
				conditionImmunities: [],
				actions: [{ name: "Семя пламени", value: "<p>Огонь.</p>" }],
			}),
		});
	});

	it("returns legacy failure when v2 search candidates do not prove 2014 compatibility", async () => {
		const requestUrl = vi.spyOn(obsidian, "requestUrl")
			.mockResolvedValueOnce({
				status: 404,
				json: { message: "missing" },
			} as any)
			.mockResolvedValueOnce({
				status: 404,
				json: { message: "missing legacy" },
			} as any)
			.mockResolvedValueOnce({
				status: 200,
				json: [
					{
						url: "wand-of-orcus-dmg",
						name: { rus: "Палочка Оркуса", eng: "Wand of Orcus" },
						source: { name: { label: "DMG" } },
					},
				],
			} as any);

		const result = await new TtgApiService().postJson("/items/magic/wand_of_orcus");

		expect(result.ok).toBe(false);
		expect(requestUrl).toHaveBeenCalledTimes(3);
		expect(requestUrl).toHaveBeenNthCalledWith(2, {
			url: "https://ttg.club/api/v1/items/magic/wand_of_orcus",
			method: "POST",
			body: undefined,
			contentType: undefined,
		});
		expect(requestUrl).toHaveBeenNthCalledWith(3, {
			url: "https://new.ttg.club/api/v2/magic-items/search?q=wand_of_orcus",
			method: "GET",
		});
	});

	it("returns legacy failure when a last-resort v2 retry cannot load the resolved slug", async () => {
		const requestUrl = vi.spyOn(obsidian, "requestUrl")
			.mockResolvedValueOnce({
				status: 404,
				json: { message: "missing" },
			} as any)
			.mockResolvedValueOnce({
				status: 404,
				json: { message: "missing legacy" },
			} as any)
			.mockResolvedValueOnce({
				status: 200,
				json: [{ url: "/spells/ognennyj-shar", name: { rus: "Огненный шар", eng: "Fireball" }, srdVersion: "2014" }],
			} as any)
			.mockResolvedValueOnce({
				status: 404,
				json: { message: "still missing" },
			} as any);

		const result = await new TtgApiService().postJson("/spells/fireball");

		expect(result.ok).toBe(false);
		expect(requestUrl).toHaveBeenNthCalledWith(2, {
			url: "https://ttg.club/api/v1/spells/fireball",
			method: "POST",
			body: undefined,
			contentType: undefined,
		});
		expect(requestUrl).toHaveBeenNthCalledWith(3, {
			url: "https://new.ttg.club/api/v2/spells/search?q=fireball",
			method: "GET",
		});
		expect(requestUrl).toHaveBeenNthCalledWith(4, {
			url: "https://new.ttg.club/api/v2/spells/ognennyj-shar",
			method: "GET",
		});
	});

	it("keeps weapon and armor URLs on the legacy endpoint", async () => {
		const requestUrl = vi.spyOn(obsidian, "requestUrl").mockResolvedValue({
			status: 200,
			json: { url: "/weapons/longsword" },
		} as any);
		const service = new TtgApiService();

		await service.postJson("/armors/scale_mail_armor");
		await service.postJson("/weapons/longsword");

		expect(requestUrl).toHaveBeenNthCalledWith(1, {
			url: "https://ttg.club/api/v1/armors/scale_mail_armor",
			method: "POST",
			body: undefined,
			contentType: undefined,
		});
		expect(requestUrl).toHaveBeenNthCalledWith(2, {
			url: "https://ttg.club/api/v1/weapons/longsword",
			method: "POST",
			body: undefined,
			contentType: undefined,
		});
	});

	it("maps generic and magic item URLs to v2 item endpoints", async () => {
		const requestUrl = vi.spyOn(obsidian, "requestUrl").mockResolvedValue({
			status: 200,
			json: { url: "/item/scale-mail" },
		} as any);
		const service = new TtgApiService();

		await service.postJson("/items/rope");
		await service.postJson("/items/magic/wand_of_orcus");

		expect(requestUrl).toHaveBeenNthCalledWith(1, {
			url: "https://new.ttg.club/api/v2/item/rope",
			method: "GET",
		});
		expect(requestUrl).toHaveBeenNthCalledWith(2, {
			url: "https://new.ttg.club/api/v2/magic-items/wand_of_orcus",
			method: "GET",
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

		expect(result).toMatchObject({
			ok: true,
			value: {
				item: { url: "/classes/bard", name: { rus: "Бард", eng: "Bard" } },
				associatedUrl: "/classes/fragment/bard",
				associatedHtml: "<article>Бард</article>",
			},
		});
	});

	it("prefers class description over associated fragment HTML", async () => {
		vi.spyOn(obsidian, "requestUrl")
			.mockResolvedValueOnce({
				status: 200,
				json: {
					url: "bard-phb",
					name: { rus: "Бард", eng: "Bard" },
					description: "<p>Описание класса.</p>",
				},
			} as any)
			.mockResolvedValueOnce({
				status: 200,
				text: "<html><body><div id=\"root\"></div></body></html>",
			} as any);

		const result = await new TtgService().getClassWithHtml("/classes/bard");

		expect(result).toMatchObject({
			ok: true,
			value: {
				item: {
					name: { rus: "Бард", eng: "Bard" },
					associatedHtml: "<p>Описание класса.</p>",
				},
				associatedUrl: "/classes/fragment/bard",
				associatedHtml: "<p>Описание класса.</p>",
			},
		});
	});

	it("uses class description when associated HTML is blank", async () => {
		vi.spyOn(obsidian, "requestUrl")
			.mockResolvedValueOnce({
				status: 200,
				json: {
					url: "fighter-phb",
					name: { rus: "Воин", eng: "Fighter" },
					description: "<p>Описание воина.</p>",
				},
			} as any)
			.mockResolvedValueOnce({
				status: 200,
				text: " \n\t ",
			} as any);

		const result = await new TtgService().getClassWithHtml("/classes/fighter");

		expect(result).toMatchObject({
			ok: true,
			value: {
				associatedUrl: "/classes/fragment/fighter",
				associatedHtml: "<p>Описание воина.</p>",
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

		expect(result).toMatchObject({
			ok: true,
			value: {
				item: {
					name: { rus: "Оккультист", eng: "Occultist" },
				},
				associatedUrl: "/backgrounds/fragment/199",
				associatedHtml: "<section>Оккультист</section>",
			},
		});
	});

	it("uses background description when associated HTML cannot be loaded", async () => {
		vi.spyOn(obsidian, "requestUrl")
			.mockResolvedValueOnce({
				status: 200,
				json: {
					url: "/backgrounds/fragment/110",
					name: { rus: "Истец", eng: "Plaintiff" },
					description: "<p>Вы стали жертвой судебного инцидента.</p>",
				},
			} as any)
			.mockResolvedValueOnce({
				status: 404,
				text: "missing fragment",
			} as any);

		const result = await new TtgService().getBackgroundWithHtml("/backgrounds/plaintiff");

		expect(result).toMatchObject({
			ok: true,
			value: {
				item: {
					name: { rus: "Истец", eng: "Plaintiff" },
					description: "<p>Вы стали жертвой судебного инцидента.</p>",
				},
				associatedUrl: "/backgrounds/fragment/110",
				associatedHtml: "<p>Вы стали жертвой судебного инцидента.</p>",
			},
		});
	});

	it("uses background description when associated HTML is blank", async () => {
		vi.spyOn(obsidian, "requestUrl")
			.mockResolvedValueOnce({
				status: 200,
				json: {
					url: "/backgrounds/fragment/111",
					name: { rus: "Стажёр Конкурента", eng: "Rival Intern" },
					description: "<p>Вы были стажёром в конкурирующей компании.</p>",
				},
			} as any)
			.mockResolvedValueOnce({
				status: 200,
				text: " \n\t ",
			} as any);

		const result = await new TtgService().getBackgroundWithHtml("/backgrounds/rival_intern");

		expect(result).toMatchObject({
			ok: true,
			value: {
				item: {
					name: { rus: "Стажёр Конкурента", eng: "Rival Intern" },
					description: "<p>Вы были стажёром в конкурирующей компании.</p>",
				},
				associatedUrl: "/backgrounds/fragment/111",
				associatedHtml: "<p>Вы были стажёром в конкурирующей компании.</p>",
			},
		});
	});

	it("prefers background description over non-empty associated HTML", async () => {
		vi.spyOn(obsidian, "requestUrl")
			.mockResolvedValueOnce({
				status: 200,
				json: {
					url: "/backgrounds/fragment/111",
					name: { rus: "Стажёр Конкурента", eng: "Rival Intern" },
					description: "<p>Вы были стажёром в конкурирующей компании.</p>",
				},
			} as any)
			.mockResolvedValueOnce({
				status: 200,
				text: "<html><body><div id=\"root\"></div></body></html>",
			} as any);

		const result = await new TtgService().getBackgroundWithHtml("/backgrounds/rival_intern");

		expect(result).toMatchObject({
			ok: true,
			value: {
				associatedHtml: "<p>Вы были стажёром в конкурирующей компании.</p>",
			},
		});
	});

	it("adapts v2 magic item JSON to the artifact domain shape", async () => {
		vi.spyOn(obsidian, "requestUrl").mockResolvedValueOnce({
			status: 200,
			json: {
				url: "wand-of-orcus-dmg",
				srdVersion: "2014",
				name: { rus: "Палочка Оркуса", eng: "Wand of Orcus" },
				source: {
					name: { label: "DMG", rus: "Руководство мастера", eng: "Dungeon Master's Guide" },
					group: { label: "Basic", rus: "Официальные источники" },
				},
				category: "волшебная палочка",
				rarity: "артефакт",
				attunement: true,
				image: "/s3/magic-items/wand-of-orcus.webp",
				description: [
					"Созданная и используемая самим Оркусом.",
					{ type: "list", content: ["Случайные свойства"] },
				],
			},
		} as any);

		const result = await new TtgService().getFullItem("/items/magic/wand_of_orcus");

		expect(result).toEqual({
			ok: true,
			value: expect.objectContaining({
				name: { rus: "Палочка Оркуса", eng: "Wand of Orcus" },
				url: "/items/magic/wand_of_orcus",
				type: { name: "волшебная палочка" },
				price: { dmg: null, xge: null },
				rarity: { type: "artifact", name: "артефакт", short: "А" },
				customization: true,
				source: expect.objectContaining({
					shortName: "DMG",
					name: "Руководство мастера",
					group: { name: "Официальные источники", shortName: "Basic" },
				}),
				detailType: [{ name: "волшебная палочка", type: "волшебная палочка", url: null }],
				cost: { dmg: null, xge: null },
				images: ["https://new.ttg.club/s3/magic-items/wand-of-orcus.webp"],
				description: "Созданная и используемая самим Оркусом.Случайные свойства",
			}),
		});
	});

	it("maps v2 species features and lineages into the race tree", async () => {
		const requestUrl = vi.spyOn(obsidian, "requestUrl")
			.mockResolvedValueOnce({
				status: 200,
				json: {
					url: "elf-phb",
					srdVersion: "2014",
					name: { rus: "Эльф", eng: "Elf" },
					source: {
						name: { label: "PHB", rus: "Книга игрока", eng: "Player Handbook" },
						group: { label: "Basic", rus: "Официальные источники" },
					},
					properties: { type: "Гуманоид", size: "Средний", speed: "30 футов" },
					features: [
						{
							name: { rus: "Тёмное зрение", eng: "Darkvision" },
							description: ["У вас есть тёмное зрение."],
						},
					],
				},
			} as any)
			.mockResolvedValueOnce({
				status: 200,
				json: [
					{
						url: "high-elf-phb",
						srdVersion: "2014",
						name: { rus: "Высший эльф", eng: "High Elf" },
						source: {
							name: { label: "PHB", rus: "Книга игрока", eng: "Player Handbook" },
							group: { label: "Basic", rus: "Официальные источники" },
						},
						properties: { type: "Гуманоид", size: "Средний", speed: "30 футов" },
						features: [
							{
								name: { rus: "Заговор", eng: "Cantrip" },
								description: ["Вы знаете один заговор."],
							},
						],
					},
				],
			} as any);

		const result = await new TtgService().getRaceTree("/races/elf");

		expect(result).toEqual({
			ok: true,
			value: expect.objectContaining({
				name: { rus: "Эльф", eng: "Elf" },
				url: "/races/elf",
				associatedUrl: "/races/elf-phb",
				speed: [{ name: "", value: 30, additional: undefined }],
				skills: [{ name: "Тёмное зрение", description: "У вас есть тёмное зрение." }],
				subraces: [
					expect.objectContaining({
						name: { rus: "Высший эльф", eng: "High Elf" },
						url: "/races/high-elf-phb",
						skills: [{ name: "Заговор", description: "Вы знаете один заговор." }],
					}),
				],
			}),
		});
		expect(requestUrl).toHaveBeenNthCalledWith(2, {
			url: "https://new.ttg.club/api/v2/species/elf-phb/lineages",
			method: "GET",
		});
	});

	it("parses v2 bestiary ability, speed, and sense fields", async () => {
		vi.spyOn(obsidian, "requestUrl").mockResolvedValueOnce({
			status: 200,
			json: {
				url: "baboon-mm",
				srdVersion: "2014",
				name: { rus: "Бабуин", eng: "Baboon" },
				header: "Маленький зверь, без мировоззрения",
				source: {
					name: { label: "MM", rus: "Бестиарий", eng: "Monster Manual" },
					group: { label: "Basic", rus: "Официальные источники" },
				},
				abilities: {
					str: { value: 8 },
					dex: { value: 14 },
					con: { value: 11 },
					int: { value: 4 },
					wis: { value: 12 },
					chr: { value: 6 },
				},
				speed: "30 фт., лазая 30 фт.",
				sense: "тёмное зрение 60 фт., пассивная внимательность 11",
			},
		} as any);

		const result = await new TtgService().getFullItem("/bestiary/baboon");

		expect(result).toEqual({
			ok: true,
			value: expect.objectContaining({
				ability: {
					str: 8,
					dex: 14,
					con: 11,
					int: 4,
					wiz: 12,
					cha: 6,
				},
				speed: [
					{ name: "", value: 30, additional: undefined },
					{ name: "лазая", value: 30, additional: undefined },
				],
				senses: {
					passivePerception: "11",
					senses: [{ name: "тёмное зрение", value: 60 }],
				},
			}),
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

		expect(result).toMatchObject({
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
			value: expect.objectContaining({ url: "/races/elf", subraces: [] }),
		});
		expect(requestUrl).toHaveBeenLastCalledWith({
			url: "https://new.ttg.club/api/v2/species/elf",
			method: "GET",
		});
	});
});
