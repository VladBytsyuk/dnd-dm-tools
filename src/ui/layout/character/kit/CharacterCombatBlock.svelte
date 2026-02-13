<script lang="ts">
	import { Notice, parseYaml } from "obsidian";
	import { Plus, X, Info, Clipboard, Edit3, Check, Trash2 } from "lucide-svelte";
	import IconButton from "../../uikit/IconButton.svelte";
	import { rollRawTrace } from "../../../../domain/dice";
	import type { WeaponItem } from "../../../../domain/models/character/CharacterEquipment";
	import type { IUiEventListener } from "../../../../domain/listeners/ui_event_listener";

	interface Props {
		weaponsList: WeaponItem[];
		onChange: (newWeaponsList: WeaponItem[]) => void;
		uiEventListener?: IUiEventListener;
	}

	let { weaponsList, onChange, uiEventListener }: Props = $props();

	// Track which weapon is in edit mode
	let editingWeaponId = $state<string | null>(null);

	// Notes popup state
	let showNotesPopup = $state<{ id: string; x: number; y: number } | null>(null);
	let currentNotes = $state('');

	// Damage types for autocomplete
	const DAMAGE_TYPES = [
		'дробящий',
		'колющий',
		'рубящий',
		'кислотный',
		'холод',
		'огонь',
		'силовое поле',
		'молния',
		'некротический',
		'яд',
		'психический',
		'излучение',
		'звук'
	];

	function handleAddAttack() {
		const newWeapon: WeaponItem = {
			id: `weapon-${Date.now()}`,
			name: { value: 'Новая атака' },
			mod: { value: '+0' },
			dmg: { value: '1d6' },
			dmgType: { value: '' },
			isProf: false,
			modBonus: { value: 0 },
			notes: { value: '' },
			notesVisibility: false
		};
		onChange([...weaponsList, newWeapon]);
	}

	function handleRemoveAttack(id: string) {
		onChange(weaponsList.filter(w => w.id !== id));
	}

	function toggleEditMode(id: string) {
		editingWeaponId = editingWeaponId === id ? null : id;
	}

	function handleModifierRoll(weapon: WeaponItem, e: MouseEvent) {
		// Don't roll if in edit mode or clicking on input
		if (editingWeaponId === weapon.id) return;

		e.stopPropagation();
		try {
			const formula = `к20${weapon.mod.value}`;
			const result = rollRawTrace(formula);
			new Notice(`${weapon.name.value} (атака): ${result.total}\n\n${result.resolvedFormula}`);
		} catch (e) {
			new Notice(`Ошибка при броске: ${e}`);
		}
	}

	function handleDamageRoll(weapon: WeaponItem, e: MouseEvent) {
		// Don't roll if in edit mode
		if (editingWeaponId === weapon.id) return;

		e.stopPropagation();
		try {
			const result = rollRawTrace(weapon.dmg.value);
			const damageType = weapon.dmgType?.value ? ` (${weapon.dmgType.value})` : '';
			new Notice(`${weapon.name.value} (урон)${damageType}: ${result.total}\n\n${result.resolvedFormula}`);
		} catch (e) {
			new Notice(`Ошибка при броске урона: ${e}`);
		}
	}

	function handleNotesClick(id: string, e: MouseEvent) {
		e.stopPropagation();
		const weapon = weaponsList.find(w => w.id === id);
		const target = e.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();

		currentNotes = weapon?.notes?.value || '';
		showNotesPopup = {
			id,
			x: rect.left,
			y: rect.bottom + 4
		};
	}

	function handleSaveNotes() {
		if (showNotesPopup) {
			const updatedList = weaponsList.map(w =>
				w.id === showNotesPopup!.id
					? {
						...w,
						notes: { value: currentNotes },
						notesVisibility: currentNotes.trim().length > 0
					}
					: w
			);
			onChange(updatedList);
		}
		showNotesPopup = null;
	}

	function handleCloseNotes(e?: MouseEvent) {
		if (e) e.stopPropagation();
		showNotesPopup = null;
	}

	function updateWeaponField(id: string, field: keyof WeaponItem, value: any) {
		const updatedList = weaponsList.map(w =>
			w.id === id ? { ...w, [field]: value } : w
		);
		onChange(updatedList);
	}

	async function handlePasteAttack() {
		try {
			const clipboard = await navigator.clipboard.readText();

			// Try weapon format
			if (clipboard.startsWith('```weapon')) {
				const yaml = clipboard
					.split('\n')
					.filter((line) => !line.includes('```'))
					.join('\n');
				const weapon = parseYaml(yaml) as any;

				if (weapon && weapon.name) {
					const newWeapon: WeaponItem = {
						id: `weapon-${Date.now()}`,
						name: { value: weapon.name.rus || weapon.name || 'Оружие' },
						mod: { value: '+0' },
						dmg: { value: weapon.damage?.formula || '1d6' },
						dmgType: { value: weapon.damage?.type?.rus || '' },
						isProf: false,
						modBonus: { value: 0 },
						notes: { value: weapon.description?.rus || '' },
						notesVisibility: !!(weapon.description?.rus)
					};
					onChange([...weaponsList, newWeapon]);
					new Notice(`${newWeapon.name.value} добавлено`);
					return;
				}
			}

			// Try spell format
			if (clipboard.startsWith('```spell')) {
				const yaml = clipboard
					.split('\n')
					.filter((line) => !line.includes('```') && !line.startsWith('spell:'))
					.join('\n');
				const spell = parseYaml(yaml) as any;

				if (spell && spell.name) {
					const newWeapon: WeaponItem = {
						id: `spell-${Date.now()}`,
						name: { value: spell.name.rus || spell.name || 'Заклинание' },
						mod: { value: '+0' },
						dmg: { value: spell.damage || '0' },
						dmgType: { value: '' },
						isProf: false,
						modBonus: { value: 0 },
						notes: { value: spell.description?.rus || '' },
						notesVisibility: !!(spell.description?.rus)
					};
					onChange([...weaponsList, newWeapon]);
					new Notice(`${newWeapon.name.value} добавлено`);
					return;
				}
			}

			new Notice('Не удалось распознать оружие или заклинание');
		} catch (e) {
			new Notice(`Ошибка при вставке: ${e}`);
		}
	}

	// Close popup when clicking outside
	function handleClickOutside(e: MouseEvent) {
		if (showNotesPopup) {
			const target = e.target as HTMLElement;
			if (!target.closest('.notes-popup')) {
				handleCloseNotes();
			}
		}
	}
</script>

<svelte:window onclick={handleClickOutside} />

<div class="combat-block">
	<div class="combat-header">
		<h3>Атаки</h3>
		<div class="header-actions">
			<IconButton icon={Plus} hint="Добавить атаку" onClick={handleAddAttack} size={16} />
			<IconButton icon={Clipboard} hint="Вставить из буфера" onClick={handlePasteAttack} size={16} />
		</div>
	</div>

	{#if weaponsList.length === 0}
		<div class="empty-state">
			<p>Нет атак. Нажмите + чтобы добавить.</p>
		</div>
	{:else}
		<div class="attacks-table">
			{#each weaponsList as weapon (weapon.id)}
				{@const isEditing = editingWeaponId === weapon.id}
				<div class="attack-row">
					<div class="attack-name-col">
						<input
							type="text"
							class="editable-field"
							value={weapon.name.value}
							oninput={(e) => updateWeaponField(weapon.id, 'name', { value: (e.target as HTMLInputElement).value })}
							placeholder="Название атаки"
						/>
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div class="notes-icon-wrapper" onclick={(e: MouseEvent) => handleNotesClick(weapon.id, e)}>
							<IconButton
								icon={Info}
								hint={weapon.notes?.value?.trim() || "Заметки"}
								onClick={() => {}}
								size={10}
							/>
						</div>
					</div>

					<!-- Attack modifier column -->
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="attack-mod-col dice-field"
						class:clickable={!isEditing}
						onclick={(e) => handleModifierRoll(weapon, e)}
					>
						{#if isEditing}
							<input
								type="text"
								class="editable-field editing centered-field"
								value={weapon.mod.value}
								oninput={(e) => updateWeaponField(weapon.id, 'mod', { value: (e.target as HTMLInputElement).value })}
								placeholder="+0"
							/>
						{:else}
							<span class="dice-value">{weapon.mod.value}</span>
						{/if}
					</div>

					<!-- Damage column (dice + type) -->
					<div class="attack-dmg-col">
						<!-- Damage dice -->
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							class="dice-field"
							class:clickable={!isEditing}
							onclick={(e) => handleDamageRoll(weapon, e)}
						>
							{#if isEditing}
								<input
									type="text"
									class="editable-field editing centered-field"
									value={weapon.dmg.value}
									oninput={(e) => updateWeaponField(weapon.id, 'dmg', { value: (e.target as HTMLInputElement).value })}
									placeholder="1d6"
								/>
							{:else}
								<span class="dice-value">{weapon.dmg.value}</span>
							{/if}
						</div>
						<!-- Damage type -->
						<input
							type="text"
							class="editable-field dmg-type-field"
							value={weapon.dmgType?.value || ''}
							oninput={(e) => updateWeaponField(weapon.id, 'dmgType', { value: (e.target as HTMLInputElement).value })}
							placeholder="тип урона"
							list="damage-types-list"
						/>
					</div>

					<!-- Combined button column -->
					<div class="attack-buttons-col">
						<IconButton icon={Trash2} hint="Удалить" onClick={() => handleRemoveAttack(weapon.id)} size={12} />
						<IconButton
							icon={isEditing ? Check : Edit3}
							hint={isEditing ? "Сохранить" : "Редактировать"}
							onClick={() => toggleEditMode(weapon.id)}
							size={12}
						/>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Damage types datalist for autocomplete -->
<datalist id="damage-types-list">
	{#each DAMAGE_TYPES as damageType}
		<option value={damageType}></option>
	{/each}
</datalist>

<!-- Notes popup -->
{#if showNotesPopup}
	<div
		class="notes-popup"
		style="left: {showNotesPopup.x}px; top: {showNotesPopup.y}px;"
	>
		<div class="notes-popup-header">
			<h4>Заметки</h4>
			<IconButton icon={X} hint="Закрыть" onClick={handleCloseNotes} size={12} />
		</div>
		<textarea
			class="notes-textarea"
			bind:value={currentNotes}
			placeholder="Введите заметки..."
		></textarea>
		<div class="notes-popup-footer">
			<button class="save-button" onclick={handleSaveNotes}>Сохранить</button>
			<button class="cancel-button" onclick={handleCloseNotes}>Отмена</button>
		</div>
	</div>
{/if}

<style>
	.combat-block {
		padding: 16px;
		background-color: var(--background-primary);
		border: 1px solid var(--background-modifier-border);
		border-radius: 6px;
		margin-bottom: 16px;
		container-type: inline-size;
	}

	.combat-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
		padding-bottom: 8px;
		border-bottom: 1px solid var(--background-modifier-border);
	}

	.combat-header h3 {
		margin: 0;
		font-size: 14px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: var(--text-normal);
	}

	.header-actions {
		display: flex;
		gap: 8px;
	}

	.empty-state {
		padding: 24px;
		text-align: center;
		color: var(--text-muted);
		font-style: italic;
		background-color: var(--background-secondary);
		border-radius: 4px;
	}

	.empty-state p {
		margin: 0;
		font-size: 13px;
	}

	.attacks-table {
		display: grid;
		grid-template-columns: 1fr;
		gap: 4px;
	}

	.attack-row {
		display: grid;
		grid-template-columns: 1fr 60px 80px 24px;
		gap: 6px;
		padding: 6px;
		background-color: var(--background-secondary);
		border-radius: 4px;
		transition: background-color 0.2s;
		align-items: center;
	}

	.attack-row:hover {
		background-color: var(--background-modifier-hover);
	}

	.attack-name-col {
		display: flex;
		align-items: center;
		gap: 4px;
		min-width: 0;
	}

	.attack-name-col input {
		flex: 1;
		min-width: 0;
	}

	.notes-icon-wrapper {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		cursor: pointer;
	}

	.attack-mod-col {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.attack-buttons-col {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		min-height: 100%;
	}

	.attack-dmg-col {
		display: flex;
		flex-direction: column;
		gap: 2px;
		align-items: stretch;
	}

	.dice-field {
		position: relative;
		border-radius: 3px;
		transition: background-color 0.2s;
		padding: 2px 4px;
		min-height: 20px;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.dice-field.clickable {
		cursor: pointer;
	}

	.dice-field.clickable:hover {
		background-color: var(--background-modifier-hover);
	}

	.dice-value {
		font-size: 12px;
		font-weight: 600;
		color: var(--text-accent);
	}

	.editable-field {
		width: 100%;
		padding: 2px 4px;
		border: 1px solid transparent;
		border-radius: 2px;
		background: transparent;
		transition: all 0.2s;
		font-size: 12px;
		color: var(--text-normal);
		font-family: inherit;
	}

	.editable-field.editing {
		background: var(--background-primary);
		border-color: var(--interactive-accent);
	}

	.editable-field:hover:not(.editing) {
		background: var(--background-primary);
		border-color: var(--background-modifier-border);
	}

	.editable-field:focus {
		outline: none;
		background: var(--background-primary);
		border-color: var(--interactive-accent);
	}

	.editable-field::placeholder {
		color: var(--text-faint);
		opacity: 0.5;
	}

	.centered-field {
		text-align: center;
	}

	.dmg-type-field {
		font-size: 10px;
		text-align: center;
		font-style: italic;
		color: var(--text-muted);
		height: 12px;
	}

	/* Hide datalist dropdown arrow (including focused state) */
	.dmg-type-field::-webkit-calendar-picker-indicator {
		display: none !important;
		opacity: 0 !important;
		pointer-events: none !important;
	}

	.dmg-type-field:focus::-webkit-calendar-picker-indicator {
		display: none !important;
		opacity: 0 !important;
	}

	.dmg-type-field::-webkit-list-button {
		display: none !important;
		opacity: 0 !important;
	}

	.dmg-type-field:focus::-webkit-list-button {
		display: none !important;
		opacity: 0 !important;
	}

	/* Style datalist options - smaller and thinner font */
	#damage-types-list {
		font-size: 9px;
		font-weight: 300;
		font-style: italic;
	}

	#damage-types-list option {
		font-size: 9px;
		font-weight: 300;
		font-style: italic;
	}

	/* Notes popup */
	.notes-popup {
		position: fixed;
		z-index: 1000;
		background-color: var(--background-primary);
		border: 1px solid var(--background-modifier-border);
		border-radius: 6px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		min-width: 300px;
		max-width: 400px;
	}

	.notes-popup-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 12px;
		border-bottom: 1px solid var(--background-modifier-border);
		background-color: var(--background-secondary);
		border-radius: 6px 6px 0 0;
	}

	.notes-popup-header h4 {
		margin: 0;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--text-normal);
	}

	.notes-textarea {
		width: 100%;
		min-height: 100px;
		max-height: 200px;
		padding: 8px;
		border: none;
		background-color: var(--background-primary);
		color: var(--text-normal);
		font-family: inherit;
		font-size: 12px;
		resize: vertical;
	}

	.notes-textarea:focus {
		outline: none;
	}

	.notes-popup-footer {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		padding: 8px 12px;
		border-top: 1px solid var(--background-modifier-border);
		background-color: var(--background-secondary);
		border-radius: 0 0 6px 6px;
	}

	.save-button,
	.cancel-button {
		padding: 4px 12px;
		border: none;
		border-radius: 4px;
		font-size: 11px;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.save-button {
		background-color: var(--interactive-accent);
		color: var(--text-on-accent);
	}

	.save-button:hover {
		background-color: var(--interactive-accent-hover);
	}

	.cancel-button {
		background-color: var(--background-modifier-border);
		color: var(--text-normal);
	}

	.cancel-button:hover {
		background-color: var(--background-modifier-hover);
	}

	/* Container query breakpoints */

	/* Ultra-compact: < 300px */
	@container (max-width: 300px) {
		.notes-icon-wrapper {
			display: none;
		}

		.attack-row {
			grid-template-columns: 1fr 50px 70px 20px;
			gap: 4px;
			padding: 4px;
		}

		.editable-field {
			font-size: 11px;
			padding: 1px 3px;
		}

		.dice-value {
			font-size: 11px;
		}

		.dmg-type-field {
			font-size: 9px;
		}

		.combat-header h3 {
			font-size: 12px;
		}
	}

	/* Compact: 300-450px */
	@container (min-width: 300px) and (max-width: 450px) {
		.attack-row {
			grid-template-columns: 1fr 55px 75px 22px;
			gap: 5px;
			padding: 5px;
		}

		.editable-field {
			font-size: 12px;
		}

		.dmg-type-field {
			font-size: 9px;
		}
	}

	/* Comfortable: 450-600px */
	@container (min-width: 450px) and (max-width: 600px) {
		.attack-row {
			grid-template-columns: 1.5fr 65px 85px 24px;
			gap: 6px;
			padding: 6px;
		}

		.editable-field {
			font-size: 13px;
			padding: 3px 5px;
		}

		.dice-value {
			font-size: 13px;
		}

		.dmg-type-field {
			font-size: 10px;
		}
	}

	/* Wide: > 600px */
	@container (min-width: 600px) {
		.attack-row {
			grid-template-columns: 2fr 70px 90px 28px;
			gap: 8px;
			padding: 8px;
		}

		.editable-field {
			font-size: 13px;
			padding: 3px 6px;
		}

		.dice-value {
			font-size: 13px;
		}

		.dmg-type-field {
			font-size: 10px;
		}

		.combat-header h3 {
			font-size: 15px;
		}
	}

	/* Extra wide: > 800px - 2 column grid */
	@container (min-width: 800px) {
		.attacks-table {
			grid-template-columns: 1fr 1fr;
			gap: 8px;
		}
	}
</style>
