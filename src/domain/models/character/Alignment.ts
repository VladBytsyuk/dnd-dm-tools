/**
 * Represents a D&D alignment option with Russian labels.
 */
export interface AlignmentOption {
	/** Internal value identifier (e.g., "lawful-good") */
	value: string;
	/** Display label in Russian (e.g., "Законно-добрый") */
	label: string;
	/** Short label in Russian (e.g., "ЗД") */
	shortLabel: string;
}

/**
 * All 9 D&D 5e alignments with Russian translations.
 */
export const ALIGNMENTS: AlignmentOption[] = [
	{ value: 'lawful-good', label: 'Законно-добрый', shortLabel: 'ЗД' },
	{ value: 'neutral-good', label: 'Нейтрально-добрый', shortLabel: 'НД' },
	{ value: 'chaotic-good', label: 'Хаотично-добрый', shortLabel: 'ХД' },
	{ value: 'lawful-neutral', label: 'Законно-нейтральный', shortLabel: 'ЗН' },
	{ value: 'true-neutral', label: 'Истинно нейтральный', shortLabel: 'ИН' },
	{ value: 'chaotic-neutral', label: 'Хаотично-нейтральный', shortLabel: 'ХН' },
	{ value: 'lawful-evil', label: 'Законно-злой', shortLabel: 'ЗЗ' },
	{ value: 'neutral-evil', label: 'Нейтрально-злой', shortLabel: 'НЗ' },
	{ value: 'chaotic-evil', label: 'Хаотично-злой', shortLabel: 'ХЗ' },
];

/**
 * Helper function to get alignment label by value.
 */
export function getAlignmentLabel(value: string): string {
	const alignment = ALIGNMENTS.find(a => a.value === value);
	return alignment?.label || value;
}

/**
 * Helper function to get short alignment label by value.
 */
export function getAlignmentShortLabel(value: string): string {
	const alignment = ALIGNMENTS.find(a => a.value === value);
	return alignment?.shortLabel || value;
}
