<script lang="ts">
	import type { CharacterProficiencies } from "../../../../domain/models/character/CharacterProficiencies";
	import { createEmptyCharacterProficiencies } from "../../../../domain/models/character/CharacterProficiencies";

	interface Props {
		proficiencies: CharacterProficiencies;
		onChange?: (proficiencies: CharacterProficiencies) => void;
	}

	let { proficiencies = createEmptyCharacterProficiencies(), onChange }: Props = $props();

	function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
		let timeoutId: ReturnType<typeof setTimeout> | null = null;
		return (...args: Parameters<T>) => {
			if (timeoutId) clearTimeout(timeoutId);
			timeoutId = setTimeout(() => fn(...args), delay);
		};
	}

	const debouncedChange = debounce((nextValue: CharacterProficiencies) => {
		onChange?.(nextValue);
	}, 300);

	function createSnapshot(): CharacterProficiencies {
		return {
			armor: {
				light: proficiencies.armor.light,
				medium: proficiencies.armor.medium,
				heavy: proficiencies.armor.heavy,
				shield: proficiencies.armor.shield,
			},
			weapons: { value: proficiencies.weapons.value },
			languages: { value: proficiencies.languages.value },
			tools: { value: proficiencies.tools.value },
			other: { value: proficiencies.other.value },
		};
	}

	function emitChange() {
		debouncedChange(createSnapshot());
	}

	function toggleArmor(type: keyof CharacterProficiencies["armor"]) {
		proficiencies.armor[type] = !proficiencies.armor[type];
		emitChange();
	}

	function updateTextField(field: "weapons" | "languages" | "tools" | "other", value: string) {
		proficiencies[field].value = value;
		emitChange();
	}

	const armorItems = [
		{ key: "light", label: "Легкие" },
		{ key: "medium", label: "Средние" },
		{ key: "heavy", label: "Тяжелые" },
		{ key: "shield", label: "Щиты" },
	] as const;
</script>

<div class="proficiencies-block">
	<h3 class="section-title">Владения</h3>

	<div class="armor-section">
		<div class="field-label">Доспехи</div>
		<div class="armor-toggles">
			{#each armorItems as item}
				<button
					type="button"
					class="armor-toggle"
					class:active={proficiencies.armor[item.key]}
					aria-pressed={proficiencies.armor[item.key]}
					onclick={() => toggleArmor(item.key)}
				>
					<span>{item.label}</span>
				</button>
			{/each}
		</div>
	</div>

	<div class="text-fields">
		<label class="text-field">
			<span class="field-label">Оружие</span>
			<textarea
				rows="2"
				value={proficiencies.weapons.value}
				oninput={(event) => updateTextField("weapons", (event.currentTarget as HTMLTextAreaElement).value)}
			></textarea>
		</label>

		<label class="text-field">
			<span class="field-label">Языки</span>
			<textarea
				rows="2"
				value={proficiencies.languages.value}
				oninput={(event) => updateTextField("languages", (event.currentTarget as HTMLTextAreaElement).value)}
			></textarea>
		</label>

		<label class="text-field">
			<span class="field-label">Инструменты</span>
			<textarea
				rows="2"
				value={proficiencies.tools.value}
				oninput={(event) => updateTextField("tools", (event.currentTarget as HTMLTextAreaElement).value)}
			></textarea>
		</label>

		<label class="text-field">
			<span class="field-label">Прочее</span>
			<textarea
				rows="3"
				value={proficiencies.other.value}
				oninput={(event) => updateTextField("other", (event.currentTarget as HTMLTextAreaElement).value)}
			></textarea>
		</label>
	</div>
</div>

<style>
	.proficiencies-block {
		padding: 12px;
		background-color: var(--background-primary);
		border: 1px solid var(--background-modifier-border);
		border-radius: 6px;
		margin-bottom: 16px;
	}

	.section-title {
		margin: 0 0 12px 0;
		font-size: 14px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: var(--text-normal);
		text-align: center;
		border-bottom: 1px solid var(--background-modifier-border);
		padding-bottom: 8px;
	}

	.armor-section,
	.text-fields {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.text-fields {
		margin-top: 12px;
	}

	.field-label {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.4px;
		color: var(--text-muted);
	}

	.armor-toggles {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 8px;
	}

	.armor-toggle {
		padding: 8px 10px;
		border: 1px solid var(--background-modifier-border);
		border-radius: 4px;
		background-color: var(--background-secondary);
		color: var(--text-normal);
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
	}

	.armor-toggle:hover {
		background-color: var(--background-modifier-hover);
	}

	.armor-toggle.active {
		background-color: var(--interactive-accent);
		border-color: var(--interactive-accent);
		color: var(--text-on-accent);
	}

	.text-field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	textarea {
		width: 100%;
		min-height: 52px;
		padding: 8px 10px;
		border: 1px solid var(--background-modifier-border);
		border-radius: 4px;
		background-color: var(--background-secondary);
		color: var(--text-normal);
		font-size: 13px;
		line-height: 1.4;
		resize: vertical;
		font-family: var(--font-text);
		box-sizing: border-box;
	}

	textarea:focus {
		outline: none;
		border-color: var(--interactive-accent);
		box-shadow: 0 0 0 1px var(--interactive-accent);
	}
</style>
