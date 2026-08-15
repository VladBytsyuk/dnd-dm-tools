import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
	CLOUDFLARED_VERSION,
	selectCloudflaredArtifact,
	verifyCloudflaredInstallation,
} from "src/data/owlbear/CloudflaredInstaller";

const temporaryDirectories: string[] = [];

afterEach(async () => {
	await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("cloudflared installer", () => {
	it.each([
		["win32", "x64", "cloudflared-windows-amd64.exe"],
		["darwin", "x64", "cloudflared-darwin-amd64.tgz"],
		["darwin", "arm64", "cloudflared-darwin-arm64.tgz"],
		["linux", "x64", "cloudflared-linux-amd64"],
		["linux", "arm64", "cloudflared-linux-arm64"],
	] as const)("selects the official %s/%s artifact", (platform, arch, filename) => {
		const artifact = selectCloudflaredArtifact(platform, arch);

		expect(artifact).toMatchObject({ platform, arch, filename });
		expect(artifact?.url).toBe(`https://github.com/cloudflare/cloudflared/releases/download/${CLOUDFLARED_VERSION}/${filename}`);
		expect(artifact?.sha256).toMatch(/^[a-f0-9]{64}$/);
	});

	it("marks unsupported architectures as unavailable", () => {
		expect(selectCloudflaredArtifact("linux", "ia32")).toBeUndefined();
		expect(selectCloudflaredArtifact("android", "arm64")).toBeUndefined();
	});

	it("accepts an installed binary only while its manifest and SHA-256 match", async () => {
		const directory = await mkdtemp(join(tmpdir(), "cloudflared-verification-"));
		temporaryDirectories.push(directory);
		const binaryPath = join(directory, "cloudflared");
		const manifestPath = join(directory, "install.json");
		const bytes = Buffer.from("verified cloudflared binary");
		const binarySha256 = createHash("sha256").update(bytes).digest("hex");
		const artifact = selectCloudflaredArtifact("linux", "x64")!;
		await writeFile(binaryPath, bytes);
		await writeFile(manifestPath, JSON.stringify({
			version: CLOUDFLARED_VERSION,
			platform: "linux",
			arch: "x64",
			artifactSha256: artifact.sha256,
			binarySha256,
		}));

		expect(await verifyCloudflaredInstallation(binaryPath, manifestPath, artifact, "linux", "x64")).toBe(true);
		await writeFile(binaryPath, "corrupted");
		expect(await verifyCloudflaredInstallation(binaryPath, manifestPath, artifact, "linux", "x64")).toBe(false);
	});
});
