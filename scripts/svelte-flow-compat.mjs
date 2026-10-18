import { readFile } from "node:fs/promises";
import { dirname } from "node:path";
import { compileModule } from "svelte/compiler";

/** Fix initial rune reads in @xyflow/svelte 1.7 without changing installed files. */
export function svelteFlowCompatibility() {
	return {
		name: "svelte-flow-compatibility",
		setup(build) {
			build.onLoad({ filter: /[/\\]@xyflow[/\\]svelte[/\\]dist[/\\]lib[/\\](?:hooks[/\\]useSvelteFlow|actions[/\\]portal[/\\]utils)\.svelte\.js$/ }, async ({ path }) => {
				const source = await readFile(path, "utf8");
				const patched = source
					.replace("zoomIn: store.zoomIn,", "zoomIn: (options) => store.zoomIn(options),")
					.replace("zoomOut: store.zoomOut,", "zoomOut: (options) => store.zoomOut(options),")
					.replace("let hide = $state(typeof window === 'undefined');", "const initiallyHidden = typeof window === 'undefined';\n    let hide = $state(initiallyHidden);")
					.replace("if (hide) {", "if (initiallyHidden) {");
				const compiled = compileModule(patched, { filename: path, generate: "client" });
				return {
					contents: `${compiled.js.code}\n//# sourceMappingURL=${compiled.js.map.toUrl()}`,
					loader: "js",
					resolveDir: dirname(path),
					watchFiles: [path],
					warnings: compiled.warnings.map(({ code, message }) => ({ text: `${code}: ${message}` })),
				};
			});
		},
	};
}
