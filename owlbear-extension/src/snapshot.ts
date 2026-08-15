import {
	OWLBEAR_SYNC_SCHEMA_VERSION,
	type OwlbearEncounterSnapshot,
	type OwlbearParticipantSnapshot,
} from "./types";

export function parseSnapshot(input: string): OwlbearEncounterSnapshot {
	const parsed = JSON.parse(input) as unknown;
	if (!isSnapshot(parsed)) {
		throw new Error("Invalid DnD DM Tools Owlbear snapshot.");
	}
	return parsed;
}

function isSnapshot(value: unknown): value is OwlbearEncounterSnapshot {
	if (!value || typeof value !== "object") return false;
	const snapshot = value as Record<string, unknown>;
	return snapshot.schemaVersion === OWLBEAR_SYNC_SCHEMA_VERSION
		&& typeof snapshot.snapshotId === "string"
		&& typeof snapshot.encounterId === "string"
		&& typeof snapshot.encounterName === "string"
		&& typeof snapshot.round === "number"
		&& Array.isArray(snapshot.participants)
		&& snapshot.participants.every(isParticipant)
		&& Array.isArray(snapshot.tokenLinks);
}

function isParticipant(value: unknown): value is OwlbearParticipantSnapshot {
	if (!value || typeof value !== "object") return false;
	const participant = value as Record<string, unknown>;
	return typeof participant.participantId === "number"
		&& typeof participant.name === "string"
		&& typeof participant.hpCurrent === "number"
		&& typeof participant.hpMax === "number"
		&& typeof participant.isDead === "boolean"
		&& Array.isArray(participant.conditions);
}
