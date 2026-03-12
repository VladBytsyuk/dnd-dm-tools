import type { EquipmentItem } from "../../../../domain/models/character/CharacterEquipment";

export type EquipmentLinkType = NonNullable<EquipmentItem["linkedType"]>;

export interface EquipmentAutocompleteItem {
	name: { rus: string; eng: string };
	url: string;
	linkedType: EquipmentLinkType;
}

export function isSupportedEquipmentLinkType(linkedType: EquipmentItem["linkedType"]): linkedType is EquipmentLinkType {
	return linkedType === "armor" || linkedType === "item" || linkedType === "artifact";
}

export function hasLinkedEquipment(item: Pick<EquipmentItem, "linkedUrl" | "linkedType">): boolean {
	return Boolean(item.linkedUrl && isSupportedEquipmentLinkType(item.linkedType));
}

export function sanitizeNotesPreviewText(content: string): string {
	const normalizedContent = content
		.replace(/<br\s*\/?>/gi, "\n")
		.replace(/<\/(p|div|li|h[1-6])>/gi, "\n");

	const parsed = new DOMParser().parseFromString(normalizedContent, "text/html");
	return ((parsed.body.textContent ?? "")
		.replace(/\n{2,}/g, "\n")
		.trim());
}
