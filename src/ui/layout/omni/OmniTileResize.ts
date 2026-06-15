export const MIN_TILE_RATIO = 0.15;
export const MAX_TILE_RATIO = 0.85;

export function clampTileRatio(ratio: number): number {
	return Math.min(MAX_TILE_RATIO, Math.max(MIN_TILE_RATIO, ratio));
}

export function getTileRatioFromPointer(
	clientY: number,
	containerTop: number,
	containerHeight: number,
): number {
	if (containerHeight <= 0) return 0.5;
	return clampTileRatio((clientY - containerTop) / containerHeight);
}
