import type { OwlbearPreviewSnapshot } from "src/domain/models/owlbear/OwlbearPreview";

type OwlbearPreviewTransport = {
	getStatus(): { connected: boolean };
	clearPreview(previewId: string): Promise<void>;
};

export async function clearActiveOwlbearPreview(
	preview: OwlbearPreviewSnapshot | null,
	server: OwlbearPreviewTransport | null,
): Promise<void> {
	if (!preview || !server?.getStatus().connected) return;
	await server.clearPreview(preview.previewId);
}
