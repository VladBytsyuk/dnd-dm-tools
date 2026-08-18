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
copyFileSync(join(__dirname, "public", "icon-v2.svg"), join(__dirname, "dist", "icon-v2.svg"));
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
	bloodied: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></svg>',
	concentration: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/></svg>',
	condition: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="#f8fafc" d="M50 12 62 34l25 4-18 18 4 25-23-11-23 11 4-25L13 38l25-4L50 12Z"/></svg>',
	dead: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#f8fafc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12.5 17-.5-1-.5 1h1z"/><path d="M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="12" r="1"/></svg>',
	down: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><text x="12" y="17" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="16" font-weight="700" text-anchor="middle">0</text></svg>',
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
		["/icon-v2.svg", "icon-v2.svg"],
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
