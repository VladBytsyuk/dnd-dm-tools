/**
 * D&D 5e class hit dice mapping (Russian class names)
 * Maps class names to their hit die type
 */
export const CLASS_HIT_DICE: Record<string, string> = {
	Варвар: "d12",
	Воин: "d10",
	Паладин: "d10",
	Следопыт: "d10",
	Жрец: "d8",
	Друид: "d8",
	Монах: "d8",
	Плут: "d8",
	Бард: "d8",
	Колдун: "d8",
	Волшебник: "d6",
	Чародей: "d6",
};

/**
 * Gets the hit die type for a class name
 * @param className - Russian class name
 * @returns Hit die type (e.g., "d8") or "d8" as default
 */
export function getHitDieForClass(className: string): string {
	return CLASS_HIT_DICE[className] || "d8";
}

/**
 * Gets the numeric value of a hit die (e.g., "d8" -> 8)
 * @param hitDie - Hit die string (e.g., "d8", "d10")
 * @returns Numeric value of the die
 */
export function getHitDieValue(hitDie: string): number {
	const match = hitDie.match(/d(\d+)/);
	return match ? parseInt(match[1], 10) : 8;
}
