import type { HitDicePools } from "../../utils/multiclassHitDice";

/**
 * Character HP, AC, initiative, and related stats
 *
 * NOTE: Data structure is inconsistent - most fields wrapped in {value: X},
 * but `isDying` is a bare boolean. This is legacy structure for compatibility
 * with existing character sheets.
 *
 * Multi-class hit dice: The `hp-dice-multi` field stores hit dice pools by die type
 * (e.g., { "d8": { current: 2, total: 2 }, "d12": { current: 1, total: 1 } }).
 * Legacy `hp-dice-current` and `hit-die` fields are kept for backward compatibility.
 */
export interface CharacterVitality {
	"hp-dice-current": { value: number };
	"hp-dice-multi": { value: HitDicePools }; // Multi-class hit dice pools
	ac: { value: number };
	shield: { mod: number; value: boolean };
	speed: { value: number };
	initiative: { value: number };
	"hp-max": { value: number };
	"hp-max-bonus": { value: number };
	"hit-die": { value: string }; // Single class hit die (e.g., "d8")
	isDying: boolean; // NOTE: Not wrapped in {value:} for historical reasons
	// NEW FIELDS - Interactive vitality block
	"hp-current": { value: number }; // Current hit points
	"hp-temp": { value: number }; // Temporary hit points
	"death-saves-success": { value: number }; // Death save successes (0-3)
	"death-saves-fail": { value: number }; // Death save failures (0-3)
	"proficiency-bonus": { value: number }; // Proficiency bonus
	"passive-perception": { value: number }; // Passive perception (10 + perception bonus)
	"darkvision": { value: number }; // Darkvision range in feet (0 if none)
}
