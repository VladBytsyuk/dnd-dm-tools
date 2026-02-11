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

interface CacheEntry<T> {
	data: T;
	timestamp: number;
}

/**
 * Service for checking if character-related entities (race, class, background)
 * exist in the plugin's databases and retrieving their information.
 *
 * Uses in-memory caching to avoid repeated database queries.
 */
export class EntityLinkService {
	private cache = new Map<string, CacheEntry<any>>();
	private readonly CACHE_TTL = 60000; // 1 minute in milliseconds

	constructor(private database: DB) {}

	/**
	 * Gets cached data or fetches and caches it if expired.
	 */
	private async getCached<T>(
		key: string,
		fetcher: () => Promise<T>
	): Promise<T> {
		const cached = this.cache.get(key);
		const now = Date.now();

		if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
			return cached.data as T;
		}

		// Fetch fresh data
		const data = await fetcher();
		this.cache.set(key, { data, timestamp: now });
		return data;
	}

	/**
	 * Clears all cached data. Useful when database is updated.
	 */
	clearCache(): void {
		this.cache.clear();
	}

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
			const allRaces = await this.getCached(
				'races',
				() => this.database.smallRaceDao.readAllItems('', null)
			);
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
			const allClasses = await this.getCached(
				'classes',
				() => this.database.smallClassDao.readAllItems('', null)
			);
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
	 * Searches for an archetype (subclass) by name in the class database.
	 * Only searches archetypes, not base classes.
	 * @param archetypeName The archetype name to search for (case-insensitive)
	 * @returns EntityLinkResult with existence status and details
	 */
	async findArchetype(archetypeName: string): Promise<EntityLinkResult> {
		if (!archetypeName || !archetypeName.trim()) {
			return { exists: false };
		}

		try {
			const allClasses = await this.getCached(
				'classes',
				() => this.database.smallClassDao.readAllItems('', null)
			);
			const normalizedSearch = archetypeName.toLowerCase().trim();

			// Filter to only archetypes - opposite of findClass
			const match = allClasses.find(c =>
				c.isArchetype &&
				(c.name.rus.toLowerCase().trim() === normalizedSearch ||
				c.name.eng.toLowerCase().trim() === normalizedSearch)
			);

			return match
				? { exists: true, url: match.url, name: match.name }
				: { exists: false };
		} catch (error) {
			console.error('Error finding archetype:', error);
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
			const allBackgrounds = await this.getCached(
				'backgrounds',
				() => this.database.smallBackgroundDao.readAllItems('', null)
			);
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
