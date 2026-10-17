// @vitest-environment node
import { build } from "esbuild";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { svelteFlowCompatibility } from "../../scripts/svelte-flow-compat.mjs";

afterEach(() => vi.unstubAllGlobals());

async function loadModule(file: string) {
	const result = await build({
		stdin: {
			contents: `export * from ${JSON.stringify(resolve("node_modules/@xyflow/svelte/dist/lib", file))}; export { flushSync } from "svelte";`,
			resolveDir: process.cwd(),
		},
		bundle: true, write: false, format: "iife", globalName: "flowModule", conditions: ["browser"],
		plugins: [svelteFlowCompatibility(), {
			name: "flow-test-store",
			setup(build) {
				build.onResolve({ filter: /^\.\.\/store\/index\.js$/ }, () => ({ path: "store", namespace: "flow-test" }));
				build.onLoad({ filter: /.*/, namespace: "flow-test" }, () => ({ contents: "export const useStore = () => globalThis.flowTestStore;", loader: "js" }));
			},
		}],
	});
	expect(result.warnings).toEqual([]);
	return new Function(`${result.outputFiles[0].text}; return flowModule;`)();
}

describe("Svelte Flow compatibility", () => {
	it("uses the current zoom handlers and preserves their arguments and return values", async () => {
		const store = { zoomIn: vi.fn(), zoomOut: vi.fn() };
		vi.stubGlobal("flowTestStore", store);
		const { useSvelteFlow } = await loadModule("hooks/useSvelteFlow.svelte.js");
		const flow = useSvelteFlow();
		store.zoomIn = vi.fn(async () => true);
		store.zoomOut = vi.fn(async () => false);
		const options = { duration: 150 };

		await expect(flow.zoomIn(options)).resolves.toBe(true);
		await expect(flow.zoomOut(options)).resolves.toBe(false);
		expect(store.zoomIn).toHaveBeenCalledWith(options);
		expect(store.zoomOut).toHaveBeenCalledWith(options);
	});

	it("keeps portals visible in the browser and reveals an initially hidden portal after its effect", async () => {
		const { hideOnSSR, flushSync } = await loadModule("actions/portal/utils.svelte.js");
		vi.stubGlobal("window", {});
		expect(hideOnSSR().value).toBe(false);
		vi.stubGlobal("window", undefined);
		const hidden = hideOnSSR();
		expect(hidden.value).toBe(true);
		flushSync();
		expect(hidden.value).toBe(false);
	});
});
