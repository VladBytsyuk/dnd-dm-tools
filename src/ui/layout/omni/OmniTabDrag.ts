export function getTabInsertionPosition(
	pointerX: number,
	tabMidpoints: readonly number[],
): number {
	const position = tabMidpoints.findIndex((midpoint) => pointerX < midpoint);
	return position === -1 ? tabMidpoints.length : position;
}

export function normalizeTabInsertionPosition(
	rawPosition: number,
	sourcePosition: number,
	isSameTile: boolean,
	targetTabCount: number,
): number {
	const position =
		isSameTile && rawPosition > sourcePosition
			? rawPosition - 1
			: rawPosition;
	const maximum = Math.max(0, targetTabCount - (isSameTile ? 1 : 0));
	return Math.max(0, Math.min(position, maximum));
}
