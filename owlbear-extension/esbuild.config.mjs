import esbuild from "esbuild";
import { createServer } from "node:http";
import { mkdirSync, copyFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const watch = process.argv.includes("--watch");

mkdirSync(join(__dirname, "dist"), { recursive: true });
copyFileSync(join(__dirname, "public", "index.html"), join(__dirname, "dist", "index.html"));
copyFileSync(join(__dirname, "public", "manifest.json"), join(__dirname, "dist", "manifest.json"));
copyFileSync(join(__dirname, "public", "icon.svg"), join(__dirname, "dist", "icon.svg"));

const options = {
	entryPoints: [join(__dirname, "src", "main.ts")],
	bundle: true,
	format: "esm",
	target: "es2020",
	sourcemap: true,
	outfile: join(__dirname, "dist", "main.js"),
	logLevel: "info",
};

if (watch) {
	const context = await esbuild.context(options);
	await context.watch();
	const distDirectory = join(__dirname, "dist");
	const server = createServer(async (request, response) => {
		const requestPath = request.url?.split("?")[0] ?? "/";
		const relativePath = requestPath === "/" ? "/index.html" : requestPath;
		const filePath = join(distDirectory, relativePath);

		response.setHeader("Access-Control-Allow-Origin", "https://www.owlbear.rodeo");
		response.setHeader("Vary", "Origin");

		try {
			const file = await readFile(filePath);
			const contentType = filePath.endsWith(".json")
				? "application/json"
				: filePath.endsWith(".js")
					? "text/javascript; charset=utf-8"
				: filePath.endsWith(".svg")
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
