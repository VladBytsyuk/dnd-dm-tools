import type { FullCharacterSheet } from "src/domain/models/character";
import { EmptyFullCharacterSheet } from "src/domain/models/character/FullCharacterSheet";

export const LSS_CHARACTER_IFRAME_SANDBOX =
	"allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-modals allow-top-navigation-by-user-activation";
export const LSS_CHARACTER_IFRAME_ALLOW = "clipboard-write";

export function createLssCharacterSheetUrl(id: string): string {
	return `/character-sheets/${id}`;
}

export function createLssCharacterListIframeUrl(): string {
	return "https://longstoryshort.app/iframe/characters/list/";
}

export function createLssCharacterIframeUrl(idOrUrl: string): string | null {
	const id = extractLssCharacterId(idOrUrl);
	if (!id) return null;
	return `https://longstoryshort.app/iframe/characters/digital/${id}/`;
}

export function extractLssCharacterId(value: string): string | null {
	const match = value.match(/[0-9a-fA-F]{24}/);
	return match?.[0] ?? null;
}

export function createMinimalLssCharacterSheet(idOrUrl: string): FullCharacterSheet | null {
	const id = extractLssCharacterId(idOrUrl);
	if (!id) return null;

	const empty = EmptyFullCharacterSheet();
	const name = `Персонаж ${id.slice(0, 6)}`;

	return {
		...empty,
		name: { rus: name, eng: name },
		url: createLssCharacterSheetUrl(id),
		data: {
			...empty.data,
			name: { value: name },
		},
	};
}
