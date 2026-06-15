import { describe, expect, it, vi } from "vitest";
import { PANEL_KEYS } from "src/domain/models/assistant/AssistantWorkspace";
import { detachLegacyPanelViews } from "src/ui/components/sidepanel/LegacyPanelViews";

describe("detachLegacyPanelViews", () => {
	it("detaches every legacy feature view type on normal upgrades", () => {
		const detachLeavesOfType = vi.fn();

		detachLegacyPanelViews({ detachLeavesOfType });

		expect(detachLeavesOfType.mock.calls.map(([viewType]) => viewType)).toEqual(
			PANEL_KEYS.map((key) => `obsidian-dnd-statblock-side-panel-${key}`),
		);
	});
});
