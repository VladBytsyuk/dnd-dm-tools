import type { StorybookConfig } from "@storybook/svelte-vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

const config: StorybookConfig = {
	stories: ["../{stories/**/*.mdx,src/lib/**/*.stories.@(js|ts)}"],
	addons: ["@storybook/addon-docs"],
	framework: {
		name: "@storybook/svelte-vite",
		options: {},
	},
	viteFinal: async (viteConfig) => ({
		...viteConfig,
		plugins: [...(viteConfig.plugins ?? []), svelte()],
	}),
};

export default config;
