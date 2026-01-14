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
import type { Initializable } from 'src/domain/Initializable';

export default class DB implements Initializable {

    private database: Database | null = null;
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

            const database = new SQL.Database(databaseData);
            this.database = database;
            const sqlTableDaos = this.initDaos(database);

            // Create tables if they do not exist
            await this.transaction(async () => {
                await Promise.all(
                    sqlTableDaos.map(tableDao => tableDao.initialize())
                );
            });

            // Fill tables with initial data
            await this.transaction(async () => {
                await Promise.all(
                    sqlTableDaos.map(tableDao => tableDao.fillTableWithData())
                );
            });

            console.log('Database initialized');
        } catch (error) {
            console.error('Database init error:', error);
        }
    }

    async dispose() {
        this.getDaos().forEach(dao => dao.dispose());
        if (this.database) {
            this.database.close();
        }
    }

    async transaction(callback: (database: Database) => Promise<void>) {
        if (!this.database) throw new Error('Database not initialized');
        
        try {
            this.database.exec('BEGIN TRANSACTION');
            await callback(this.database);
            this.database.exec('COMMIT');
            await this.saveDatabase();
        } catch (error) {
            this.database.exec('ROLLBACK');
            console.error('Transaction error:', error);
            throw error;
        }
    }

    private async saveDatabase() {
        if (!this.database) return;
        
        try {
            const databaseData = this.database.export();
            const buffer = Buffer.from(databaseData);
            await this.app.vault.adapter.writeBinary(
                this.databasePath, 
                buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
            );
        } catch (error) {
            console.error('Database save error:', error);
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
        ];
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
}
