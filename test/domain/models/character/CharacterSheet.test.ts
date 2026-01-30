import { describe, it, expect } from "vitest";
import type { CharacterSheet } from "@/domain/models/character";
import { parseCharacterData, stringifyCharacterData } from "@/domain/models/character";

// Sample character JSON data (based on tes-character.json)
const mockCharacterSheet: CharacterSheet = {
	tags: [],
	disabledBlocks: {
		"info-left": [],
		"info-right": [],
		"subinfo-left": [],
		"subinfo-right": [],
		"notes-left": [],
		"notes-right": [],
		_id: "697cc2006db6cb369e62367e",
	},
	edition: "2024",
	spells: {
		mode: "cards",
		prepared: [],
		book: [],
	},
	data: '{"isDefault":true,"jsonType":"character","template":"default","name":{"value":"Test Character"},"info":{"charClass":{"name":"charClass","value":"Fighter"},"charSubclass":{"name":"charSubclass","value":"Champion"},"level":{"name":"level","value":5},"background":{"name":"background","value":"Soldier"},"playerName":{"name":"playerName","value":"John"},"race":{"name":"race","value":"Human"},"alignment":{"name":"alignment","value":"Lawful Good"},"experience":{"name":"experience","value":"6500"},"size":{"value":"medium"}},"subInfo":{"age":{"name":"age","value":"25"},"height":{"name":"height","value":"6ft"},"weight":{"name":"weight","value":"180lb"},"eyes":{"name":"eyes","value":"Blue"},"skin":{"name":"skin","value":"Fair"},"hair":{"name":"hair","value":"Brown"}},"spellsInfo":{"base":{"name":"base","value":"","code":"int"},"save":{"name":"save","value":""},"mod":{"name":"mod","value":""}},"spells":{},"spellsPact":{},"proficiency":3,"stats":{"str":{"name":"str","score":16,"modifier":3},"dex":{"name":"dex","score":14,"modifier":2},"con":{"name":"con","score":15,"modifier":2},"int":{"name":"int","score":10,"modifier":0},"wis":{"name":"wis","score":12,"modifier":1},"cha":{"name":"cha","score":8,"modifier":-1}},"saves":{"str":{"name":"str","isProf":true},"dex":{"name":"dex","isProf":false},"con":{"name":"con","isProf":true},"int":{"name":"int","isProf":false},"wis":{"name":"wis","isProf":false},"cha":{"name":"cha","isProf":false}},"skills":{"acrobatics":{"baseStat":"dex","name":"acrobatics"},"animal handling":{"baseStat":"wis","name":"animal handling"},"arcana":{"baseStat":"int","name":"arcana"},"athletics":{"baseStat":"str","name":"athletics","isProf":1},"deception":{"baseStat":"cha","name":"deception"},"history":{"baseStat":"int","name":"history"},"insight":{"baseStat":"wis","name":"insight"},"intimidation":{"baseStat":"cha","name":"intimidation","isProf":1},"investigation":{"baseStat":"int","name":"investigation"},"medicine":{"baseStat":"wis","name":"medicine"},"nature":{"baseStat":"int","name":"nature"},"perception":{"baseStat":"wis","name":"perception","isProf":1},"performance":{"baseStat":"cha","name":"performance"},"persuasion":{"baseStat":"cha","name":"persuasion"},"religion":{"baseStat":"int","name":"religion"},"sleight of hand":{"baseStat":"dex","name":"sleight of hand"},"stealth":{"baseStat":"dex","name":"stealth"},"survival":{"baseStat":"wis","name":"survival"}},"vitality":{"hp-dice-current":{"value":5},"hp-dice-multi":{},"ac":{"value":18},"shield":{"mod":2,"value":true},"speed":{"value":30},"initiative":{"value":2},"hp-max":{"value":42},"hp-max-bonus":{"value":0},"hit-die":{"value":"d10"},"isDying":false},"attunementsList":[{"id":"attunement-1","checked":false,"value":""}],"weaponsList":[{"id":"weapon-1","name":{"value":"Longsword"},"mod":{"value":"+6"},"dmg":{"value":"1d8+3 slashing"},"isProf":true,"modBonus":{"value":3},"notes":{"value":"Versatile (1d10)"},"notesVisibility":true}],"weapons":{},"text":{"attacks":{"value":{"id":"attacks-1","data":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Melee attacks"}]}]}}},"traits":{"value":{"id":"traits-1","data":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Brave and loyal"}]}]}}},"features":{"value":{"id":"features-1","data":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Second Wind, Action Surge"}]}]}}},"feats":{"value":{"id":"feats-1","data":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Great Weapon Master"}]}]}}},"equipment":{"value":{"id":"equipment-1","data":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Plate armor, shield"}]}]}}},"items":{"value":{"id":"items-1","data":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Backpack, rope"}]}]}}},"appearance":{"value":{"id":"appearance-1","data":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Tall and muscular"}]}]}}},"background":{"value":{"id":"background-1","data":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Former soldier"}]}]}}},"allies":{"value":{"id":"allies-1","data":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"City Guard"}]}]}}},"personality":{"value":{"id":"personality-1","data":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Disciplined"}]}]}}},"ideals":{"value":{"id":"ideals-1","data":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Duty"}]}]}}},"bonds":{"value":{"id":"bonds-1","data":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Protect the weak"}]}]}}},"flaws":{"value":{"id":"flaws-1","data":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Stubborn"}]}]}}},"quests":{"value":{"id":"quests-1","data":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Find the lost artifact"}]}]}}},"notes-1":{"value":{"id":"notes-1-1","data":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Session notes"}]}]}}},"notes-2":{"value":{"id":"notes-2-1","data":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":""}]}]}}},"notes-3":{"value":{"id":"notes-3-1","data":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":""}]}]}}},"notes-4":{"value":{"id":"notes-4-1","data":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":""}]}]}}},"notes-5":{"value":{"id":"notes-5-1","data":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":""}]}]}}},"notes-6":{"value":{"id":"notes-6-1","data":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":""}]}]}}},"prof":{"value":{"id":"prof-1","data":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"All armor, shields, martial weapons"}]}]}}}},"coins":{"gp":{"value":100},"sp":{"value":50},"cp":{"value":25},"pp":{"value":5},"ep":{"value":10},"total":{"value":0}},"resources":{},"bonusesSkills":{},"bonusesStats":{},"conditions":[],"createdAt":"2026-01-30T12:00:00.000Z"}',
	jsonType: "character",
	version: "2",
};

describe("CharacterSheet interfaces", () => {
	it("should have correct structure", () => {
		expect(mockCharacterSheet.jsonType).toBe("character");
		expect(mockCharacterSheet.version).toBe("2");
		expect(mockCharacterSheet.edition).toBe("2024");
		expect(Array.isArray(mockCharacterSheet.tags)).toBe(true);
	});

	it("should parse character data correctly", () => {
		const parsed = parseCharacterData(mockCharacterSheet);

		// Check basic structure
		expect(parsed.data.jsonType).toBe("character");
		expect(parsed.data.isDefault).toBe(true);
		expect(parsed.data.template).toBe("default");

		// Check character name
		expect(parsed.data.name.value).toBe("Test Character");

		// Check character info
		expect(parsed.data.info.charClass.value).toBe("Fighter");
		expect(parsed.data.info.charSubclass.value).toBe("Champion");
		expect(parsed.data.info.level.value).toBe(5);
		expect(parsed.data.info.race.value).toBe("Human");

		// Check ability scores
		expect(parsed.data.stats.str.score).toBe(16);
		expect(parsed.data.stats.str.modifier).toBe(3);
		expect(parsed.data.stats.dex.score).toBe(14);
		expect(parsed.data.stats.dex.modifier).toBe(2);

		// Check saving throws
		expect(parsed.data.saves.str.isProf).toBe(true);
		expect(parsed.data.saves.con.isProf).toBe(true);
		expect(parsed.data.saves.dex.isProf).toBe(false);

		// Check skills
		expect(parsed.data.skills.athletics.isProf).toBe(1);
		expect(parsed.data.skills.perception.isProf).toBe(1);
		expect(parsed.data.skills.athletics.baseStat).toBe("str");

		// Check vitality
		expect(parsed.data.vitality.ac.value).toBe(18);
		expect(parsed.data.vitality["hp-max"].value).toBe(42);
		expect(parsed.data.vitality.speed.value).toBe(30);
		expect(parsed.data.vitality.isDying).toBe(false);

		// Check equipment
		expect(parsed.data.weaponsList).toHaveLength(1);
		expect(parsed.data.weaponsList[0].name.value).toBe("Longsword");
		expect(parsed.data.weaponsList[0].dmg.value).toBe("1d8+3 slashing");

		// Check coins
		expect(parsed.data.coins.gp.value).toBe(100);
		expect(parsed.data.coins.sp.value).toBe(50);

		// Check proficiency bonus
		expect(parsed.data.proficiency).toBe(3);
	});

	it("should stringify character data correctly", () => {
		const parsed = parseCharacterData(mockCharacterSheet);
		const stringified = stringifyCharacterData(parsed);

		// Should be valid JSON string
		expect(typeof stringified.data).toBe("string");

		// Should be parseable back
		const reparsed = JSON.parse(stringified.data);
		expect(reparsed.name.value).toBe("Test Character");
		expect(reparsed.stats.str.score).toBe(16);
	});

	it("should handle text sections with editor state", () => {
		const parsed = parseCharacterData(mockCharacterSheet);

		// Check text section structure
		expect(parsed.data.text.attacks.value.id).toBe("attacks-1");
		expect(parsed.data.text.attacks.value.data.type).toBe("doc");
		expect(parsed.data.text.attacks.value.data.content).toBeDefined();

		// Check content structure
		const attacksContent = parsed.data.text.attacks.value.data.content;
		if (attacksContent && attacksContent.length > 0) {
			expect(attacksContent[0].type).toBe("paragraph");
		}
	});

	it("should handle round-trip conversion", () => {
		const parsed = parseCharacterData(mockCharacterSheet);
		const stringified = stringifyCharacterData(parsed);
		const reParsed = parseCharacterData(stringified);

		// Should maintain data integrity
		expect(reParsed.data.name.value).toBe(parsed.data.name.value);
		expect(reParsed.data.stats.str.score).toBe(parsed.data.stats.str.score);
		expect(reParsed.data.vitality.ac.value).toBe(parsed.data.vitality.ac.value);
		expect(reParsed.data.weaponsList[0].name.value).toBe(parsed.data.weaponsList[0].name.value);
	});
});
