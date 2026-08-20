import fs from 'node:fs';

const SEMVER_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

export function parseSemver(version) {
	const match = SEMVER_PATTERN.exec(version);
	if (!match) {
		throw new Error(`Invalid SemVer version: ${version}`);
	}

	return {
		major: Number(match[1]),
		minor: Number(match[2]),
		patch: Number(match[3]),
		prerelease: match[4]?.split('.') ?? [],
	};
}

function comparePrerelease(left, right) {
	if (left.length === 0) return right.length === 0 ? 0 : 1;
	if (right.length === 0) return -1;

	for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
		const leftIdentifier = left[index];
		const rightIdentifier = right[index];
		if (leftIdentifier === undefined) return -1;
		if (rightIdentifier === undefined) return 1;
		if (leftIdentifier === rightIdentifier) continue;

		const leftNumeric = /^\d+$/.test(leftIdentifier);
		const rightNumeric = /^\d+$/.test(rightIdentifier);
		if (leftNumeric && rightNumeric) {
			return Number(leftIdentifier) > Number(rightIdentifier) ? 1 : -1;
		}
		if (leftNumeric) return -1;
		if (rightNumeric) return 1;
		return leftIdentifier > rightIdentifier ? 1 : -1;
	}

	return 0;
}

export function compareSemver(leftVersion, rightVersion) {
	const left = parseSemver(leftVersion);
	const right = parseSemver(rightVersion);

	for (const key of ['major', 'minor', 'patch']) {
		if (left[key] !== right[key]) return left[key] > right[key] ? 1 : -1;
	}

	return comparePrerelease(left.prerelease, right.prerelease);
}

export function getReleaseNotes(changelog, version) {
	const escapedVersion = version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const pattern = new RegExp(`^- \\*\\*${escapedVersion}\\*\\* - (.+)$`, 'gm');
	const matches = [...changelog.matchAll(pattern)];
	if (matches.length !== 1) {
		throw new Error(`Expected exactly one CHANGELOG entry for ${version}, found ${matches.length}`);
	}

	return matches[0][1];
}

export function validateReleaseMetadata({ packageJson, packageLock, manifest, versions, changelog }) {
	const version = packageJson.version;
	parseSemver(version);

	if (packageLock.version !== version || packageLock.packages?.['']?.version !== version) {
		throw new Error('package-lock.json version does not match package.json');
	}
	if (manifest.version !== version) {
		throw new Error('manifest.json version does not match package.json');
	}
	if (!Object.hasOwn(versions, version)) {
		throw new Error(`versions.json does not contain ${version}`);
	}

	return {
		version,
		tag: `v${version}`,
		archiveName: `dnd-dm-tools-${version}.7z`,
		title: `DnD DM Tools v${version}`,
		isPrerelease: parseSemver(version).prerelease.length > 0,
		notes: getReleaseNotes(changelog, version),
	};
}

function readJson(filePath) {
	return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(value) {
	process.stdout.write(`${JSON.stringify(value)}\n`);
}

function run() {
	const [command, ...args] = process.argv.slice(2);
	if (command === 'detect' && args.length === 2) {
		const previousVersion = readJson(args[0]).version;
		const currentVersion = readJson(args[1]).version;
		const comparison = compareSemver(currentVersion, previousVersion);
		if (comparison < 0) {
			throw new Error(`Version must increase: ${previousVersion} -> ${currentVersion}`);
		}
		writeJson({ shouldRelease: comparison > 0, previousVersion, currentVersion });
		return;
	}

	if (command === 'validate' && args.length === 1) {
		const metadata = validateReleaseMetadata({
			packageJson: readJson('package.json'),
			packageLock: readJson('package-lock.json'),
			manifest: readJson('manifest.json'),
			versions: readJson('versions.json'),
			changelog: fs.readFileSync('CHANGELOG.md', 'utf8'),
		});
		fs.writeFileSync(args[0], `${metadata.notes}\n`, 'utf8');
		writeJson({ ...metadata, notes: undefined });
		return;
	}

	throw new Error('Usage: release-metadata.mjs detect <previous-package.json> <current-package.json> | validate <notes-file>');
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
	run();
}
