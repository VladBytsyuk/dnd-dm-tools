import OBR, { buildImage, buildShape } from "@owlbear-rodeo/sdk";
import {
	OWLBEAR_PREVIEW_ID_KEY,
	OWLBEAR_PREVIEW_KIND_KEY,
	type OwlbearPreviewSnapshot,
} from "./types";

const PREVIEW_Z_INDEX = 900_000;

export async function pushPreviewToScene(preview: OwlbearPreviewSnapshot): Promise<void> {
	if (!(await OBR.scene.isReady())) throw new Error("No active Owlbear scene.");
	if (!preview.imageUrl) throw new Error("Не получен URL изображения превью.");
	const [topLeft, bottomRight, gridDpi] = await Promise.all([
		OBR.viewport.inverseTransformPoint({ x: 0, y: 0 }),
		Promise.all([OBR.viewport.getWidth(), OBR.viewport.getHeight()]).then(([width, height]) => OBR.viewport.inverseTransformPoint({ x: width, y: height })),
		OBR.scene.grid.getDpi(),
	]);
	const viewportWidth = Math.abs(bottomRight.x - topLeft.x);
	const viewportHeight = Math.abs(bottomRight.y - topLeft.y);
	if (!(viewportWidth > 0 && viewportHeight > 0 && gridDpi > 0)) throw new Error("Не удалось определить размер viewport Owlbear.");
	const viewportOrigin = {
		x: Math.min(topLeft.x, bottomRight.x),
		y: Math.min(topLeft.y, bottomRight.y),
	};
	const center = { x: (topLeft.x + bottomRight.x) / 2, y: (topLeft.y + bottomRight.y) / 2 };
	const imageAspect = preview.imageWidth / preview.imageHeight;
	const maxWidth = viewportWidth * 0.9;
	const maxHeight = viewportHeight * 0.9;
	const targetWidth = Math.min(maxWidth, maxHeight * imageAspect);
	const imageDpi = Math.max(preview.imageWidth, preview.imageHeight);
	const baseWidth = preview.imageWidth * gridDpi / imageDpi;
	const scale = targetWidth / baseWidth;
	const metadata = {
		[OWLBEAR_PREVIEW_ID_KEY]: preview.previewId,
	};
	const backdrop = buildShape()
		.name("DnD DM Tools preview backdrop")
		.shapeType("RECTANGLE")
		.width(viewportWidth)
		.height(viewportHeight)
		.position(viewportOrigin)
		.layer("POPOVER")
		.zIndex(PREVIEW_Z_INDEX)
		.disableAutoZIndex(true)
		.locked(true)
		.disableHit(true)
		.metadata({ ...metadata, [OWLBEAR_PREVIEW_KIND_KEY]: "backdrop" })
		.style({ fillColor: "#000000", fillOpacity: 0.84, strokeColor: "#000000", strokeOpacity: 0, strokeWidth: 0, strokeDash: [] })
		.build();
	const image = buildImage(
		{ width: preview.imageWidth, height: preview.imageHeight, mime: preview.imageMime, url: preview.imageUrl },
		{ dpi: imageDpi, offset: { x: preview.imageWidth / 2, y: preview.imageHeight / 2 } },
	)
		.name(preview.name)
		.position(center)
		.scale({ x: scale, y: scale })
		.layer("POPOVER")
		.zIndex(PREVIEW_Z_INDEX + 1)
		.disableAutoZIndex(true)
		.locked(true)
		.disableHit(true)
		.metadata({ ...metadata, [OWLBEAR_PREVIEW_KIND_KEY]: "image" })
		.build();
	await OBR.scene.items.addItems([backdrop, image]);
	await deleteManagedPreviews(preview.previewId);
}

export async function clearPreviewFromScene(): Promise<void> {
	if (!(await OBR.scene.isReady())) return;
	await deleteManagedPreviews();
}

async function deleteManagedPreviews(exceptPreviewId?: string): Promise<void> {
	const items = await OBR.scene.items.getItems((item: any) => {
		const previewId = item.metadata?.[OWLBEAR_PREVIEW_ID_KEY];
		return typeof previewId === "string"
			&& (item.metadata?.[OWLBEAR_PREVIEW_KIND_KEY] === "backdrop" || item.metadata?.[OWLBEAR_PREVIEW_KIND_KEY] === "image")
			&& previewId !== exceptPreviewId;
	});
	if (items.length > 0) await OBR.scene.items.deleteItems(items.map((item: any) => item.id));
}
