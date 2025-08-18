import { App, PluginManifest } from "obsidian";
import { Database } from "sql.js";
import { vi } from 'vitest';

export const mockDatabase: Database = {
    exec: vi.fn(),
} as unknown as Database;

export const mockApp = {} as App;
export const mockManifest = {} as PluginManifest;