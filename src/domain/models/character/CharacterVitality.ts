/**
 * Character HP, AC, initiative, and related stats
 *
 * NOTE: Data structure is inconsistent - most fields wrapped in {value: X},
 * but `isDying` is a bare boolean. This is legacy structure for compatibility
 * with existing character sheets.
 *
 * TODO: Multi-class support - Currently uses single hit die type and level.
 * The `hp-dice-multi` field exists but is not yet implemented for multi-class
 * characters who have different hit dice per class.
 */
export interface CharacterVitality {
	"hp-dice-current": { value: number };
	"hp-dice-multi": Record<string, unknown>; // Reserved for multi-class hit dice
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
