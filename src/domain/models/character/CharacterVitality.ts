// Character HP, AC, initiative, and related stats
export interface CharacterVitality {
	"hp-dice-current": { value: number };
	"hp-dice-multi": Record<string, unknown>;
	ac: { value: number };
	shield: { mod: number; value: boolean };
	speed: { value: number };
	initiative: { value: number };
	"hp-max": { value: number };
	"hp-max-bonus": { value: number };
	"hit-die": { value: string };
	isDying: boolean;
	// NEW FIELDS - Interactive vitality block
	"hp-current": { value: number }; // Current hit points
	"hp-temp": { value: number }; // Temporary hit points
	"death-saves-success": { value: number }; // Death save successes (0-3)
	"death-saves-fail": { value: number }; // Death save failures (0-3)
	"proficiency-bonus": { value: number }; // Proficiency bonus
	"passive-perception": { value: number }; // Passive perception (10 + perception bonus)
	"darkvision": { value: number }; // Darkvision range in feet (0 if none)
}
