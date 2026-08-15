import { describe, expect, it } from "vitest";
import { deriveMarkers, layoutMarkers } from "../../owlbear-extension/src/overlays";
import type { OwlbearParticipantSnapshot, TokenMarker } from "../../owlbear-extension/src/types";

function participant(overrides: Partial<OwlbearParticipantSnapshot> = {}): OwlbearParticipantSnapshot {
	return {
		participantId: 1,
		name: "Goblin",
		initiative: 10,
		hpCurrent: 10,
		hpMax: 10,
		hpTemporary: 0,
		armorClass: 15,
		side: "enemy",
		isDead: false,
		conditions: [],
		...overrides,
	};
}

describe("Owlbear extension overlays", () => {
	it("shows bloodied only below 50 percent HP", () => {
		expect(deriveMarkers(participant({ hpCurrent: 4.9 }), 1).map((marker) => marker.kind)).toEqual(["bloodied"]);
		expect(deriveMarkers(participant({ hpCurrent: 5 }), 1)).toEqual([]);
	});

	it("does not add a status marker at zero HP", () => {
		const markers = deriveMarkers(participant({ hpCurrent: 0 }), 1).map((marker) => marker.kind);

		expect(markers).toEqual([]);
	});

	it("keeps other statuses for a participant at zero HP", () => {
		const markers = deriveMarkers(participant({
			hpCurrent: 0,
			isConcentrating: true,
			conditions: [{ url: "/screens/blinded", expiresOnRound: null }],
		}), 1);

		expect(markers.map((marker) => marker.kind)).toEqual(["concentration", "condition"]);
	});

	it("does not add status markers for a dead participant", () => {
		const markers = deriveMarkers(participant({
			hpCurrent: 0,
			isDead: true,
			isConcentrating: true,
			conditions: [{ url: "/screens/blinded", expiresOnRound: 5 }],
		}), 1);

		expect(markers).toEqual([]);
	});

	it("shows concentration and every active condition in tracker order", () => {
		const markers = deriveMarkers(participant({
			isConcentrating: true,
			conditions: [
				{ url: "/screens/poisoned", expiresOnRound: null },
				{ url: "/screens/blinded", expiresOnRound: 5 },
				{ url: "/screens/stunned", expiresOnRound: 3 },
			],
		}), 2);

		expect(markers).toEqual([
			{ kind: "concentration", icon: "concentration" },
			{ kind: "condition", icon: "blinded", conditionUrl: "/screens/blinded", remainingRounds: 3 },
			{ kind: "condition", icon: "poisoned", conditionUrl: "/screens/poisoned", remainingRounds: undefined },
			{ kind: "condition", icon: "stunned", conditionUrl: "/screens/stunned", remainingRounds: 1 },
		]);
	});

	it("skips expired conditions and uses a fallback icon for unknown ones", () => {
		const markers = deriveMarkers(participant({
			conditions: [
				{ url: "/screens/blinded", expiresOnRound: 2 },
				{ url: "/screens/homebrew", expiresOnRound: null },
			],
		}), 2);

		expect(markers).toEqual([{ kind: "condition", icon: "condition", conditionUrl: "/screens/homebrew", remainingRounds: undefined }]);
	});
});

describe("Owlbear marker layout", () => {
	it("anchors markers inside the top right corner and wraps after four", () => {
		const markers: TokenMarker[] = Array.from({ length: 5 }, () => ({ kind: "condition", icon: "condition" }));
		const layout = layoutMarkers(markers, 100);

		expect(layout[0]).toMatchObject({ x: 36, y: -36 });
		expect(layout[3].x).toBeLessThan(layout[2].x);
		expect(layout[4]).toMatchObject({ x: 36, y: -13 });
	});
});
