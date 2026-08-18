export const OWLBEAR_PREVIEW_SCHEMA_VERSION = 1;
export const OWLBEAR_PREVIEW_ID_KEY = "club.ttg.dnd-dm-tools/previewId";
export const OWLBEAR_PREVIEW_KIND_KEY = "club.ttg.dnd-dm-tools/previewKind";

export interface OwlbearPreviewSnapshot {
	schemaVersion: 1;
	previewId: string;
	name: string;
	createdAt: string;
	imageMime: string;
	imageWidth: number;
	imageHeight: number;
	imageDataUrl?: string;
	imageAssetId?: string;
	imageUrl?: string;
}

export function isOwlbearPreviewSnapshot(value: unknown): value is OwlbearPreviewSnapshot {
	if (!value || typeof value !== "object") return false;
	const preview = value as Record<string, unknown>;
	return preview.schemaVersion === OWLBEAR_PREVIEW_SCHEMA_VERSION
		&& typeof preview.previewId === "string"
		&& typeof preview.name === "string"
		&& typeof preview.createdAt === "string"
		&& typeof preview.imageMime === "string"
		&& typeof preview.imageWidth === "number"
		&& Number.isFinite(preview.imageWidth)
		&& preview.imageWidth > 0
		&& typeof preview.imageHeight === "number"
		&& Number.isFinite(preview.imageHeight)
		&& preview.imageHeight > 0;
}
