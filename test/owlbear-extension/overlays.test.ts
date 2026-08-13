import { describe, expect, it } from "vitest";
import { deriveMarkers } from "../../owlbear-extension/src/overlays";
import type { OwlbearParticipantSnapshot } from "../../owlbear-extension/src/types";

function participant(overrides: Partial<OwlbearParticipantSnapshot>): OwlbearParticipantSnapshot {
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
	it("shows bloodied marker at 50 percent HP", () => {
		expect(deriveMarkers(participant({ hpCurrent: 5 }), 1).map((marker) => marker.kind)).toContain("bloodied");
	});

	it("shows defeated marker instead of bloodied at zero HP", () => {
		const markers = deriveMarkers(participant({ hpCurrent: 0 }), 1).map((marker) => marker.kind);

		expect(markers).toContain("defeated");
		expect(markers).not.toContain("bloodied");
	});

	it("shows concentration and nearest condition duration markers", () => {
		const markers = deriveMarkers(
			participant({
				isConcentrating: true,
				conditions: [
					{ url: "/screens/blinded", expiresOnRound: 5 },
					{ url: "/screens/poisoned", expiresOnRound: null },
					{ url: "/screens/stunned", expiresOnRound: 3 },
				],
			}),
			2,
		);

		expect(markers.map((marker) => marker.kind)).toEqual(["concentration", "condition-duration"]);
		expect(markers[1].text).toBe("1");
	});
});
