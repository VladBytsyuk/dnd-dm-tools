import type DB from "src/data/database/DB";

/**
 * Result of an entity lookup in the database.
 */
export interface EntityLinkResult {
	/** Whether the entity exists in the database */
	exists: boolean;
	/** URL of the entity if it exists */
	url?: string;
	/** Name of the entity in Russian and English */
	name?: { rus: string; eng: string };
}

/**
 * Service for checking if character-related entities (race, class, background)
 * exist in the plugin's databases and retrieving their information.
 */
export class EntityLinkService {
	constructor(private database: DB) {}

	/**
	 * Searches for a race by name in the race database.
	 * @param raceName The race name to search for (case-insensitive)
	 * @returns EntityLinkResult with existence status and details
	 */
	async findRace(raceName: string): Promise<EntityLinkResult> {
		if (!raceName || !raceName.trim()) {
			return { exists: false };
		}

		try {
			const allRaces = await this.database.smallRaceDao.readAllItems('', null);
			const normalizedSearch = raceName.toLowerCase().trim();

			const match = allRaces.find(r =>
				r.name.rus.toLowerCase().trim() === normalizedSearch ||
				r.name.eng.toLowerCase().trim() === normalizedSearch
			);

			return match
				? { exists: true, url: match.url, name: match.name }
				: { exists: false };
		} catch (error) {
			console.error('Error finding race:', error);
			return { exists: false };
		}
	}

	/**
	 * Searches for a class by name in the class database.
	 * Only searches base classes, not archetypes.
	 * @param className The class name to search for (case-insensitive)
	 * @returns EntityLinkResult with existence status and details
	 */
	async findClass(className: string): Promise<EntityLinkResult> {
		if (!className || !className.trim()) {
			return { exists: false };
		}

		try {
			const allClasses = await this.database.smallClassDao.readAllItems('', null);
			const normalizedSearch = className.toLowerCase().trim();

			// Filter out archetypes - only search base classes
			const match = allClasses.find(c =>
				!c.isArchetype &&
				(c.name.rus.toLowerCase().trim() === normalizedSearch ||
				c.name.eng.toLowerCase().trim() === normalizedSearch)
			);

			return match
				? { exists: true, url: match.url, name: match.name }
				: { exists: false };
		} catch (error) {
			console.error('Error finding class:', error);
			return { exists: false };
		}
	}

	/**
	 * Searches for a background by name in the background database.
	 * @param bgName The background name to search for (case-insensitive)
	 * @returns EntityLinkResult with existence status and details
	 */
	async findBackground(bgName: string): Promise<EntityLinkResult> {
		if (!bgName || !bgName.trim()) {
			return { exists: false };
		}

		try {
			const allBackgrounds = await this.database.smallBackgroundDao.readAllItems('', null);
			const normalizedSearch = bgName.toLowerCase().trim();

			const match = allBackgrounds.find(b =>
				b.name.rus.toLowerCase().trim() === normalizedSearch ||
				b.name.eng.toLowerCase().trim() === normalizedSearch
			);

			return match
				? { exists: true, url: match.url, name: match.name }
				: { exists: false };
		} catch (error) {
			console.error('Error finding background:', error);
			return { exists: false };
		}
	}
}
