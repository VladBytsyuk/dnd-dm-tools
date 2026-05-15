export type ServiceResult<T> =
	| { ok: true; value: T }
	| { ok: false; reason: "not-found" | "network" | "invalid-response"; error?: unknown };
