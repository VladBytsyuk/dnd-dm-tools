import OBR from "@owlbear-rodeo/sdk";
import { deriveMarkers } from "./overlays";
import {
	OWLBEAR_PUBLIC_INITIATIVE_KEY,
	type OwlbearEncounterSnapshot,
	type PublicInitiativeParticipant,
	type PublicInitiativeState,
	type PublicInitiativeStatus,
} from "./types";

const PUBLIC_INITIATIVE_SCHEMA_VERSION = 1 as const;
const DEFAULT_PARTICIPANT_COLOR = "#94a3b8";

/** Creates the strict public allowlist from the GM-local synchronization snapshot. */
export function createPublicInitiativeState(snapshot: OwlbearEncounterSnapshot): PublicInitiativeState {
	return {
		schemaVersion: PUBLIC_INITIATIVE_SCHEMA_VERSION,
		round: snapshot.round,
		participants: snapshot.participants.map((participant) => ({
			name: participant.name,
			color: participant.colorHex ?? DEFAULT_PARTICIPANT_COLOR,
			portraitUrl: publicPortraitUrl(participant.imageUrl),
			initiative: participant.initiative,
			isActive: participant.participantId === snapshot.activeParticipantId,
			statuses: publicStatuses(participant, snapshot.round),
		})),
	};
}

export async function publishPublicInitiative(snapshot: OwlbearEncounterSnapshot): Promise<void> {
	await OBR.scene.setMetadata({ [OWLBEAR_PUBLIC_INITIATIVE_KEY]: createPublicInitiativeState(snapshot) });
}

export async function clearPublicInitiative(): Promise<void> {
	if (!(await OBR.scene.isReady())) return;
	await OBR.scene.setMetadata({ [OWLBEAR_PUBLIC_INITIATIVE_KEY]: null });
}

export function publicInitiativeFromMetadata(metadata: Record<string, unknown>): PublicInitiativeState | null {
	const value = metadata[OWLBEAR_PUBLIC_INITIATIVE_KEY];
	return isPublicInitiativeState(value) ? value : null;
}

export function isPublicInitiativeState(value: unknown): value is PublicInitiativeState {
	if (!value || typeof value !== "object") return false;
	const state = value as Record<string, unknown>;
	return state.schemaVersion === PUBLIC_INITIATIVE_SCHEMA_VERSION
		&& typeof state.round === "number"
		&& Array.isArray(state.participants)
		&& state.participants.every(isPublicParticipant);
}

function publicStatuses(
	participant: OwlbearEncounterSnapshot["participants"][number],
	round: number,
): PublicInitiativeStatus[] {
	if (participant.isDead) return [{ kind: "dead", icon: "dead" }];

	const statuses: PublicInitiativeStatus[] = [];
	if (participant.hpCurrent <= 0) statuses.push({ kind: "down", icon: "down" });
	for (const marker of deriveMarkers(participant, round)) {
		statuses.push({
			kind: marker.kind,
			icon: marker.icon,
			...(marker.remainingRounds == null ? {} : { remainingRounds: marker.remainingRounds }),
		});
	}
	return statuses;
}

function publicPortraitUrl(value: string | undefined): string | undefined {
	return value && /^https:\/\//i.test(value) ? value : undefined;
}

function isPublicParticipant(value: unknown): value is PublicInitiativeParticipant {
	if (!value || typeof value !== "object") return false;
	const participant = value as Record<string, unknown>;
	return typeof participant.name === "string"
		&& typeof participant.color === "string"
		&& (participant.portraitUrl === undefined || typeof participant.portraitUrl === "string")
		&& typeof participant.initiative === "number"
		&& typeof participant.isActive === "boolean"
		&& Array.isArray(participant.statuses)
		&& participant.statuses.every(isPublicStatus);
}

function isPublicStatus(value: unknown): value is PublicInitiativeStatus {
	if (!value || typeof value !== "object") return false;
	const status = value as Record<string, unknown>;
	return (status.kind === "bloodied" || status.kind === "concentration" || status.kind === "condition" || status.kind === "down" || status.kind === "dead")
		&& typeof status.icon === "string"
		&& (status.remainingRounds === undefined || typeof status.remainingRounds === "number");
}
