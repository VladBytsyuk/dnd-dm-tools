/**
 * Represents a single class entry for a character.
 * Used to support multiclass characters.
 */
export interface ClassEntry {
	/** Class name (e.g., "Воин" for Fighter) */
	className: string;
	/** Optional subclass name (e.g., "Боевой мастер" for Battle Master) */
	subclassName?: string;
	/** Class-specific level (1-20) */
	level: number;
}
