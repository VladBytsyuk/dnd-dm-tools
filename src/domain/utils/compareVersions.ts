const VERSION_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

function parseVersion(version: string): { numbers: number[]; prerelease: string[] } {
	const match = VERSION_PATTERN.exec(version);
	if (!match) throw new Error(`Некорректная версия: ${version}`);
	return { numbers: [Number(match[1]), Number(match[2]), Number(match[3])], prerelease: match[4]?.split(".") ?? [] };
}

export function compareVersions(leftVersion: string, rightVersion: string): number {
	const left = parseVersion(leftVersion);
	const right = parseVersion(rightVersion);
	for (let index = 0; index < 3; index += 1) {
		if (left.numbers[index] !== right.numbers[index]) return left.numbers[index] > right.numbers[index] ? 1 : -1;
	}
	if (!left.prerelease.length || !right.prerelease.length) {
		return left.prerelease.length ? -1 : right.prerelease.length ? 1 : 0;
	}
	for (let index = 0; index < Math.max(left.prerelease.length, right.prerelease.length); index += 1) {
		const leftPart = left.prerelease[index];
		const rightPart = right.prerelease[index];
		if (leftPart === undefined) return -1;
		if (rightPart === undefined) return 1;
		if (leftPart === rightPart) continue;
		const leftNumeric = /^\d+$/.test(leftPart);
		const rightNumeric = /^\d+$/.test(rightPart);
		if (leftNumeric && rightNumeric) return Number(leftPart) > Number(rightPart) ? 1 : -1;
		if (leftNumeric) return -1;
		if (rightNumeric) return 1;
		return leftPart > rightPart ? 1 : -1;
	}
	return 0;
}
