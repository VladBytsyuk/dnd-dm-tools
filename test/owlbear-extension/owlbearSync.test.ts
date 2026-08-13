import { describe, expect, it } from "vitest";
import { findStaleTokenIds, getConditionBadgePosition, getConditionBadgeTextPosition } from "../../owlbear-extension/src/owlbearSync";
import {
	OWLBEAR_ENCOUNTER_ID_KEY,
	OWLBEAR_MARKER_KIND_KEY,
	OWLBEAR_PARTICIPANT_ID_KEY,
} from "../../owlbear-extension/src/types";
import type { OwlbearEncounterSnapshot } from "../../owlbear-extension/src/types";

function snapshot(participantIds: number[], encounterId = "encounter-1"): OwlbearEncounterSnapshot {
	return {
		schemaVersion: 1,
		snapshotId: "snapshot-1",
		encounterId,
		encounterName: "Test",
		round: 1,
		activeParticipantId: null,
		nextParticipantId: null,
		createdAt: "2026-08-13T00:00:00.000Z",
		participants: participantIds.map((participantId) => ({
			participantId,
			name: `Participant ${participantId}`,
			initiative: 10,
			hpCurrent: 10,
			hpMax: 10,
			hpTemporary: 0,
			armorClass: 10,
			side: "enemy",
			isDead: false,
			conditions: [],
		})),
		tokenLinks: [],
	};
}

describe("Owlbear scene synchronization", () => {
	it("finds only stale token images in the current encounter", () => {
		const current = snapshot([1]);
		const items = [
			{ id: "current", type: "IMAGE", metadata: { [OWLBEAR_ENCOUNTER_ID_KEY]: "encounter-1", [OWLBEAR_PARTICIPANT_ID_KEY]: 1 } },
			{ id: "removed", type: "IMAGE", metadata: { [OWLBEAR_ENCOUNTER_ID_KEY]: "encounter-1", [OWLBEAR_PARTICIPANT_ID_KEY]: 2 } },
			{ id: "marker", type: "IMAGE", metadata: { [OWLBEAR_ENCOUNTER_ID_KEY]: "encounter-1", [OWLBEAR_PARTICIPANT_ID_KEY]: 2, [OWLBEAR_MARKER_KIND_KEY]: "condition" } },
			{ id: "other-encounter", type: "IMAGE", metadata: { [OWLBEAR_ENCOUNTER_ID_KEY]: "encounter-2", [OWLBEAR_PARTICIPANT_ID_KEY]: 2 } },
			{ id: "manual", type: "IMAGE", metadata: { [OWLBEAR_PARTICIPANT_ID_KEY]: 2 } },
		];

		expect(findStaleTokenIds(items, current)).toEqual(["removed"]);
	});

	it("places condition duration badges to the right and below the icon", () => {
		expect(getConditionBadgePosition({ x: 100, y: 200 }, 50)).toEqual({ x: 118, y: 218 });
		expect(getConditionBadgeTextPosition({ x: 118, y: 218 }, 20)).toEqual({ x: 108, y: 208 });
	});
});
