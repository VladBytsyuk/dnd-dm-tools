<script lang="ts">
	import blackLogo from "./assets/owlbear_logo_black.svg";
	import whiteLogo from "./assets/owlbear_logo_white.svg";

	let { theme = "dark", size = 20 }: { theme?: "dark" | "light"; size?: number } = $props();

	function imageSource(asset: string) {
		return asset.trimStart().startsWith("<svg") ? `data:image/svg+xml,${encodeURIComponent(asset)}` : asset;
	}

	const blackSource = imageSource(blackLogo);
	const whiteSource = imageSource(whiteLogo);
</script>

<img class="owlbear-logo" src={theme === "light" ? blackSource : whiteSource} alt="" aria-hidden="true" width={size} height={size} style:width={`${size}px`} style:height={`${size}px`} />

<style>
	.owlbear-logo { display: block; flex: 0 0 auto; object-fit: contain; }
</style>
