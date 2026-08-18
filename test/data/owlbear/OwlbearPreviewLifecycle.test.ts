import { describe, expect, it, vi } from "vitest";
import { clearActiveOwlbearPreview } from "src/data/owlbear/OwlbearPreviewLifecycle";

const preview = {
	schemaVersion: 1 as const,
	previewId: "preview-1",
	name: "Handout",
	createdAt: "2026-08-18T00:00:00.000Z",
	imageMime: "image/png",
	imageWidth: 100,
	imageHeight: 100,
};

describe("Owlbear preview lifecycle", () => {
	it("treats a disconnected extension as an already-cleared preview", async () => {
		const clearPreview = vi.fn();

		await expect(clearActiveOwlbearPreview(preview, {
			getStatus: () => ({ connected: false }),
			clearPreview,
		})).resolves.toBeUndefined();

		expect(clearPreview).not.toHaveBeenCalled();
	});

	it("waits for remote cleanup while the extension is connected", async () => {
		const clearPreview = vi.fn().mockResolvedValue(undefined);

		await clearActiveOwlbearPreview(preview, {
			getStatus: () => ({ connected: true }),
			clearPreview,
		});

		expect(clearPreview).toHaveBeenCalledWith("preview-1");
	});

	it("preserves a connected cleanup failure for the caller", async () => {
		const error = new Error("scene unavailable");

		await expect(clearActiveOwlbearPreview(preview, {
			getStatus: () => ({ connected: true }),
			clearPreview: vi.fn().mockRejectedValue(error),
		})).rejects.toBe(error);
	});
});
