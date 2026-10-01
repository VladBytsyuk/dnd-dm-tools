<script lang="ts">
	import { Icon } from "lucide-svelte";
	import type { SVGAttributes, SvelteHTMLElements } from "svelte/elements";

	type IconNode = [keyof SvelteHTMLElements, SVGAttributes<SVGSVGElement>][];
	let props: Record<string, unknown> = $props();

	const iconNode: IconNode = [
		["path", { d: "M9 5h3v14" }],
		["path", { d: "M7 19h10" }]
	];
</script>

<Icon name="one" {...props} {iconNode} />
