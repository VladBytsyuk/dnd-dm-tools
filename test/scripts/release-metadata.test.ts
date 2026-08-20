import { describe, expect, it } from 'vitest';
import { compareSemver, getReleaseNotes, parseSemver, validateReleaseMetadata } from '../../scripts/release-metadata.mjs';

describe('release metadata', () => {
	it('compares stable and prerelease SemVer versions', () => {
		expect(compareSemver('1.1.1', '1.1.0')).toBe(1);
		expect(compareSemver('1.0.0', '1.0.0-beta.1')).toBe(1);
		expect(compareSemver('1.0.0-beta.2', '1.0.0-beta.1')).toBe(1);
		expect(compareSemver('1.0.0-beta.1', '1.0.0-beta.1')).toBe(0);
		expect(compareSemver('1.0.0-beta.1', '1.0.0')).toBe(-1);
	});

	it('rejects invalid SemVer versions', () => {
		expect(() => parseSemver('1.0')).toThrow('Invalid SemVer');
		expect(() => parseSemver('01.0.0')).toThrow('Invalid SemVer');
		expect(() => parseSemver('1.0.0-01')).toThrow('Invalid SemVer');
	});

	it('extracts exactly one changelog entry', () => {
		const changelog = '- **1.1.1** - Release notes\n- **1.1.0** - Previous release\n';
		expect(getReleaseNotes(changelog, '1.1.1')).toBe('Release notes');
		expect(() => getReleaseNotes(changelog, '1.1.2')).toThrow('found 0');
		expect(() => getReleaseNotes(`${changelog}- **1.1.1** - Duplicate\n`, '1.1.1')).toThrow('found 2');
	});

	it('validates synchronized release versions and produces metadata', () => {
		const metadata = validateReleaseMetadata({
			packageJson: { version: '1.2.0-beta.1' },
			packageLock: { version: '1.2.0-beta.1', packages: { '': { version: '1.2.0-beta.1' } } },
			manifest: { version: '1.2.0-beta.1' },
			versions: { '1.2.0-beta.1': '0.15.0' },
			changelog: '- **1.2.0-beta.1** - Preview release\n',
		});

		expect(metadata).toMatchObject({
			tag: 'v1.2.0-beta.1',
			archiveName: 'dnd-dm-tools-1.2.0-beta.1.7z',
			isPrerelease: true,
			notes: 'Preview release',
		});
	});

	it('rejects mismatched manifest versions', () => {
		expect(() => validateReleaseMetadata({
			packageJson: { version: '1.2.0' },
			packageLock: { version: '1.2.0', packages: { '': { version: '1.2.0' } } },
			manifest: { version: '1.1.9' },
			versions: { '1.2.0': '0.15.0' },
			changelog: '- **1.2.0** - Release\n',
		})).toThrow('manifest.json version');
	});
});
