<script lang="ts">
	import { Notice, parseYaml } from "obsidian";
	import { Plus, X, Info, Clipboard, Edit3, Check, Trash2 } from "lucide-svelte";
	import IconButton from "../../uikit/IconButton.svelte";
	import { rollRawTrace } from "../../../../domain/dice";
	import type { WeaponItem, AdditionalDamageSource } from "../../../../domain/models/character/CharacterEquipment";
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

	// Debounce utility
	function debounce<T extends (...args: any[]) => any>(
		fn: T,
		delay: number
	): (...args: Parameters<T>) => void {
		let timeoutId: ReturnType<typeof setTimeout> | null = null;
		return (...args: Parameters<T>) => {
			if (timeoutId) clearTimeout(timeoutId);
			timeoutId = setTimeout(() => fn(...args), delay);
		};
	}

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

	// Constants
	const DEFAULT_DICE_RUSSIAN = '1к6';
	const DEFAULT_DAMAGE_SPELL = '0';
	const DEFAULT_MODIFIER = '+0';
	const WEAPON_ID_PREFIX = 'weapon-';
	const SPELL_ID_PREFIX = 'spell-';
	const DAMAGE_SOURCE_ID_PREFIX = 'dmg-';
	const DEBOUNCE_DELAY_MS = 300;
	const DICE_NOTATION_REGEX = /d/g;
	const DICE_NOTATION_REGEX_UPPER = /D/g;

	/**
	 * Calculate attack modifier from ability, proficiency, and custom bonus.
	 * All three fields are independent and additive.
	 * @param weapon - The weapon item to calculate modifier for
	 * @returns Formatted modifier string (e.g., "+5" or "-2")
	 */
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

	/**
	 * Toggle proficiency bonus for a weapon.
	 * Recalculates the attack modifier when toggled.
	 * @param id - The weapon ID
	 */
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

	/**
	 * Update the ability modifier used for attack calculation.
	 * Recalculates the attack modifier when changed.
	 * @param id - The weapon ID
	 * @param ability - The ability key ('str', 'dex', etc.) or empty string for none
	 */
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

	/**
	 * Update the custom bonus modifier for a weapon.
	 * Recalculates the attack modifier when changed.
	 * @param id - The weapon ID
	 * @param bonus - The numeric bonus to add (can be positive or negative)
	 */
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

	// Debounced version to prevent excessive updates
	const debouncedUpdateCustomBonus = debounce(updateCustomBonus, DEBOUNCE_DELAY_MS);

	/**
	 * Add a new attack to the weapons list.
	 * Creates a new weapon with default values.
	 */
	function handleAddAttack() {
		const newWeapon: WeaponItem = {
			id: `${WEAPON_ID_PREFIX}${Date.now()}`,
			name: { value: 'Новая атака' },
			mod: { value: DEFAULT_MODIFIER },
			dmg: { value: DEFAULT_DICE_RUSSIAN },
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

	/**
	 * Remove an attack from the weapons list.
	 * @param id - The weapon ID to remove
	 */
	function handleRemoveAttack(id: string) {
		onChange(weaponsList.filter(w => w.id !== id));
	}

	/**
	 * Toggle edit mode for a weapon.
	 * @param id - The weapon ID to toggle edit mode for
	 */
	function toggleEditMode(id: string) {
		editingWeaponId = editingWeaponId === id ? null : id;
	}

	/**
	 * Roll attack modifier (d20 + modifier).
	 * Displays the result in a Notice.
	 * @param weapon - The weapon to roll for
	 * @param e - Mouse event
	 */
	function handleModifierRoll(weapon: WeaponItem, e: MouseEvent) {
		// Don't roll if in edit mode or clicking on input
		if (editingWeaponId === weapon.id) return;

		e.stopPropagation();
		try {
			const formula = `к20${weapon.mod.value}`;
			const result = rollRawTrace(formula);
			new Notice(`${weapon.name.value} (атака): ${result.total}\n\n${result.resolvedFormula}`);
		} catch (e) {
			const errorMsg = e instanceof Error ? e.message : String(e);
			new Notice(`Ошибка при броске: ${errorMsg}`);
		}
	}

	/**
	 * Roll damage for a weapon including all damage sources.
	 * Validates dice formulas before rolling.
	 * Displays breakdown by damage type in a Notice.
	 * @param weapon - The weapon to roll damage for
	 * @param e - Mouse event
	 */
	function handleDamageRoll(weapon: WeaponItem, e: MouseEvent) {
		// Don't roll if in edit mode
		if (editingWeaponId === weapon.id) return;

		e.stopPropagation();
		try {
			// Collect all damage sources with their types
			const damageSources: Array<{ formula: string; type: string }> = [];

			// Validate and add primary damage
			if (weapon.dmg.value && isValidDiceFormula(weapon.dmg.value)) {
				damageSources.push({ formula: weapon.dmg.value, type: weapon.dmgType?.value || 'урон' });
			} else if (weapon.dmg.value) {
				new Notice(`Неверная формула урона: ${weapon.dmg.value}`);
				return;
			}

			// Validate and add additional damage sources
			if (weapon.additionalDamage && weapon.additionalDamage.length > 0) {
				for (const d of weapon.additionalDamage) {
					if (d.dice.value.trim()) {
						if (isValidDiceFormula(d.dice.value)) {
							damageSources.push({
								formula: d.dice.value,
								type: d.type.value || 'урон'
							});
						} else {
							new Notice(`Неверная формула дополнительного урона: ${d.dice.value}`);
							return;
						}
					}
				}
			}

			if (damageSources.length === 0) {
				new Notice('Нет формул урона для броска');
				return;
			}

			// Roll each damage source individually to get separate totals
			const rolledSources = damageSources.map(source => {
				const result = rollRawTrace(source.formula);
				return {
					type: source.type,
					total: result.total,
					formula: source.formula,
					resolvedFormula: result.resolvedFormula
				};
			});

			// Calculate overall total
			const overallTotal = rolledSources.reduce((sum, source) => sum + source.total, 0);

			// Combine resolved formulas from already-rolled results
			const combinedResolvedFormula = rolledSources
				.map(s => s.resolvedFormula)
				.join(' + ')
				.replace(/\+\s-\s?/g, '- ');

			// Build damage breakdown for notice
			let damageBreakdown = `${weapon.name.value} (урон): ${overallTotal}\n\n`;

			// Show individual totals per damage type
			rolledSources.forEach(source => {
				damageBreakdown += `${source.type}: ${source.total}\n`;
			});

			// Add full breakdown using already-rolled results
			damageBreakdown += `\nБросок: ${combinedResolvedFormula}`;

			new Notice(damageBreakdown);
		} catch (e) {
			const errorMsg = e instanceof Error ? e.message : String(e);
			new Notice(`Ошибка при броске урона: ${errorMsg}`);
		}
	}

	/**
	 * Add a new additional damage source to a weapon.
	 * Creates a new damage source with default values.
	 * @param weaponId - The weapon ID to add damage source to
	 */
	function handleAddDamageSource(weaponId: string) {
		const updated = weaponsList.map(w => {
			if (w.id !== weaponId) return w;

			const newSource: AdditionalDamageSource = {
				id: `${DAMAGE_SOURCE_ID_PREFIX}${Date.now()}`,
				dice: { value: DEFAULT_DICE_RUSSIAN },
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

	/**
	 * Remove an additional damage source from a weapon.
	 * @param weaponId - The weapon ID
	 * @param damageId - The damage source ID to remove
	 */
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

	/**
	 * Update a field in an additional damage source.
	 * @param weaponId - The weapon ID
	 * @param damageId - The damage source ID
	 * @param field - The field to update ('dice' or 'type')
	 * @param value - The new value
	 */
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

	/**
	 * Open the notes popup for editing weapon notes.
	 * @param id - The weapon ID
	 * @param e - Mouse event for positioning the popup
	 */
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

	/**
	 * Save the notes from the popup and close it.
	 * Updates the weapon's notes and visibility flag.
	 */
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

	/**
	 * Close the notes popup without saving.
	 * @param e - Optional mouse event
	 */
	function handleCloseNotes(e?: MouseEvent) {
		if (e) e.stopPropagation();
		showNotesPopup = null;
	}

	/**
	 * Update a specific field in a weapon item.
	 * Generic type ensures type safety for field values.
	 * @param id - The weapon ID
	 * @param field - The field name to update
	 * @param value - The new value for the field
	 */
	function updateWeaponField<K extends keyof WeaponItem>(
		id: string,
		field: K,
		value: WeaponItem[K]
	) {
		const updatedList = weaponsList.map(w =>
			w.id === id ? { ...w, [field]: value } : w
		);
		onChange(updatedList);
	}

	/**
	 * Determine if a weapon is ranged based on its type name or properties.
	 * Used to auto-select appropriate ability modifier (STR for melee, DEX for ranged).
	 * @param weapon - Weapon data with type and properties
	 * @returns True if ranged weapon, false if melee
	 */
	function isRangedWeapon(weapon: {
		type?: { name?: string };
		properties?: Array<{ name: string }>
	}): boolean {
		// Check weapon type
		if (weapon.type?.name) {
			const typeName = weapon.type.name;
			// Ranged weapon types
			if (typeName.includes('дальнобойное')) return true;
			// Melee weapon types
			if (typeName.includes('рукопашное')) return false;
		}

		// Fallback: check properties for ammunition (indicates ranged)
		if (weapon.properties && Array.isArray(weapon.properties)) {
			return weapon.properties.some(prop =>
				prop.name === 'Боеприпас' || prop.name === 'Ammunition'
			);
		}

		// Default to melee if unclear
		return false;
	}

	/**
	 * Normalize dice formula to Russian "к" notation.
	 * Converts English "d" or "D" to Russian "к".
	 * @param formula - Dice formula (e.g., "1d6", "2D8+3")
	 * @returns Normalized formula (e.g., "1к6", "2к8+3")
	 */
	function normalizeDiceFormula(formula: string): string {
		if (!formula) return '';
		// Replace English "d" with Russian "к"
		// Also handle uppercase D
		return formula.replace(DICE_NOTATION_REGEX, 'к').replace(DICE_NOTATION_REGEX_UPPER, 'к');
	}

	/**
	 * Validate dice formula in Russian or English notation.
	 * Accepts patterns like: к6, 1к6, 2к8, 1к6+3, 2к20-1 (and d variants)
	 * @param formula - Dice formula to validate
	 * @returns True if valid, false otherwise
	 */
	function isValidDiceFormula(formula: string): boolean {
		if (!formula || typeof formula !== 'string') return false;
		// Normalize to Russian notation first to handle both d and к
		const normalized = normalizeDiceFormula(formula.trim());
		// Pattern: optional number, 'к', number, optional +/- and number
		// Examples: к6, 1к6, 2к8, 1к6+3, 2к20-1
		const pattern = /^\d*к\d+([+-]\d+)?$/;
		return pattern.test(normalized);
	}

	/**
	 * Import a weapon or spell from clipboard.
	 * Supports both ```weapon and ```spell YAML formats.
	 * Auto-detects weapon type and sets appropriate ability modifier.
	 */
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

				// Validate weapon structure
				if (!weapon || typeof weapon !== 'object') {
					new Notice('Неверный формат: объект оружия не найден');
					return;
				}

				if (!weapon.name || (typeof weapon.name !== 'string' && typeof weapon.name !== 'object')) {
					new Notice('Неверный формат: отсутствует название оружия');
					return;
				}

				if (weapon && weapon.name) {
					// Normalize damage formula (d → к)
					const normalizedDamage = normalizeDiceFormula(weapon.damage?.dice || DEFAULT_DICE_RUSSIAN);

					// Determine weapon type and set appropriate ability
					const isRanged = isRangedWeapon(weapon);
					const defaultAbility = isRanged ? 'dex' : 'str';

					// Create weapon with proper defaults
					const newWeapon: WeaponItem = {
						id: `${WEAPON_ID_PREFIX}${Date.now()}`,
						name: { value: weapon.name.rus || weapon.name || 'Оружие' },
						mod: { value: DEFAULT_MODIFIER },  // Will be recalculated below
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

				// Validate spell structure
				if (!spell || typeof spell !== 'object') {
					new Notice('Неверный формат: объект заклинания не найден');
					return;
				}

				if (!spell.name || (typeof spell.name !== 'string' && typeof spell.name !== 'object')) {
					new Notice('Неверный формат: отсутствует название заклинания');
					return;
				}

				if (spell && spell.name) {
					// Normalize damage formula (d → к) for spells too
					const normalizedDamage = normalizeDiceFormula(spell.damage || DEFAULT_DAMAGE_SPELL);

					// Handle description - can be string (FullSpell) or object with rus property
					const spellDescription = typeof spell.description === 'string'
						? spell.description
						: spell.description?.rus || '';

					const newWeapon: WeaponItem = {
						id: `${SPELL_ID_PREFIX}${Date.now()}`,
						name: { value: spell.name.rus || spell.name || 'Заклинание' },
						mod: { value: DEFAULT_MODIFIER },
						dmg: { value: normalizedDamage },
						dmgType: { value: '' },
						additionalDamage: [],  // Initialize empty array
						isProf: false,
						modBonus: { value: 0 },
						abilityMod: undefined,  // Spells require manual ability selection
						notes: { value: spellDescription },
						notesVisibility: !!spellDescription
					};
					onChange([...weaponsList, newWeapon]);
					new Notice(`${newWeapon.name.value} добавлено`);
					return;
				}
			}

			new Notice('Не удалось распознать оружие или заклинание');
		} catch (e) {
			const errorMsg = e instanceof Error ? e.message : String(e);
			new Notice(`Ошибка при вставке: ${errorMsg}`);
		}
	}

	/**
	 * Close the notes popup when clicking outside of it.
	 * @param e - Mouse event
	 */
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
						<div
							class="notes-icon-wrapper"
							class:visible={shouldShow}
							onclick={(e: MouseEvent) => handleNotesClick(weapon.id, e)}
							onkeydown={(e: KeyboardEvent) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									handleNotesClick(weapon.id, e as any);
								}
							}}
							onmouseenter={() => hoveredInfoIconId = weapon.id}
							onmouseleave={() => hoveredInfoIconId = null}
							role="button"
							tabindex="0"
							aria-label="Редактировать заметки"
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
					<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
					<div
						class="attack-mod-col dice-field"
						class:clickable={!isEditing}
						onclick={(e) => !isEditing && handleModifierRoll(weapon, e)}
						onkeydown={(e) => {
							if (!isEditing && (e.key === 'Enter' || e.key === ' ')) {
								e.preventDefault();
								handleModifierRoll(weapon, e as any);
							}
						}}
						role={!isEditing ? "button" : undefined}
						tabindex={!isEditing ? 0 : undefined}
						aria-label={!isEditing ? `Бросить атаку для ${weapon.name.value}` : undefined}
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
										<div
											id="prof-{weapon.id}"
											class="prof-toggle"
											class:active={weapon.isProf}
											onclick={() => toggleProficiency(weapon.id)}
											onkeydown={(e) => {
												if (e.key === 'Enter' || e.key === ' ') {
													e.preventDefault();
													toggleProficiency(weapon.id);
												}
											}}
											title="Владение"
											role="checkbox"
											aria-checked={weapon.isProf}
											aria-label="Владение оружием"
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
											oninput={(e) => debouncedUpdateCustomBonus(weapon.id, parseInt((e.target as HTMLInputElement).value) || 0)}
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
					<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
					<div
						class="attack-dmg-col"
						onclick={(e) => !isEditing && handleDamageRoll(weapon, e)}
						onkeydown={(e) => {
							if (!isEditing && (e.key === 'Enter' || e.key === ' ')) {
								e.preventDefault();
								handleDamageRoll(weapon, e as any);
							}
						}}
						role={!isEditing ? "button" : undefined}
						tabindex={!isEditing ? 0 : undefined}
						aria-label={!isEditing ? `Бросить урон для ${weapon.name.value}` : undefined}
					>
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
							<div
								class="add-damage-btn"
								onclick={() => handleAddDamageSource(weapon.id)}
								onkeydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										handleAddDamageSource(weapon.id);
									}
								}}
								role="button"
								tabindex="0"
								aria-label="Добавить дополнительный урон"
							>
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
		role="dialog"
		aria-modal="true"
		aria-labelledby="notes-popup-title"
	>
		<div class="notes-popup-header">
			<h4 id="notes-popup-title">Заметки</h4>
			<IconButton icon={X} hint="Закрыть" onClick={handleCloseNotes} size={12} />
		</div>
		<textarea
			class="notes-textarea"
			bind:value={currentNotes}
			placeholder="Введите заметки..."
			aria-label="Текст заметки"
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
		appearance: none;
		-webkit-appearance: none;
		margin: 0;
	}

	.bonus-input[type=number] {
		appearance: textfield;
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
