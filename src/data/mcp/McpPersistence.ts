import type DB from "src/data/database/DB";
import type { McpEntitiesDependencies, McpRepository } from "./McpEntities";
import { McpError } from "./McpEntities";
import { MCP_REFERENCE_KINDS, type McpReferenceKind } from "./McpEntitySchemas";
import * as factories from "src/data/repositories/factories";
import type { TtgService } from "src/data/services/TtgService";
import { loadMediaState, type MediaState } from "src/domain/models/media/MediaState";

const repositoryFactories = {
	bestiary: factories.createBestiaryRepository, spellbook: factories.createSpellbookRepository,
	arsenal: factories.createArsenalRepository, armory: factories.createArmoryRepository,
	equipment: factories.createEquipmentRepository, artifactory: factories.createArtifactoryRepository,
	backgrounds: factories.createBackgroundRepository, feats: factories.createFeatsRepository, races: factories.createRacesRepository,
};

/** Reuses domain repositories with explicit transaction scope. No nested BEGIN or disk writes. */
export function createMcpPersistence(database: DB, dependencies: McpEntitiesDependencies,
	publishMedia: (state: MediaState) => void,
	serializeMedia: <T>(callback: () => Promise<T>) => Promise<T> = callback => callback(),
): Pick<McpEntitiesDependencies, "atomic" | "operations"> {
	return {
		operations: {
			get: id => database.mcpOperationsDao.get(id),
			list: (offset, limit) => database.mcpOperationsDao.list(offset, limit),
			save: operation => database.transaction(async () => database.mcpOperationsDao.save(operation)),
		},
		atomic: <T>(callback: (scope: McpEntitiesDependencies) => Promise<T>) => serializeMedia(async (): Promise<T> => {
			let result!: T;
			let published: MediaState | undefined;
			await database.transaction(async () => {
				const localOnlyService = new Proxy({} as TtgService, { get: () => async () => { throw new McpError("conflict", "Кеш карточки изменился. Прочитайте её заново до подтверждения."); } });
				const options = { transactions: { transaction: <T>(nested: () => Promise<T>) => nested() }, ttgService: localOnlyService };
				const repositories = Object.fromEntries(MCP_REFERENCE_KINDS.map(kind => [kind, repositoryFactories[kind](database, options)])) as unknown as Record<McpReferenceKind, McpRepository>;
				let media = database.mediaDao.read();
				let changed = false;
				const scope: McpEntitiesDependencies = {
					...dependencies, repositories, atomic: undefined, readBarrier: undefined, operations: database.mcpOperationsDao,
					getMediaState: () => media,
					updateMedia: async (change, beforeWrite) => {
						const candidate = structuredClone(media);
						change(candidate); beforeWrite?.();
						media = loadMediaState(candidate); changed = true;
					},
					removeEntity: async (kind, url) => {
						// Repositories cannot cascade: deletion is limited to identities already
						// verified against a persisted operation snapshot by the gateway.
						const repository = repositories[kind] as McpRepository & { deleteItem(url: string): Promise<boolean> };
						if (!await repository.deleteItem(url)) throw new McpError("save_failed", "Не удалось отменить создание записи.");
					},
					assertRemovable: async (kind, data, affected) => {
						await dependencies.assertRemovable?.(kind, data, affected);
						if ((MCP_REFERENCE_KINDS as readonly string[]).includes(kind) && database.favoritesDao.has(kind as McpReferenceKind, String(data.url))) throw new McpError("dependency", "Запись добавлена в избранное.");
						if ((MCP_REFERENCE_KINDS as readonly string[]).includes(kind)) {
							const tables = {
								bestiary: database.fullMonsterDao, spellbook: database.fullSpellDao, arsenal: database.fullWeaponDao,
								armory: database.fullArmorDao, equipment: database.fullItemDao, artifactory: database.fullArtifactDao,
								backgrounds: database.fullBackgroundDao, feats: database.fullFeatDao, races: database.fullRaceDao,
								classes: database.fullClassDao,
							};
							for (const [ownerKind, dao] of Object.entries(tables)) {
								for (const record of await dao.readAllItems(null, null)) {
									if (affected.has(`${ownerKind}:${record.url}`)) continue;
									if (hasEntityReference(record, String(data.url))) throw new McpError("dependency", "На запись ссылается другая карточка.");
								}
							}
							for (const small of await database.characterSheetDao.readAllItems(null, null)) {
								const record = await database.characterSheetDao.readFullItemByUrl(small.url);
								if (hasEntityReference(record, String(data.url))) throw new McpError("dependency", "Запись используется в листе персонажа.");
							}
						}
						if (kind === "races") {
							const parent = await repositories.races.getParentUrl?.(String(data.url));
							if (parent && !affected.has(`races:${parent}`)) throw new McpError("dependency", "Подраса используется другой расой.");
						}
					},
				};
				result = await callback(scope);
				if (changed) { database.mediaDao.write(media); published = media; }
			});
			if (published) try { publishMedia(published); } catch (error) { console.warn("MCP media saved, UI refresh failed", error); }
			return result;
		}),
	};
}

/** Only structured model links; never scan descriptions, HTML or vault file contents. */
function hasEntityReference(value: unknown, target: string, root = true): boolean {
	if (Array.isArray(value)) return value.some(item => hasEntityReference(item, target, false));
	if (!value || typeof value !== "object") return false;
	return Object.entries(value).some(([key, child]) => {
		if ((!root && key === "url" || key.endsWith("Url")) && child === target) return true;
		return typeof child === "object" && hasEntityReference(child, target, false);
	});
}
