import type { Database } from "sql.js";
import type { McpEntityKind } from "src/data/mcp/McpEntitySchemas";

export type McpOperationStatus = "pending" | "running" | "succeeded" | "rejected" | "failed" | "interrupted";
export type McpOperationError = { code: string; message: string };
export type McpChange = { kind: McpEntityKind; url: string; before: Record<string, unknown> | null; after: Record<string, unknown> | null };
export type McpOperation = {
	operationId: string; requestHash: string; status: McpOperationStatus; createdAt: number; updatedAt: number;
	result?: unknown; error?: McpOperationError; changes?: McpChange[]; summary?: Array<{kind: McpEntityKind; url: string; name: string; action: string}>; undoneBy?: string; undoTargetId?: string;
};
export interface McpOperationAccess {
	get(id: string): McpOperation | null | Promise<McpOperation | null>;
	save(operation: McpOperation): void | Promise<void>;
	list(offset: number, limit: number): { items: McpOperation[]; total: number } | Promise<{ items: McpOperation[]; total: number }>;
}

/** SQL only: the caller owns serialization and persistence. */
export class McpOperationsDao implements McpOperationAccess {
	constructor(private readonly database: Database) {}
	initialize(): void {
		this.database.exec("CREATE TABLE IF NOT EXISTS mcp_operations (operation_id TEXT PRIMARY KEY, created_at INTEGER NOT NULL, data TEXT NOT NULL);");
	}
	interruptPending(): void {
		const rows = this.database.exec("SELECT data FROM mcp_operations;")[0]?.values ?? [];
		for (const [json] of rows) {
			const operation = JSON.parse(String(json)) as McpOperation;
			if (operation.status === "pending" || operation.status === "running") this.save({ ...operation, status: "interrupted", updatedAt: Date.now(), error: { code: "interrupted", message: "Obsidian был перезапущен. Требуется новая операция и новое подтверждение." } });
		}
	}
	get(id: string): McpOperation | null {
		const value = this.database.exec("SELECT data FROM mcp_operations WHERE operation_id = ?;", [id])[0]?.values[0]?.[0];
		return value ? JSON.parse(String(value)) : null;
	}
	save(operation: McpOperation): void {
		this.database.exec("INSERT INTO mcp_operations(operation_id, created_at, data) VALUES (?, ?, ?) ON CONFLICT(operation_id) DO UPDATE SET data=excluded.data;", [operation.operationId, operation.createdAt, JSON.stringify(operation)]);
	}
	list(offset: number, limit: number) {
		const total = Number(this.database.exec("SELECT COUNT(*) FROM mcp_operations;")[0]?.values[0]?.[0] ?? 0);
		const rows = this.database.exec("SELECT data FROM mcp_operations ORDER BY created_at DESC, operation_id DESC LIMIT ? OFFSET ?;", [limit, offset])[0]?.values ?? [];
		return { items: rows.map(([json]) => JSON.parse(String(json)) as McpOperation), total };
	}
}
