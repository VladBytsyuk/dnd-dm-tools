<script lang="ts">
	import { Notice, parseYaml } from "obsidian";
	import { Plus, X, Info, Clipboard, Edit3, Check, Trash2 } from "lucide-svelte";
	import IconButton from "../../uikit/IconButton.svelte";
	import { rollRawTrace } from "../../../../domain/dice";
	import type { WeaponItem } from "../../../../domain/models/character/CharacterEquipment";
	import type { IUiEventListener } from "../../../../domain/listeners/ui_event_listener";
	import type { CharacterStats } from "../../../../domain/models/character/CharacterStats";

	interface Props {
		weaponsList: WeaponItem[];
		stats: CharacterStats;
		proficiency: number;
		onChange: (newWeaponsList: WeaponItem[]) => void;
		uiEventListener?: IUiEventListener;
	}

	let { weaponsList, stats, proficiency, onChange, uiEventListener }: Props = $props();

	// Track which weapon is in edit mode
	let editingWeaponId = $state<string | null>(null);

	// Notes popup state
	let showNotesPopup = $state<{ id: string; x: number; y: number } | null>(null);
	let currentNotes = $state('');

	// Track which weapon's info icon is being hovered
	let hoveredInfoIconId = $state<string | null>(null);

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

	// Ability options for attack modifier calculation
	const ABILITIES = [
		{ value: '', label: 'Нет', shortLabel: '—' },
		{ value: 'str', label: 'Сила', shortLabel: 'СИЛ' },
		{ value: 'dex', label: 'Ловкость', shortLabel: 'ЛОВ' },
		{ value: 'con', label: 'Телосложение', shortLabel: 'ТЕЛ' },
		{ value: 'int', label: 'Интеллект', shortLabel: 'ИНТ' },
		{ value: 'wis', label: 'Мудрость', shortLabel: 'МДР' },
		{ value: 'cha', label: 'Харизма', shortLabel: 'ХАР' }
	];

	// Calculate attack modifier from ability, proficiency, and custom bonus
	// All three fields are independent and additive
	function calculateAttackModifier(weapon: WeaponItem): string {
		// Get ability modifier (0 if none selected)
		let abilityModifier = 0;
		if (weapon.abilityMod) {
			const abilityKey = weapon.abilityMod as keyof typeof stats;
			abilityModifier = stats[abilityKey]?.modifier ?? 0;
		}

		// Add proficiency bonus if proficient
		const profBonus = weapon.isProf ? proficiency : 0;

		// Add custom bonus
		const customBonus = weapon.modBonus?.value ?? 0;

		// Calculate total (all three fields are independent)
		const total = abilityModifier + profBonus + customBonus;

		// Format with + or - sign
		return total >= 0 ? `+${total}` : `${total}`;
	}

	// Toggle proficiency for a weapon
	function toggleProficiency(id: string) {
		const weapon = weaponsList.find(w => w.id === id);
		if (!weapon) return;

		const updated = weaponsList.map(w =>
			w.id === id
				? { ...w, isProf: !w.isProf, mod: { value: calculateAttackModifier({ ...w, isProf: !w.isProf }) } }
				: w
		);
		onChange(updated);
	}

	// Update ability for a weapon
	function updateAbility(id: string, ability: string) {
		const weapon = weaponsList.find(w => w.id === id);
		if (!weapon) return;

		const newAbility = ability || undefined;
		const updated = weaponsList.map(w =>
			w.id === id
				? { ...w, abilityMod: newAbility, mod: { value: calculateAttackModifier({ ...w, abilityMod: newAbility }) } }
				: w
		);
		onChange(updated);
	}

	// Update custom bonus for a weapon
	function updateCustomBonus(id: string, bonus: number) {
		const weapon = weaponsList.find(w => w.id === id);
		if (!weapon) return;

		const newBonus = { value: bonus };
		const updated = weaponsList.map(w =>
			w.id === id
				? { ...w, modBonus: newBonus, mod: { value: calculateAttackModifier({ ...w, modBonus: newBonus }) } }
				: w
		);
		onChange(updated);
	}

	function handleAddAttack() {
		const newWeapon: WeaponItem = {
			id: `weapon-${Date.now()}`,
			name: { value: 'Новая атака' },
			mod: { value: '+0' },
			dmg: { value: '1d6' },
			dmgType: { value: '' },
			additionalDamage: [],  // Initialize empty array
			isProf: false,
			modBonus: { value: 0 },
			abilityMod: undefined,  // Start in manual mode
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
			// Collect all damage sources with their types
			const damageSources: Array<{ formula: string; type: string }> = [
				{ formula: weapon.dmg.value, type: weapon.dmgType?.value || 'урон' }
			];

			if (weapon.additionalDamage && weapon.additionalDamage.length > 0) {
				weapon.additionalDamage.forEach(d => {
					if (d.dice.value.trim()) {
						damageSources.push({
							formula: d.dice.value,
							type: d.type.value || 'урон'
						});
					}
				});
			}

			// Roll each damage source individually to get separate totals
			const rolledSources = damageSources.map(source => {
				const result = rollRawTrace(source.formula);
				return {
					type: source.type,
					total: result.total,
					formula: source.formula
				};
			});

			// Calculate overall total
			const overallTotal = rolledSources.reduce((sum, source) => sum + source.total, 0);

			// Combine formulas for full breakdown
			const combinedFormula = damageSources.map(s => s.formula).join('+');
			const combinedResult = rollRawTrace(combinedFormula);

			// Build damage breakdown for notice
			let damageBreakdown = `${weapon.name.value} (урон): ${overallTotal}\n\n`;

			// Show individual totals per damage type
			rolledSources.forEach(source => {
				damageBreakdown += `${source.type}: ${source.total}\n`;
			});

			// Add full breakdown
			damageBreakdown += `\nБросок: ${combinedResult.resolvedFormula}`;

			new Notice(damageBreakdown);
		} catch (e) {
			new Notice(`Ошибка при броске урона: ${e}`);
		}
	}

	// Add new additional damage source to weapon
	function handleAddDamageSource(weaponId: string) {
		const updated = weaponsList.map(w => {
			if (w.id !== weaponId) return w;

			const newSource: import('../../../../domain/models/character/CharacterEquipment').AdditionalDamageSource = {
				id: `dmg-${Date.now()}`,
				dice: { value: '1d6' },
				type: { value: '' }
			};

			const currentAdditional = w.additionalDamage || [];
			return {
				...w,
				additionalDamage: [...currentAdditional, newSource]
			};
		});

		onChange(updated);
	}

	// Remove additional damage source from weapon
	function handleRemoveDamageSource(weaponId: string, damageId: string) {
		const updated = weaponsList.map(w => {
			if (w.id !== weaponId) return w;

			return {
				...w,
				additionalDamage: (w.additionalDamage || []).filter(d => d.id !== damageId)
			};
		});

		onChange(updated);
	}

	// Update additional damage source field
	function updateAdditionalDamageField(
		weaponId: string,
		damageId: string,
		field: 'dice' | 'type',
		value: string
	) {
		const updated = weaponsList.map(w => {
			if (w.id !== weaponId) return w;

			return {
				...w,
				additionalDamage: (w.additionalDamage || []).map(d =>
					d.id === damageId
						? { ...d, [field]: { value } }
						: d
				)
			};
		});

		onChange(updated);
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

	// Determine if weapon is ranged based on type name
	function isRangedWeapon(weapon: any): boolean {
		// Check weapon type
		if (weapon.type?.name) {
			const typeName = weapon.type.name as string;
			// Ranged weapon types
			if (typeName.includes('дальнобойное')) return true;
			// Melee weapon types
			if (typeName.includes('рукопашное')) return false;
		}

		// Fallback: check properties for ammunition (indicates ranged)
		if (weapon.properties && Array.isArray(weapon.properties)) {
			return weapon.properties.some((prop: any) =>
				prop.name === 'Боеприпас' || prop.name === 'Ammunition'
			);
		}

		// Default to melee if unclear
		return false;
	}

	// Normalize dice formula to Russian "к" notation
	function normalizeDiceFormula(formula: string): string {
		if (!formula) return '';
		// Replace English "d" with Russian "к"
		// Also handle uppercase D
		return formula.replace(/d/g, 'к').replace(/D/g, 'к');
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
					// Normalize damage formula (d → к)
					const normalizedDamage = normalizeDiceFormula(weapon.damage?.dice || '1к6');

					// Determine weapon type and set appropriate ability
					const isRanged = isRangedWeapon(weapon);
					const defaultAbility = isRanged ? 'dex' : 'str';

					// Create weapon with proper defaults
					const newWeapon: WeaponItem = {
						id: `weapon-${Date.now()}`,
						name: { value: weapon.name.rus || weapon.name || 'Оружие' },
						mod: { value: '+0' },  // Will be recalculated below
						dmg: { value: normalizedDamage },
						dmgType: { value: weapon.damage?.type || '' },
						additionalDamage: [],  // Initialize empty array
						isProf: false,
						modBonus: { value: 0 },
						abilityMod: defaultAbility,  // Set based on weapon type
						notes: { value: weapon.description || '' },
						notesVisibility: !!(weapon.description)
					};

					// Recalculate attack modifier with the selected ability
					newWeapon.mod = { value: calculateAttackModifier(newWeapon) };

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
					// Normalize damage formula (d → к) for spells too
					const normalizedDamage = normalizeDiceFormula(spell.damage || '0');

					const newWeapon: WeaponItem = {
						id: `spell-${Date.now()}`,
						name: { value: spell.name.rus || spell.name || 'Заклинание' },
						mod: { value: '+0' },
						dmg: { value: normalizedDamage },
						dmgType: { value: '' },
						additionalDamage: [],  // Initialize empty array
						isProf: false,
						modBonus: { value: 0 },
						abilityMod: undefined,  // Spells require manual ability selection
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
				{@const hasNotes = !!(weapon.notes?.value?.trim())}
				{@const isHovered = hoveredInfoIconId === weapon.id}
				{@const shouldShow = hasNotes || isHovered}
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
						<div
							class="notes-icon-wrapper"
							class:visible={shouldShow}
							onclick={(e: MouseEvent) => handleNotesClick(weapon.id, e)}
							onmouseenter={() => hoveredInfoIconId = weapon.id}
							onmouseleave={() => hoveredInfoIconId = null}
						>
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
						onclick={(e) => !isEditing && handleModifierRoll(weapon, e)}
					>
						{#if isEditing}
							<div class="mod-edit-container">
								<!-- Display calculated modifier (read-only when ability is selected) -->
								<div class="mod-display">{weapon.mod.value}</div>

								<!-- Calculation fields -->
								<div class="calc-fields">
									<!-- Ability selector -->
									<div class="calc-field-group">
										<label class="calc-label" for="ability-{weapon.id}">Хар-ка</label>
										<select
											id="ability-{weapon.id}"
											class="ability-select"
											value={weapon.abilityMod || ''}
											onchange={(e) => updateAbility(weapon.id, (e.target as HTMLSelectElement).value)}
										>
											{#each ABILITIES as ability}
												<option value={ability.value}>{ability.shortLabel}</option>
											{/each}
										</select>
									</div>

									<!-- Proficiency toggle -->
									<div class="calc-field-group">
										<label class="calc-label" for="prof-{weapon.id}">Влд</label>
										<!-- svelte-ignore a11y_click_events_have_key_events -->
										<!-- svelte-ignore a11y_no_static_element_interactions -->
										<div
											id="prof-{weapon.id}"
											class="prof-toggle"
											class:active={weapon.isProf}
											onclick={() => toggleProficiency(weapon.id)}
											title="Владение"
											role="checkbox"
											aria-checked={weapon.isProf}
											tabindex="0"
										>
											{#if weapon.isProf}
												<div class="prof-dot"></div>
											{/if}
										</div>
									</div>

									<!-- Custom bonus input -->
									<div class="calc-field-group">
										<label class="calc-label" for="bonus-{weapon.id}">Бонус</label>
										<input
											id="bonus-{weapon.id}"
											type="number"
											class="bonus-input"
											value={weapon.modBonus?.value ?? 0}
											oninput={(e) => updateCustomBonus(weapon.id, parseInt((e.target as HTMLInputElement).value) || 0)}
											placeholder="0"
										/>
									</div>
								</div>
							</div>
						{:else}
							<span class="dice-value">{weapon.mod.value}</span>
						{/if}
					</div>

					<!-- Damage column (dice + type) -->
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="attack-dmg-col" onclick={(e) => !isEditing && handleDamageRoll(weapon, e)}>
						{#if isEditing}
							<!-- EDIT MODE: Show all damage sources separately -->
							<!-- PRIMARY DAMAGE (always present) -->
							<div class="damage-row primary-damage">
								<!-- Damage dice -->
								<div class="dice-field">
									<input
										type="text"
										class="editable-field editing centered-field"
										value={weapon.dmg.value}
										oninput={(e) => updateWeaponField(weapon.id, 'dmg', { value: (e.target as HTMLInputElement).value })}
										placeholder="1d6"
									/>
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

							<!-- ADDITIONAL DAMAGE SOURCES (edit mode) -->
							{#if weapon.additionalDamage && weapon.additionalDamage.length > 0}
							{#each weapon.additionalDamage as damageSource (damageSource.id)}
								<div class="damage-row additional-damage">
									<div class="additional-damage-header">
										<span class="damage-separator">+</span>
										<!-- Remove button -->
										<IconButton
											icon={X}
											hint="Удалить урон"
											onClick={() => handleRemoveDamageSource(weapon.id, damageSource.id)}
											size={10}
										/>
									</div>

									<div class="additional-damage-fields">
										<!-- Additional dice -->
										<input
											type="text"
											class="editable-field editing centered-field dmg-dice-field"
											value={damageSource.dice.value}
											oninput={(e) => updateAdditionalDamageField(weapon.id, damageSource.id, 'dice', (e.target as HTMLInputElement).value)}
											placeholder="1d4"
										/>

										<!-- Additional type -->
										<input
											type="text"
											class="editable-field dmg-type-field"
											value={damageSource.type.value}
											oninput={(e) => updateAdditionalDamageField(weapon.id, damageSource.id, 'type', (e.target as HTMLInputElement).value)}
											placeholder="тип урона"
											list="damage-types-list"
										/>
									</div>
								</div>
							{/each}
							{/if}

							<!-- ADD DAMAGE BUTTON (edit mode) -->
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div class="add-damage-btn" onclick={() => handleAddDamageSource(weapon.id)}>
								<Plus size={12} />
								<span>Добавить урон</span>
							</div>
						{:else}
							<!-- NON-EDIT MODE: Show all damage combined -->
							{@const allDamageFormulas = [
								weapon.dmg.value,
								...(weapon.additionalDamage || []).filter(d => d.dice.value.trim()).map(d => d.dice.value)
							]}
							{@const combinedDamage = allDamageFormulas.join(' + ')}
							{@const allTypes = [
								weapon.dmgType?.value || '',
								...(weapon.additionalDamage || []).filter(d => d.type.value.trim()).map(d => d.type.value)
							].filter(t => t)}
							{@const typeDisplay = allTypes.length > 0 ? allTypes.join(', ') : ''}

							<div class="damage-row primary-damage">
								<!-- Combined damage dice -->
								<div class="dice-field clickable">
									<span class="dice-value">{combinedDamage}</span>
								</div>
								<!-- Combined damage types -->
								{#if typeDisplay}
									<div class="dmg-type-display">{typeDisplay}</div>
								{/if}
							</div>
						{/if}
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
		gap: 2px;
	}

	.attack-row {
		display: grid;
		grid-template-columns: 1fr 110px 80px 24px;
		gap: 4px;
		padding: 4px;
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
		overflow: hidden;
	}

	.attack-name-col input {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.notes-icon-wrapper {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		cursor: pointer;
		/* Increased hitbox */
		padding: 4px 6px;
		margin: -4px -6px;
		/* Visibility control */
		opacity: 0;
		transition: opacity 0.15s ease-in-out;
	}

	.notes-icon-wrapper.visible {
		opacity: 1;
	}

	.attack-mod-col {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 0;
		overflow: hidden;
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
		cursor: pointer;
		min-width: 0;
		overflow: hidden;
	}

	.attack-dmg-col:not(:has(.editing)):hover .dice-field {
		background-color: var(--background-modifier-hover);
	}

	/* Individual damage row (primary or additional) */
	.damage-row {
		display: flex;
		align-items: center;
		gap: 1px;
	}

	/* Primary damage - full vertical layout like before */
	.primary-damage {
		flex-direction: column;
		gap: 1px;
	}

	/* Additional damage - vertical layout like primary */
	.additional-damage {
		flex-direction: column;
		gap: 1px;
		padding: 2px;
		background-color: var(--background-modifier-hover);
		border-radius: 2px;
		align-items: stretch;
	}

	/* Header with + separator and remove button */
	.additional-damage-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1px;
	}

	/* Plus separator between damage sources */
	.damage-separator {
		font-size: 10px;
		font-weight: 600;
		color: var(--text-muted);
		padding: 0 2px;
	}

	/* Container for dice and type fields */
	.additional-damage-fields {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	/* Damage dice field in additional damage */
	.dmg-dice-field {
		width: 100%;
		font-size: 10px;
		text-align: center;
	}

	/* Add damage button */
	.add-damage-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 3px;
		padding: 2px 4px;
		font-size: 9px;
		background-color: var(--background-secondary);
		border: 1px solid var(--background-modifier-border);
		border-radius: 2px;
		cursor: pointer;
		color: var(--text-muted);
		transition: all 0.2s;
		margin-top: 2px;
	}

	.add-damage-btn:hover {
		background-color: var(--background-modifier-hover);
		border-color: var(--text-normal);
		color: var(--text-normal);
	}

	.add-damage-btn:active {
		transform: scale(0.95);
	}

	.dice-field {
		position: relative;
		border-radius: 3px;
		transition: background-color 0.2s;
		padding: 1px 4px;
		min-height: 18px;
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: hidden;
		max-width: 100%;
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
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 100%;
	}

	.editable-field {
		width: 100%;
		padding: 1px 4px;
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
		max-width: 100%;
		overflow: hidden;
	}

	.dmg-type-field {
		font-size: 10px;
		text-align: center;
		font-style: italic;
		color: var(--text-muted);
		height: 12px;
	}

	/* Damage type display in non-edit mode */
	.dmg-type-display {
		font-size: 10px;
		text-align: center;
		font-style: italic;
		color: var(--text-muted);
		padding: 2px 4px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
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

	/* Container for modifier editing with calculation fields */
	.mod-edit-container {
		display: flex;
		flex-direction: column;
		gap: 2px;
		width: 100%;
		align-items: center;
	}

	/* Display of calculated modifier (top of edit mode) */
	.mod-display {
		font-size: 14px;
		font-weight: 700;
		color: var(--text-accent);
		text-align: center;
		padding: 0px 4px;
	}

	/* Container for calculation fields */
	.calc-fields {
		display: flex;
		gap: 3px;
		justify-content: center;
		align-items: flex-start;
		width: 100%;
	}

	/* Individual field group (label + input) */
	.calc-field-group {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1px;
	}

	/* Field labels */
	.calc-label {
		font-size: 7px;
		color: var(--text-faint);
		text-transform: uppercase;
		font-weight: 500;
		letter-spacing: 0.3px;
		white-space: nowrap;
	}

	/* Ability selector dropdown */
	.ability-select {
		font-size: 9px;
		padding: 1px 2px;
		border: 1px solid var(--background-modifier-border);
		border-radius: 2px;
		background-color: var(--background-primary);
		color: var(--text-normal);
		width: 36px;
		height: 16px;
		cursor: pointer;
	}

	.ability-select:hover {
		border-color: var(--text-normal);
	}

	.ability-select:focus {
		outline: none;
		border-color: var(--interactive-accent);
	}

	/* Proficiency toggle (circle with dot) */
	.prof-toggle {
		width: 14px;
		height: 14px;
		border: 1.5px solid var(--text-muted);
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
		flex-shrink: 0;
	}

	.prof-toggle:hover {
		border-color: var(--text-normal);
		transform: scale(1.05);
	}

	.prof-toggle.active {
		border-color: var(--text-accent);
	}

	.prof-dot {
		width: 6px;
		height: 6px;
		background-color: var(--text-accent);
		border-radius: 50%;
	}

	/* Custom bonus number input */
	.bonus-input {
		width: 28px;
		height: 16px;
		font-size: 9px;
		padding: 1px 2px;
		text-align: center;
		border: 1px solid var(--background-modifier-border);
		border-radius: 2px;
		background-color: var(--background-primary);
		color: var(--text-normal);
	}

	.bonus-input:hover {
		border-color: var(--text-normal);
	}

	.bonus-input:focus {
		outline: none;
		border-color: var(--interactive-accent);
	}

	/* Remove number input spinners */
	.bonus-input::-webkit-inner-spin-button,
	.bonus-input::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.bonus-input[type=number] {
		-moz-appearance: textfield;
	}

	/* Container query breakpoints */

	/* Very narrow: < 250px */
	@container (max-width: 250px) {
		.notes-icon-wrapper {
			display: none;
		}

		.attack-row {
			grid-template-columns: 1fr 58px 48px 18px;
			gap: 2px;
			padding: 2px;
		}

		.attack-name-col {
			gap: 2px;
		}

		.editable-field {
			font-size: 10px;
			padding: 1px 2px;
		}

		.dice-value {
			font-size: 10px;
			max-width: 48px;
		}

		.dice-field {
			padding: 0px 2px;
			min-height: 16px;
		}

		.dmg-type-field {
			font-size: 7px;
		}

		.dmg-type-display {
			font-size: 7px;
		}

		.dmg-dice-field {
			font-size: 8px;
		}

		.mod-display {
			font-size: 10px;
		}

		.calc-fields {
			gap: 1px;
		}

		.ability-select {
			width: 22px;
			font-size: 7px;
			height: 12px;
			padding: 0px 1px;
		}

		.bonus-input {
			width: 18px;
			font-size: 7px;
			height: 12px;
		}

		.prof-toggle {
			width: 10px;
			height: 10px;
		}

		.prof-dot {
			width: 4px;
			height: 4px;
		}

		.mod-edit-container {
			gap: 1px;
		}

		.attack-buttons-col {
			gap: 1px;
		}
	}

	/* Ultra-compact: 250-300px */
	@container (min-width: 250px) and (max-width: 300px) {
		.notes-icon-wrapper {
			display: none;
		}

		.attack-row {
			grid-template-columns: 1fr 80px 65px 20px;
			gap: 3px;
			padding: 3px;
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

		.dmg-type-display {
			font-size: 9px;
		}

		.dmg-dice-field {
			font-size: 9px;
		}

		.add-damage-btn {
			font-size: 8px;
			padding: 1px 3px;
		}

		.damage-separator {
			font-size: 9px;
		}

		.additional-damage {
			padding: 3px;
		}

		.combat-header h3 {
			font-size: 12px;
		}

		.calc-fields {
			gap: 2px;
		}

		.calc-label {
			font-size: 6px;
		}

		.ability-select {
			width: 30px;
			font-size: 8px;
			height: 14px;
		}

		.bonus-input {
			width: 24px;
			font-size: 8px;
			height: 14px;
		}

		.prof-toggle {
			width: 12px;
			height: 12px;
			border-width: 1px;
		}

		.prof-dot {
			width: 5px;
			height: 5px;
		}

		.mod-display {
			font-size: 12px;
		}
	}

	/* Compact: 300-450px */
	@container (min-width: 300px) and (max-width: 450px) {
		.attack-row {
			grid-template-columns: 1fr 100px 75px 22px;
			gap: 5px;
			padding: 5px;
		}

		.editable-field {
			font-size: 12px;
		}

		.dmg-type-field {
			font-size: 9px;
		}

		.calc-label {
			font-size: 7px;
		}
	}

	/* Comfortable: 450-600px */
	@container (min-width: 450px) and (max-width: 600px) {
		.attack-row {
			grid-template-columns: 1.5fr 115px 85px 24px;
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

		.dmg-type-display {
			font-size: 10px;
		}

		.calc-fields {
			gap: 4px;
		}

		.ability-select {
			width: 40px;
			font-size: 10px;
		}

		.bonus-input {
			width: 32px;
			font-size: 10px;
		}

		.mod-display {
			font-size: 16px;
		}
	}

	/* Wide: > 600px */
	@container (min-width: 600px) {
		.attack-row {
			grid-template-columns: 2fr 120px 90px 28px;
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

		.dmg-type-display {
			font-size: 10px;
		}

		.dmg-dice-field {
			font-size: 11px;
		}

		.additional-damage {
			padding: 5px;
		}

		.combat-header h3 {
			font-size: 15px;
		}

		.calc-fields {
			gap: 5px;
		}

		.ability-select {
			width: 40px;
			font-size: 10px;
		}

		.bonus-input {
			width: 32px;
			font-size: 10px;
		}

		.mod-display {
			font-size: 16px;
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
