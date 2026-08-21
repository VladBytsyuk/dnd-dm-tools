export const ENTITY_KINDS = [
	"bestiary",
	"spellbook",
	"dm-screen",
	"arsenal",
	"armory",
	"equipment",
	"artifactory",
	"backgrounds",
	"feats",
	"races",
	"classes",
] as const;

export type EntityKind = typeof ENTITY_KINDS[number];
export type EntityOrigin = "remote" | "manual";

export interface ItemSaveContext {
	originalUrl?: string;
	originalOrigin?: EntityOrigin;
}

export type ItemSaveResult =
	| { ok: true }
	| {
		ok: false;
		code: "url-required" | "url-unchanged" | "url-occupied" | "manual-url-immutable" | "save-failed";
		message: string;
	};
