import type { CharacterSubInfo } from "../../../../domain/models/character/CharacterInfo";

export function createEmptyCharacterSubInfo(): CharacterSubInfo {
	return {
		age: { name: "age", value: "" },
		height: { name: "height", value: "" },
		weight: { name: "weight", value: "" },
		eyes: { name: "eyes", value: "" },
		skin: { name: "skin", value: "" },
		hair: { name: "hair", value: "" }
	};
}
