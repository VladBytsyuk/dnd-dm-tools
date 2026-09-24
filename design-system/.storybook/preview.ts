import type { Preview } from "@storybook/svelte-vite";

const preview: Preview = {
	tags: ["autodocs"],
	parameters: {
		backgrounds: {
			options: {
				light: { name: "Light", value: "#ffffff" },
				dark: { name: "Dark", value: "#1f1f1f" },
			},
		},
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
	},
};

export default preview;
