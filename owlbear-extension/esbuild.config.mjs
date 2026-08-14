import esbuild from "esbuild";
import { createServer } from "node:http";
import { mkdirSync, copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const watch = process.argv.includes("--watch");

mkdirSync(join(__dirname, "dist"), { recursive: true });
copyFileSync(join(__dirname, "public", "index.html"), join(__dirname, "dist", "index.html"));
copyFileSync(join(__dirname, "public", "background.html"), join(__dirname, "dist", "background.html"));
copyFileSync(join(__dirname, "public", "manifest.json"), join(__dirname, "dist", "manifest.json"));
copyFileSync(join(__dirname, "public", "icon.svg"), join(__dirname, "dist", "icon.svg"));
const conditionIcons = {
	unconscious: "Unconscious",
	frightened: "Frightened",
	exhaustion: "Exhaustion",
	invisible: "Invisible",
	incapacitated: "Incapacitated",
	deafened: "Deafened",
	petrified: "Petrified",
	restrained: "Restrained",
	blinded: "Blinded",
	poisoned: "Poisoned",
	charmed: "Charmed",
	stunned: "Stunned",
	paralyzed: "Paralyzed",
	prone: "Prone",
	grappled: "Grappled",
};

function copyStatusIcons() {
	const targetDirectory = join(__dirname, "dist", "status-icons");
	mkdirSync(targetDirectory, { recursive: true });
	for (const [targetName, sourceName] of Object.entries(conditionIcons)) {
		const source = readFileSync(join(__dirname, "..", "src", "ui", "components", "icons", `${sourceName}.svelte`), "utf8");
		const svg = source.match(/<svg[\s\S]*?<\/svg>/)?.[0];
		if (!svg) throw new Error(`Unable to extract Owlbear condition icon ${sourceName}.`);
		writeFileSync(join(targetDirectory, `${targetName}.svg`), normalizeStatusSvg(svg, true));
	}
	for (const [name, svg] of Object.entries(statusIcons)) {
		writeFileSync(join(targetDirectory, `${name}.svg`), normalizeStatusSvg(svg, false));
	}
}

function normalizeStatusSvg(svg, addWhiteFill) {
	return svg.replace("<svg", `<svg width="100" height="100"${addWhiteFill ? ' fill="#ffffff"' : ""}`);
}

const statusIcons = {
	bloodied: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="#ef4444" d="M50 8C42 23 22 43 22 62a28 28 0 0 0 56 0C78 43 58 23 50 8Zm0 72a18 18 0 0 1-18-18c0-9 8-22 18-36 10 14 18 27 18 36a18 18 0 0 1-18 18Z"/></svg>',
	down: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path stroke="#f8fafc" stroke-width="14" stroke-linecap="round" d="m28 28 44 44m0-44L28 72"/></svg>',
	dead: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="#f8fafc" d="M24 46c0-19 12-32 26-32s26 13 26 32v22c0 10-8 18-18 18H42c-10 0-18-8-18-18V46Zm15-4a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm22 0a6 6 0 1 0 0 12 6 6 0 0 0 0-12ZM40 66h20l-10 10-10-10Z"/></svg>',
	concentration: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="#c4b5fd" d="M30 35c-8-15 13-28 24-14 11-14 32-1 24 14 15 7 6 29-8 25 2 16-18 25-20 12-2 13-22 4-20-12-14 4-23-18-8-25 11-14 32-1 24 14 11-14 32-1 24 14 15 7 6 29-8 25"/></svg>',
	condition: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="#f8fafc" d="M50 12 62 34l25 4-18 18 4 25-23-11-23 11 4-25L13 38l25-4L50 12Z"/></svg>',
};

copyStatusIcons();

const options = {
	entryPoints: {
		main: join(__dirname, "src", "main.ts"),
		background: join(__dirname, "src", "background.ts"),
	},
	bundle: true,
	format: "esm",
	target: "es2020",
	sourcemap: true,
	outdir: join(__dirname, "dist"),
	logLevel: "info",
};

if (watch) {
	const context = await esbuild.context(options);
	await context.watch();
	const distDirectory = join(__dirname, "dist");
	const devAssets = new Map([
		["/manifest.json", "manifest.json"],
		["/index.html", "index.html"],
		["/main.js", "main.js"],
		["/background.html", "background.html"],
		["/background.js", "background.js"],
		["/icon.svg", "icon.svg"],
		...Object.keys(conditionIcons).concat(Object.keys(statusIcons)).map((name) => [`/status-icons/${name}.svg`, `status-icons/${name}.svg`]),
	]);
	const server = createServer(async (request, response) => {
		const requestPath = request.url?.split("?")[0] ?? "/";
		const relativePath = devAssets.get(requestPath === "/" ? "/index.html" : requestPath);

		response.setHeader("Access-Control-Allow-Origin", "https://www.owlbear.rodeo");
		response.setHeader("Vary", "Origin");

		if (!relativePath) {
			response.writeHead(404);
			response.end("Not found");
			return;
		}

		try {
			const file = await readFile(join(distDirectory, relativePath));
			const contentType = relativePath.endsWith(".json")
				? "application/json"
				: relativePath.endsWith(".js")
					? "text/javascript; charset=utf-8"
					: relativePath.endsWith(".svg")
					? "image/svg+xml"
					: "text/html; charset=utf-8";
			response.writeHead(200, { "Content-Type": contentType });
			response.end(file);
		} catch {
			response.writeHead(404);
			response.end("Not found");
		}
	});
	server.listen(5173, "127.0.0.1");
	console.log("Owlbear extension available at http://localhost:5173/manifest.json");
} else {
	await esbuild.build(options);
}
