import { Buffer } from 'buffer';
import type { Dao } from '../../domain/Dao';
import { SmallMosterSqlTableDao } from './SmallMosterSqlTableDao';
import { FileSystemAdapter, type App, type PluginManifest } from 'obsidian';
import initSqlJs, { type Database } from 'sql.js';
import { FullMonsterSqlTableDao } from './FullMonsterSqlTableDao';
import { SmallSpellSqlTableDao } from './SmallSpellSqlTableDao';
import { FullSpellSqlTableDao } from './FullSpellSqlTableDao';
import { DmScreenGroupSqlTableDao } from './DmScreenGroupSqlTableDao';
import { SmallWeaponSqlTableDao } from './SmallWeaponSqlTableDao';
import { FullWeaponSqlTableDao } from './FullWeaponSqlTableDao';

export default class DB {

    private database: Database | null = null;
    private databasePath: string;
    public smallMonsterDao: SmallMosterSqlTableDao;
    public fullMonsterDao: FullMonsterSqlTableDao;
    public smallSpellDao: SmallSpellSqlTableDao;
    public fullSpellDao: FullSpellSqlTableDao;
    public dmScreenGroupDao: DmScreenGroupSqlTableDao;
    public smallWeaponDao: SmallWeaponSqlTableDao;
    public fullWeaponDao: FullWeaponSqlTableDao;

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
                    const fs = require('fs');
                    wasmBinary = fs.readFileSync(wasmFile);
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

    dispose() {
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
        this.smallMonsterDao = new SmallMosterSqlTableDao(database, this.app, this.manifest);
        this.fullMonsterDao = new FullMonsterSqlTableDao(database);
        this.smallSpellDao = new SmallSpellSqlTableDao(database, this.app, this.manifest);
        this.fullSpellDao = new FullSpellSqlTableDao(database);
        this.dmScreenGroupDao = new DmScreenGroupSqlTableDao(database, this.app, this.manifest);
        this.smallWeaponDao = new SmallWeaponSqlTableDao(database, this.app, this.manifest);
        this.fullWeaponDao = new FullWeaponSqlTableDao(database);
        return [
            this.smallMonsterDao,
            this.fullMonsterDao,
            this.smallSpellDao,
            this.fullSpellDao,
            this.dmScreenGroupDao,
            this.smallWeaponDao,
            this.fullWeaponDao,
        ];
    }

    private pluginFile(filename: string, absolute: boolean = false) {
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
