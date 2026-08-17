import { describe, expect, it } from "vitest";
import { createPublicInitiativeState, publicInitiativeFromMetadata } from "../../owlbear-extension/src/publicInitiative";
import { OWLBEAR_PUBLIC_INITIATIVE_KEY, type OwlbearEncounterSnapshot } from "../../owlbear-extension/src/types";

function snapshot(): OwlbearEncounterSnapshot {
	return {
		schemaVersion: 1,
		snapshotId: "snapshot-secret",
		encounterId: "encounter-secret",
		encounterName: "Secret encounter name",
		round: 3,
		activeParticipantId: 2,
		nextParticipantId: 1,
		createdAt: "2026-08-18T00:00:00.000Z",
		participants: [
			{
				participantId: 1,
				name: "Ариа",
				imageUrl: "https://assets.example.test/aria.webp",
				initiative: 18,
				hpCurrent: 4,
				hpMax: 10,
				hpTemporary: 5,
				armorClass: 17,
				side: "pc",
				colorHex: "#22c55e",
				isDead: false,
				isConcentrating: true,
				conditions: [
					{ url: "/screens/blinded", expiresOnRound: 5 },
					{ url: "/screens/stunned", expiresOnRound: 3 },
				],
			},
			{
				participantId: 2,
				name: "Гоблин",
				initiative: 12,
				hpCurrent: 0,
				hpMax: 7,
				hpTemporary: 0,
				armorClass: 15,
				side: "enemy",
				isDead: false,
				conditions: [],
			},
		],
		tokenLinks: [{ participantId: 1, owlbearItemId: "token-secret", lastSeenAt: "2026-08-18T00:00:00.000Z" }],
	};
}

describe("public Owlbear initiative", () => {
	it("keeps initiative order and derives only public statuses", () => {
		const state = createPublicInitiativeState(snapshot());

		expect(state).toEqual({
			schemaVersion: 1,
			round: 3,
			participants: [
				{
					name: "Ариа",
					color: "#22c55e",
					portraitUrl: "https://assets.example.test/aria.webp",
					initiative: 18,
					isActive: false,
					statuses: [
						{ kind: "bloodied", icon: "bloodied" },
						{ kind: "concentration", icon: "concentration" },
						{ kind: "condition", icon: "blinded", remainingRounds: 2 },
					],
				},
				{
					name: "Гоблин",
					color: "#94a3b8",
					initiative: 12,
					isActive: true,
					statuses: [{ kind: "down", icon: "down" }],
				},
			],
		});
	});

	it("suppresses every other status for dead participants", () => {
		const value = snapshot();
		value.participants[0].isDead = true;
		expect(createPublicInitiativeState(value).participants[0].statuses).toEqual([{ kind: "dead", icon: "dead" }]);
	});

	it("does not leak sensitive fields into the public projection", () => {
		const serialized = JSON.stringify(createPublicInitiativeState(snapshot()));
		for (const secret of ["hpCurrent", "hpMax", "hpTemporary", "armorClass", "side", "encounterName", "encounterId", "snapshotId", "participantId", "token-secret"]) {
			expect(serialized).not.toContain(secret);
		}
	});

	it("reads only a valid public state from scene metadata", () => {
		const state = createPublicInitiativeState(snapshot());
		expect(publicInitiativeFromMetadata({ [OWLBEAR_PUBLIC_INITIATIVE_KEY]: state })).toEqual(state);
		expect(publicInitiativeFromMetadata({ [OWLBEAR_PUBLIC_INITIATIVE_KEY]: { schemaVersion: 1, round: 1, participants: [{ name: "x" }] } })).toBeNull();
	});
});
