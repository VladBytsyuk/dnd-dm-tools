import { describe, expect, it } from "vitest";
import { renderPublicInitiative } from "../../owlbear-extension/src/publicInitiativeUi";
import type { PublicInitiativeState } from "../../owlbear-extension/src/types";

const state: PublicInitiativeState = {
	schemaVersion: 1,
	round: 4,
	participants: [{
		name: "Ариа",
		color: "#22c55e",
		initiative: 19,
		isActive: true,
		statuses: [{ kind: "condition", icon: "blinded", remainingRounds: 2 }],
	}],
};

describe("public initiative action UI", () => {
	it("renders the public fields and active participant styling", () => {
		const container = document.createElement("section");
		renderPublicInitiative(container, state);

		expect(container.textContent).toContain("Раунд 4");
		expect(container.textContent).toContain("Ариа");
		expect(container.textContent).toContain("19");
		expect(container.querySelector(".initiative-participant")?.dataset.active).toBe("true");
		expect(container.querySelector(".initiative-status-rounds")?.textContent).toBe("2");
		expect(container.querySelector(".initiative-portrait-fallback")?.textContent).toBe("А");
	});

	it("renders an empty state when no initiative was published", () => {
		const container = document.createElement("section");
		renderPublicInitiative(container, null);
		expect(container.textContent).toContain("Инициатива ещё не опубликована");
	});
});
