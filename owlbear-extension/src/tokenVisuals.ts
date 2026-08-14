import type { OwlbearParticipantSnapshot } from "./types";

export type TokenVisualState = "normal" | "down" | "dead";

export type TokenVisualConfig = {
	state: TokenVisualState;
	darkeningOpacity: number;
	tokenOpacity: number;
};

export type TokenImage = {
	url: string;
	mime: string;
	width: number;
	height: number;
};

const MAX_VISUAL_SIZE = 512;
const TOKEN_VISUAL_VERSION = "3";
const NORMAL_VISUAL: TokenVisualConfig = { state: "normal", darkeningOpacity: 0, tokenOpacity: 1 };
const DOWN_VISUAL: TokenVisualConfig = { state: "down", darkeningOpacity: 0.5, tokenOpacity: 0.75 };
const DEAD_VISUAL: TokenVisualConfig = { state: "dead", darkeningOpacity: 0.8, tokenOpacity: 0.5 };

export function getTokenVisualConfig(participant: Pick<OwlbearParticipantSnapshot, "hpCurrent" | "isDead">): TokenVisualConfig {
	if (participant.isDead) return DEAD_VISUAL;
	if (participant.hpCurrent <= 0) return DOWN_VISUAL;
	return NORMAL_VISUAL;
}

export function resolveTokenVisualImage(participant: OwlbearParticipantSnapshot, image: TokenImage): TokenImage {
	const visual = getTokenVisualConfig(participant);
	if (visual.state === "normal") return image;

	const url = new URL(image.url);
	url.searchParams.set("visual", visual.state);
	url.searchParams.set("visualVersion", TOKEN_VISUAL_VERSION);
	const scale = Math.min(1, MAX_VISUAL_SIZE / Math.max(image.width, image.height));
	const width = Math.max(1, Math.round(image.width * scale));
	const height = Math.max(1, Math.round(image.height * scale));
	url.searchParams.set("width", String(width));
	url.searchParams.set("height", String(height));
	return {
		url: url.toString(),
		mime: "image/svg+xml",
		width,
		height,
	};
}
