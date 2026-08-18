import { describe, expect, it } from "vitest";
import { isOwlbearPreviewSnapshot } from "src/domain/models/owlbear/OwlbearPreview";

describe("OwlbearPreviewSnapshot", () => {
	it("accepts a complete preview descriptor and rejects invalid dimensions", () => {
		const preview = {
			schemaVersion: 1,
			previewId: "preview-1",
			name: "Handout",
			createdAt: "2026-08-17T00:00:00.000Z",
			imageMime: "image/png",
			imageWidth: 1200,
			imageHeight: 800,
		};
		expect(isOwlbearPreviewSnapshot(preview)).toBe(true);
		expect(isOwlbearPreviewSnapshot({ ...preview, imageWidth: 0 })).toBe(false);
	});
});
