import { Buffer } from 'buffer';
import * as fs from 'fs';
import type { Dao } from '../../domain/Dao';
import { SmallMonsterSqlTableDao } from './SmallMonsterSqlTableDao';
import { FileSystemAdapter, type App, type PluginManifest } from 'obsidian';
import initSqlJs, { type Database } from 'sql.js';
import { FullMonsterSqlTableDao } from './FullMonsterSqlTableDao';
import { SmallSpellSqlTableDao } from './SmallSpellSqlTableDao';
import { FullSpellSqlTableDao } from './FullSpellSqlTableDao';
import { DmScreenGroupSqlTableDao } from './DmScreenGroupSqlTableDao';
import { SmallWeaponSqlTableDao } from './SmallWeaponSqlTableDao';
import { FullWeaponSqlTableDao } from './FullWeaponSqlTableDao';
import { SmallArmorSqlTableDao } from './SmallArmorSqlTableDao';
import { FullArmorSqlTableDao } from './FullArmorSqlTableDao';
import { SmallItemSqlTableDao } from './SmallItemSqlTableDao';
import { FullItemSqlTableDao } from './FullItemSqlTableDao';
import { SmallArtifactSqlTableDao } from './SmallArtifactSqlTableDao';
import { FullArtifactSqlTableDao } from './FullArtifactSqlTableDao';
import { SmallBackgroundSqlTableDao } from './SmallBackgroundSqlTableDao';
import { FullBackgroundSqlTableDao } from './FullBackgroundSqlTableDao';
import { SmallFeatSqlTableDao } from './SmallFeatSqlTableDao';
import { FullFeatSqlTableDao } from './FullFeatSqlTableDao';
import { SmallRaceSqlTableDao } from './SmallRaceSqlTableDao';
import { FullRaceSqlTableDao } from './FullRaceSqlTableDao';
import { SmallClassSqlTableDao } from './SmallClassSqlTableDao';
import { FullClassSqlTableDao } from './FullClassSqlTableDao';
import { CharacterSheetSqlTableDao } from './CharacterSheetSqlTableDao';
import { EntityOriginDao } from './EntityOriginDao';
import { FavoritesDao } from './FavoritesDao';
import { FavoritesStore } from 'src/data/stores/FavoritesStore';
import type { Initializable } from 'src/domain/Initializable';
import type { EntityKind } from 'src/domain/models/common/EntityOrigin';
import { DatabaseSeedOrchestrator, bundledEntityUrlsByKind } from 'src/data/services';
import { DbTransactionalStore, SeedStore } from 'src/data/stores';
import { MediaSqlDao } from './MediaSqlDao';
import { McpOperationsDao } from './McpOperationsDao';
import { MediaStore } from 'src/data/stores/MediaStore';

export default class DB implements Initializable {

    private database: Database | null = null;
    private liveDatabase: Database | null = null;
    private restoreDatabase: ((data: Uint8Array) => Database) | null = null;
    private transactionQueue: Promise<void> = Promise.resolve();
    private disposing = false;
    private databasePath: string;
    public smallMonsterDao: SmallMonsterSqlTableDao;
    public fullMonsterDao: FullMonsterSqlTableDao;
    public smallSpellDao: SmallSpellSqlTableDao;
    public fullSpellDao: FullSpellSqlTableDao;
    public dmScreenGroupDao: DmScreenGroupSqlTableDao;
    public smallWeaponDao: SmallWeaponSqlTableDao;
    public fullWeaponDao: FullWeaponSqlTableDao;
    public smallArmorDao: SmallArmorSqlTableDao;
    public fullArmorDao: FullArmorSqlTableDao;
    public smallItemDao: SmallItemSqlTableDao;
    public fullItemDao: FullItemSqlTableDao;
    public smallArtifactDao: SmallArtifactSqlTableDao;
    public fullArtifactDao: FullArtifactSqlTableDao;
    public smallBackgroundDao: SmallBackgroundSqlTableDao;
    public fullBackgroundDao: FullBackgroundSqlTableDao;
    public smallFeatDao: SmallFeatSqlTableDao;
    public fullFeatDao: FullFeatSqlTableDao;
    public smallRaceDao: SmallRaceSqlTableDao;
    public fullRaceDao: FullRaceSqlTableDao;
    public smallClassDao: SmallClassSqlTableDao;
    public fullClassDao: FullClassSqlTableDao;
    public characterSheetDao: CharacterSheetSqlTableDao;
    public entityOriginDao: EntityOriginDao;
    public favoritesDao: FavoritesDao;
    public favorites: FavoritesStore;
    public mediaDao: MediaSqlDao;
    public media: MediaStore;
    public mcpOperationsDao: McpOperationsDao;

    constructor(
        private app: App,
        private manifest: PluginManifest,
    ) {
        this.databasePath = this.pluginFile('database.db');
    }

    async initialize() {
        try {
            let wasmBinary: ArrayBuffer | undefined = undefined;
            const wasmFile = this.pluginFile('sql-wasm.wasm');
            try {
                wasmBinary = await this.app.vault.adapter.readBinary(wasmFile);
            } catch (e) {
                try {
                    const fileBuffer = fs.readFileSync(wasmFile);
                    wasmBinary = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);
                } catch (nodeError) {
                    console.error('Failed to load WASM file:', nodeError);
                }
            }
            const SQL = await initSqlJs({ wasmBinary });

            const isDatabaseExists = await this.app.vault.adapter.exists(this.databasePath);
            let databaseData: Uint8Array | null = null;

            if (isDatabaseExists) {
                const databaseContent = await this.app.vault.adapter.readBinary(this.databasePath);
                databaseData = new Uint8Array(databaseContent);
            }

            this.restoreDatabase = (data) => new SQL.Database(data);
            this.liveDatabase = new SQL.Database(databaseData);
            // DAOs keep this stable reference when a failed disk write restores the database.
            const database = new Proxy({} as Database, {
                get: (_target, property) => {
                    if (!this.liveDatabase) throw new Error('Database not initialized');
                    const value = Reflect.get(this.liveDatabase, property);
                    return typeof value === 'function' ? value.bind(this.liveDatabase) : value;
                },
            });
            this.database = database;
            const sqlTableDaos = this.initDaos(database);
            this.entityOriginDao = new EntityOriginDao(database);
            this.favoritesDao = new FavoritesDao(database);
            this.favorites = new FavoritesStore(this.favoritesDao, new DbTransactionalStore(this));
            this.mcpOperationsDao = new McpOperationsDao(database);
            this.mediaDao = new MediaSqlDao(database);
            this.media = new MediaStore(this.mediaDao, new DbTransactionalStore(this));

            // Check if classes migration needed
            const needsClassesMigration = await this.checkClassesMigration();
            if (needsClassesMigration) {
                console.log('Classes table migration required...');
                await this.migrateClassesTables();
            }

            // Create tables if they do not exist
            await this.transaction(async () => {
                await this.entityOriginDao.initialize();
                this.favoritesDao.initialize();
                this.mediaDao.initialize();
                this.mcpOperationsDao.initialize();
                this.mcpOperationsDao.interruptPending();
                await Promise.all(
                    sqlTableDaos.map(tableDao => tableDao.initialize())
                );
                this.smallArmorDao.ensureWeightColumn();
                this.fullRaceDao.ensureAdditionalSectionsColumn();
                this.fullBackgroundDao.ensureDetailColumns();
                this.fullMonsterDao.ensureDetailColumns();
            });

            await this.createSeedOrchestrator().seedAll();
            await this.backfillRemoteOrigins();

            console.log('Database initialized');
        } catch (error) {
            console.error('Database init error:', error);
            this.liveDatabase?.close();
            this.liveDatabase = null;
            this.database = null;
            throw error;
        }
    }

    async dispose() {
        this.disposing = true;
        await this.transactionQueue;
        await Promise.all(this.getDaos().filter(Boolean).map(dao => dao.dispose()));
        this.liveDatabase?.close();
        this.liveDatabase = null;
        this.database = null;
    }

    async whenIdle(): Promise<void> {
        await this.transactionQueue;
    }

    async transaction(callback: (database: Database) => Promise<void>) {
        if (this.disposing) throw new Error('Database is closing');
        const pending = this.transactionQueue.then(() => this.runTransaction(callback));
        this.transactionQueue = pending.catch(() => undefined);
        await pending;
    }

    private async runTransaction(callback: (database: Database) => Promise<void>) {
        if (!this.database) throw new Error('Database not initialized');
        const snapshot = this.database.export();
        let committed = false;
        try {
            this.database.exec('BEGIN TRANSACTION');
            await callback(this.database);
            this.database.exec('COMMIT');
            committed = true;
            await this.saveDatabase();
        } catch (error) {
            if (committed) {
                // export() closes SQLite's transaction, so an ordinary ROLLBACK cannot
                // undo a failed persistence after COMMIT. Restore all DAOs atomically.
                this.liveDatabase!.close();
                this.liveDatabase = this.restoreDatabase!(snapshot);
            } else {
                this.database.exec('ROLLBACK');
            }
            console.error('Transaction error:', error);
            throw error;
        }
    }

    private async saveDatabase() {
        if (!this.database) return;
        
        const databaseData = this.database.export();
        const buffer = Buffer.from(databaseData);
        const adapter = this.app.vault.adapter;
        if (typeof FileSystemAdapter !== 'undefined' && adapter instanceof FileSystemAdapter) {
            const target = this.pluginFile('database.db', true);
            const temporary = `${target}.tmp`;
            try {
                // Same-directory rename keeps the previous database intact until the
                // complete replacement has been flushed successfully.
                const file = await fs.promises.open(temporary, 'w', 0o600);
                try {
                    await file.writeFile(buffer);
                    await file.sync();
                } finally {
                    await file.close();
                }
                await fs.promises.rename(temporary, target);
            } catch (error) {
                await fs.promises.unlink(temporary).catch(() => undefined);
                throw error;
            }
        } else {
            await adapter.writeBinary(
                this.databasePath,
                buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
            );
        }
    }

    private initDaos(database: Database): Dao<any, any>[] {
        this.smallMonsterDao = new SmallMonsterSqlTableDao(database, this.app, this.manifest);
        this.fullMonsterDao = new FullMonsterSqlTableDao(database);
        this.smallSpellDao = new SmallSpellSqlTableDao(database, this.app, this.manifest);
        this.fullSpellDao = new FullSpellSqlTableDao(database);
        this.dmScreenGroupDao = new DmScreenGroupSqlTableDao(database, this.app, this.manifest);
        this.smallWeaponDao = new SmallWeaponSqlTableDao(database, this.app, this.manifest);
        this.fullWeaponDao = new FullWeaponSqlTableDao(database);
        this.smallArmorDao = new SmallArmorSqlTableDao(database, this.app, this.manifest);
        this.fullArmorDao = new FullArmorSqlTableDao(database);
        this.smallItemDao = new SmallItemSqlTableDao(database, this.app, this.manifest);
        this.fullItemDao = new FullItemSqlTableDao(database);
        this.smallArtifactDao = new SmallArtifactSqlTableDao(database, this.app, this.manifest);
        this.fullArtifactDao = new FullArtifactSqlTableDao(database);
        this.smallBackgroundDao = new SmallBackgroundSqlTableDao(database, this.app, this.manifest);
        this.fullBackgroundDao = new FullBackgroundSqlTableDao(database);
        this.smallFeatDao = new SmallFeatSqlTableDao(database, this.app, this.manifest);
        this.fullFeatDao = new FullFeatSqlTableDao(database);
        this.smallRaceDao = new SmallRaceSqlTableDao(database, this.app, this.manifest);
        this.fullRaceDao = new FullRaceSqlTableDao(database);
        this.smallClassDao = new SmallClassSqlTableDao(database, this.app, this.manifest);
        this.fullClassDao = new FullClassSqlTableDao(database);
        this.characterSheetDao = new CharacterSheetSqlTableDao(database, this.app, this.manifest);
        return this.getDaos();
    }

    private getDaos(): Dao<any, any>[] {
        return [
            this.smallMonsterDao,
            this.fullMonsterDao,
            this.smallSpellDao,
            this.fullSpellDao,
            this.dmScreenGroupDao,
            this.smallWeaponDao,
            this.fullWeaponDao,
            this.smallArmorDao,
            this.fullArmorDao,
            this.smallItemDao,
            this.fullItemDao,
            this.smallArtifactDao,
            this.fullArtifactDao,
            this.smallBackgroundDao,
            this.fullBackgroundDao,
            this.smallFeatDao,
            this.fullFeatDao,
            this.smallRaceDao,
            this.fullRaceDao,
            this.smallClassDao,
            this.fullClassDao,
            this.characterSheetDao,
        ];
    }

    private createSeedOrchestrator(): DatabaseSeedOrchestrator {
        return new DatabaseSeedOrchestrator(
            new SeedStore(new DbTransactionalStore(this)),
            {
                smallMonsterDao: this.smallMonsterDao,
                smallSpellDao: this.smallSpellDao,
                dmScreenGroupDao: this.dmScreenGroupDao,
                smallWeaponDao: this.smallWeaponDao,
                smallArmorDao: this.smallArmorDao,
                smallItemDao: this.smallItemDao,
                smallArtifactDao: this.smallArtifactDao,
                smallBackgroundDao: this.smallBackgroundDao,
                smallFeatDao: this.smallFeatDao,
                smallRaceDao: this.smallRaceDao,
                smallClassDao: this.smallClassDao,
            },
        );
    }

    private pluginFile(filename: string, absolute = false) {
        const path = [
            this.app.vault.configDir,
            'plugins',
            this.manifest.id,
            filename
        ]
        if (absolute) {
            const adapter = this.app.vault.adapter;
            if (adapter instanceof FileSystemAdapter) {
                path.unshift(adapter.getBasePath());
            } else {
                throw new Error('Base path недоступен для текущего адаптера');
            }
        }
        return path.join('/').trim();
    }

    private async checkClassesMigration(): Promise<boolean> {
        if (!this.database) return false;
        try {
            const result = this.database.exec(`PRAGMA table_info(full_classes);`);
            if (result.length > 0) {
                const columns = result[0].values.map(v => v[1] as string);
                return columns.includes('archetypes'); // Old schema has this column
            }
        } catch (error) {
            // Table doesn't exist - no migration needed
            return false;
        }
        return false;
    }

    private async migrateClassesTables(): Promise<void> {
        if (!this.database) return;
        await this.transaction(async () => {
            // Drop old tables
            this.database!.exec(`DROP TABLE IF EXISTS small_classes;`);
            this.database!.exec(`DROP TABLE IF EXISTS full_classes;`);

            // Create new tables
            await this.smallClassDao.createTable();
            await this.fullClassDao.createTable();

        });
        await this.createSeedOrchestrator().seedSmallClass();
        console.log('Classes migration complete.');
    }

    private async backfillRemoteOrigins(): Promise<void> {
        const tables: Array<[EntityKind, string]> = [
            ["bestiary", "small_bestiary"],
            ["spellbook", "small_spellbook"],
            ["dm-screen", "dm_screen_items"],
            ["arsenal", "small_arsenal"],
            ["armory", "small_armory"],
            ["equipment", "small_equipment"],
            ["artifactory", "small_artifactory"],
            ["backgrounds", "small_backgrounds"],
            ["feats", "small_feats"],
            ["races", "small_races"],
            ["classes", "small_classes"],
        ];
        await this.transaction(async () => {
            for (const [kind, table] of tables) {
                const result = this.database!.exec(`SELECT url FROM ${table};`);
                const bundledUrls = bundledEntityUrlsByKind[kind] ?? new Set<string>();
                for (const [urlValue] of result[0]?.values ?? []) {
                    const url = String(urlValue);
                    if (await this.entityOriginDao.exists(kind, url)) continue;
                    if (bundledUrls.has(url)) await this.entityOriginDao.ensureRemote(kind, url);
                    else await this.entityOriginDao.markManual(kind, url);
                }
            }
        });
    }
}
