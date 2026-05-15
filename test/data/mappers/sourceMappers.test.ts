import { describe, expect, it } from "vitest";
import {
	BackgroundMapper,
	buildClassFragmentUrl,
	ClassMapper,
	DmScreenDescriptionMapper,
	RaceMapper,
	spellMapper,
} from "../../../src/data/mappers/sourceMappers";

describe("TTG source mappers", () => {
	it("normalizes missing URLs for simple TTG entities", () => {
		const mapped = spellMapper.map(
			{
				name: { rus: "Mage Hand", eng: "Mage Hand" },
				level: 0,
				school: "conjuration",
				components: { v: true, s: true },
				source: {
					shortName: "PHB",
					name: "Player's Handbook",
					group: { name: "Basic", shortName: "Basic" },
				},
				range: "30 feet",
				duration: "1 minute",
				time: "1 action",
				description: "<p>Hand.</p>",
			},
			"/spells/mage_hand"
		);

		expect(mapped.url).toBe("/spells/mage_hand");
	});

	it("maps race names, source defaults, URL fallbacks, and nested subraces", () => {
		const mapped = new RaceMapper().map(
			{
				name: "Elf",
				type: "Base",
				source: { shortName: "PHB" },
				subraces: [
					{
						name: { rus: "High Elf", eng: "High Elf" },
						subraces: [{ name: { rus: "Moon Elf" } }],
					},
				],
			},
			"/races/elf"
		);

		expect(mapped.name).toEqual({ rus: "Elf", eng: "Elf" });
		expect(mapped.source).toEqual({
			shortName: "PHB",
			name: "",
			group: { name: "", shortName: "" },
			homebrew: false,
		});
		expect(mapped.description).toBe("");
		expect(mapped.type).toEqual({ name: "Base" });
		expect(mapped.subraces?.[0].url).toBe("/races/elf/high_elf");
		expect(mapped.subraces?.[0].subraces?.[0].url).toBe("/races/elf/high_elf/moon_elf");
		expect(mapped.subraces?.[0].subraces?.[0].name).toEqual({
			rus: "Moon Elf",
			eng: "Moon Elf",
		});
	});

	it("keeps returned race URLs when present", () => {
		const mapped = new RaceMapper().map(
			{
				name: { rus: "Custom", eng: "Custom" },
				url: "/races/custom-returned",
				subraces: [{ name: "Child", url: "/races/custom-returned/child" }],
			},
			"/races/custom-requested"
		);

		expect(mapped.url).toBe("/races/custom-returned");
		expect(mapped.subraces?.[0].url).toBe("/races/custom-returned/child");
	});

	it("builds class fragment URLs without fetching HTML", () => {
		expect(buildClassFragmentUrl("/classes/bard")).toBe("/classes/fragment/bard");
		expect(buildClassFragmentUrl("/classes/bard/valor")).toBe("/classes/fragment/bard/valor");
		expect(buildClassFragmentUrl("/classes/fragment/bard")).toBe("/classes/fragment/bard");
	});

	it("maps classes with requested URL, associated fragment URL, and provided HTML", () => {
		const mapped = new ClassMapper().map(
			{
				id: 1,
				name: { rus: "Bard", eng: "Bard" },
				url: "/classes/bard",
				dice: "d8",
				source: {
					shortName: "PHB",
					name: "Player's Handbook",
					group: { name: "Basic", shortName: "Basic" },
				},
				isArchetype: false,
				associatedHtml: "<article>Bard</article>",
			},
			"/classes/requested-bard"
		);

		expect(mapped.url).toBe("/classes/requested-bard");
		expect(mapped.associatedUrl).toBe("/classes/fragment/bard");
		expect(mapped.associatedHtml).toBe("<article>Bard</article>");
	});

	it("maps backgrounds with requested URL, associated URL, and provided HTML", () => {
		const mapped = new BackgroundMapper().map(
			{
				name: { rus: "Acolyte", eng: "Acolyte" },
				url: "/backgrounds/fragment/acolyte",
				source: {
					shortName: "PHB",
					name: "Player's Handbook",
					group: { name: "Basic", shortName: "Basic" },
				},
				skills: [],
				toolOwnership: "",
				equipments: [],
				startGold: 15,
				description: "",
				associatedHtml: "<section>Acolyte</section>",
			},
			"/backgrounds/acolyte"
		);

		expect(mapped.url).toBe("/backgrounds/acolyte");
		expect(mapped.associatedUrl).toBe("/backgrounds/fragment/acolyte");
		expect(mapped.associatedHtml).toBe("<section>Acolyte</section>");
	});

	it("maps DM screen description refresh responses with URL fallback", () => {
		const mapped = new DmScreenDescriptionMapper().map(
			{
				name: { rus: "Condition", eng: "Condition" },
				order: 1,
				source: {
					shortName: "PHB",
					name: "Player's Handbook",
					group: { name: "Basic", shortName: "Basic" },
				},
				description: "<p>Fresh</p>",
			},
			"/screens/condition"
		);

		expect(mapped.url).toBe("/screens/condition");
		expect(mapped.description).toBe("<p>Fresh</p>");
	});
});
