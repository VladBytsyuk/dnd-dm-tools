import type { OwlbearEncounterSnapshot, OwlbearSyncDiagnostics } from "./types";

export interface ExtensionState {
	snapshot: OwlbearEncounterSnapshot | null;
	diagnostics: OwlbearSyncDiagnostics;
}

export function createInitialDiagnostics(): OwlbearSyncDiagnostics {
	return {
		sceneReady: false,
		snapshotLoaded: false,
		linkedCount: 0,
		participantCount: 0,
		staleTokenIds: [],
		missingParticipantIds: [],
	};
}

export const state: ExtensionState = {
	snapshot: null,
	diagnostics: createInitialDiagnostics(),
};
