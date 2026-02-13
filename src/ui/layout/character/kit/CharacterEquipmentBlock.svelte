<script lang="ts">
	import { Notice } from "obsidian";
	import { Plus, X, Link, PackageOpen, Backpack, Info, Sparkles, Zap, Clipboard } from "lucide-svelte";
	import IconButton from "../../uikit/IconButton.svelte";
	import type { EquipmentItem, CharacterCoins } from "../../../../domain/models/character/CharacterEquipment";
	import type { EntityLinkService } from "../../../../domain/services/EntityLinkService";
	import type { IUiEventListener } from "../../../../domain/listeners/ui_event_listener";
	import { getFromClipboard } from "../../../../data/clipboard";
	import type { FullItem } from "../../../../domain/models/items/FullItem";
	import type { FullArtifact } from "../../../../domain/models/artifact/FullArtifact";
	import type { FullArmor } from "../../../../domain/models/armor/FullArmor";

	interface Props {
		coins?: CharacterCoins;
		equipmentList: EquipmentItem[];
		equipmentText?: string;
		entityLinkService?: EntityLinkService;
		uiEventListener?: IUiEventListener;
		onChange?: (coins: CharacterCoins, equipmentList: EquipmentItem[]) => void;
	}

	let { coins, equipmentList, equipmentText = '', entityLinkService, uiEventListener, onChange }: Props = $props();

	// Local state for coins (to handle edit expressions)
	let coinInputs = $state({
		pp: coins?.pp?.value?.toString() || '0',
		gp: coins?.gp?.value?.toString() || '0',
		ep: coins?.ep?.value?.toString() || '0',
		sp: coins?.sp?.value?.toString() || '0',
		cp: coins?.cp?.value?.toString() || '0'
	});

	// Notes popup state (for editing)
	let showNotesPopup = $state<{ id: string; x: number; y: number } | null>(null);
	let currentNotes = $state('');

	// Notes hover preview state
	let showNotesPreview = $state<{ id: string; x: number; y: number; content: string } | null>(null);

	// Track which item's info icon is being hovered
	let hoveredInfoIconId = $state<string | null>(null);

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

	const DEBOUNCE_DELAY_MS = 300;

	// Calculate attuned items count
	const attunedCount = $derived(
		equipmentList.filter(item => item.isAttuned).length
	);

	/**
	 * Check if an item can be attuned (respects 3-item limit)
	 */
	function canAttune(itemId: string): boolean {
		const item = equipmentList.find(i => i.id === itemId);
		if (!item || !item.isMagic) return false;
		if (item.isAttuned) return true; // Can always toggle off
		return attunedCount < 3; // Check limit for new attunements
	}

	/**
	 * Safely evaluate math expressions in coin inputs
	 */
	function evaluateMathExpression(expr: string): number | null {
		// Remove whitespace
		const cleaned = expr.trim();

		// If empty or just "0", return 0
		if (!cleaned || cleaned === '0') return 0;

		// If it's already a plain number, parse it
		if (/^\d+$/.test(cleaned)) {
			const num = parseInt(cleaned, 10);
			return isNaN(num) ? null : num;
		}

		// Validate: only allow numbers and basic math operators
		if (!/^[\d+\-*/().\s]+$/.test(cleaned)) {
			return null;
		}

		try {
			// Use Function constructor for safe evaluation (no access to scope)
			const result = Function(`'use strict'; return (${cleaned})`)();

			// Validate result is a number and not negative
			if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
				const rounded = Math.floor(result);
				return rounded >= 0 ? rounded : null;
			}
		} catch (e) {
			// Expression evaluation failed
		}

		return null;
	}

	/**
	 * Handle coin input change with math expression support
	 */
	function handleCoinChange(coinType: keyof typeof coinInputs, value: string) {
		coinInputs[coinType] = value;

		// Debounced evaluation and save
		debouncedCoinSave();
	}

	/**
	 * Handle coin input blur - evaluate expression immediately
	 */
	function handleCoinBlur(coinType: keyof typeof coinInputs) {
		const result = evaluateMathExpression(coinInputs[coinType]);

		if (result !== null) {
			coinInputs[coinType] = result.toString();
			saveCoinChanges();
		} else if (coinInputs[coinType].trim() !== '') {
			new Notice('Неверное выражение для монет');
			// Revert to current value
			const currentValue = coins?.[coinType]?.value ?? 0;
			coinInputs[coinType] = currentValue.toString();
		}
	}

	/**
	 * Handle Enter key in coin inputs
	 */
	function handleCoinKeydown(e: KeyboardEvent, coinType: keyof typeof coinInputs) {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleCoinBlur(coinType);
		}
	}

	/**
	 * Save coin changes to parent
	 */
	function saveCoinChanges() {
		const newCoins: CharacterCoins = {
			pp: { value: parseInt(coinInputs.pp, 10) || 0 },
			gp: { value: parseInt(coinInputs.gp, 10) || 0 },
			ep: { value: parseInt(coinInputs.ep, 10) || 0 },
			sp: { value: parseInt(coinInputs.sp, 10) || 0 },
			cp: { value: parseInt(coinInputs.cp, 10) || 0 },
			total: { value: 0 } // Will be calculated by parent if needed
		};

		if (onChange) {
			onChange(newCoins, equipmentList);
		}
	}

	const debouncedCoinSave = debounce(saveCoinChanges, DEBOUNCE_DELAY_MS);

	/**
	 * Trigger onChange with current equipment list
	 */
	function triggerChange() {
		if (onChange && coins) {
			onChange(coins, equipmentList);
		}
	}

	const debouncedTriggerChange = debounce(triggerChange, DEBOUNCE_DELAY_MS);

	/**
	 * Auto-search for item link in database
	 */
	async function autoFindItemLink(itemId: string) {
		const item = equipmentList.find(i => i.id === itemId);
		if (!item || !entityLinkService) return;
		if (item.linkedUrl) return; // Already linked

		const itemName = item.name.value.trim();
		if (!itemName) return;

		// Try armor first
		const armorResult = await entityLinkService.findArmor(itemName);
		if (armorResult.exists && armorResult.url) {
			item.linkedUrl = armorResult.url;
			item.linkedType = 'armor';
			triggerChange();
			return;
		}

		// Try items
		const itemResult = await entityLinkService.findItem(itemName);
		if (itemResult.exists && itemResult.url) {
			item.linkedUrl = itemResult.url;
			item.linkedType = 'item';
			triggerChange();
			return;
		}

		// Try artifacts
		const artifactResult = await entityLinkService.findArtifact(itemName);
		if (artifactResult.exists && artifactResult.url) {
			item.linkedUrl = artifactResult.url;
			item.linkedType = 'artifact';
			triggerChange();
			return;
		}
	}

	const debouncedAutoFindItemLink = debounce(autoFindItemLink, 500);

	/**
	 * Add new equipment item
	 */
	function handleAddItem() {
		const newItem: EquipmentItem = {
			id: crypto.randomUUID(),
			name: { value: '' },
			onCharacter: true,
			isMagic: false,
			isAttuned: false,
			notes: { value: '' },
			notesVisibility: false
		};
		equipmentList.push(newItem);
		triggerChange();
	}

	/**
	 * Check if item requires attunement based on customization field.
	 * Only artifacts have the customization field; items and armor don't require attunement.
	 */
	function requiresAttunement(
		item: FullItem | FullArtifact | FullArmor,
		type: 'item' | 'artifact' | 'armor'
	): boolean {
		if (type === 'artifact') {
			const artifact = item as FullArtifact;
			return artifact.customization === true;
		}
		// Regular items and armor don't have customization field
		return false;
	}

	/**
	 * Detect if an item is magical based on its type and properties.
	 */
	function isMagicalItem(
		item: FullItem | FullArtifact | FullArmor,
		type: 'item' | 'artifact' | 'armor'
	): boolean {
		// Artifacts are always considered for magic check based on rarity
		if (type === 'artifact') {
			const artifact = item as FullArtifact;
			// If rarity exists and is not "common", it's magical
			if (artifact.rarity && artifact.rarity.type !== 'common') {
				return true;
			}
		}

		// For items and armor, check description for magic keywords
		const desc = item.description?.toLowerCase() || '';
		if (desc.includes('magic')) return true;
		if (desc.includes('магический')) return true;
		if (desc.includes('волшебн')) return true;

		// Also check if it requires attunement (attunement implies magic)
		if (requiresAttunement(item, type)) return true;

		return false;
	}

	/**
	 * Handle paste from clipboard - try to paste equipment/artifact/armor.
	 */
	async function handlePasteItem() {
		try {
			// Try to get data from clipboard in order of priority
			let pastedItem: FullItem | FullArtifact | FullArmor | undefined;
			let itemType: 'item' | 'artifact' | 'armor' | undefined;

			// Try artifact first (most likely to be magical)
			pastedItem = await getFromClipboard<FullArtifact>('artifact');
			if (pastedItem) {
				itemType = 'artifact';
			} else {
				// Try regular item
				pastedItem = await getFromClipboard<FullItem>('equip');
				if (pastedItem) {
					itemType = 'item';
				} else {
					// Try armor
					pastedItem = await getFromClipboard<FullArmor>('armor');
					if (pastedItem) {
						itemType = 'armor';
					}
				}
			}

			if (!pastedItem || !itemType) {
				new Notice('В буфере обмена нет данных предмета');
				return;
			}

			// Detect if item is magical
			const isMagic = isMagicalItem(pastedItem, itemType);

			// Detect if requires attunement (from customization field)
			const needsAttunement = requiresAttunement(pastedItem, itemType);

			// Check if we can attune (only if magical, needs attunement, and slots available)
			const canAutoAttune = isMagic && needsAttunement && attunedCount < 3;

			// Create new equipment item
			const newItem: EquipmentItem = {
				id: crypto.randomUUID(),
				name: { value: pastedItem.name.rus },
				onCharacter: true,
				isMagic: isMagic,
				isAttuned: canAutoAttune,  // Auto-attune if possible
				linkedUrl: pastedItem.url,
				linkedType: itemType,
				notes: { value: pastedItem.description || '' },
				notesVisibility: !!(pastedItem.description?.trim())
			};

			// Add to list
			equipmentList.push(newItem);
			triggerChange();

			// Show success message
			let message = `Предмет "${pastedItem.name.rus}" добавлен`;
			if (canAutoAttune) {
				message += ' и настроен';
			} else if (needsAttunement && attunedCount >= 3) {
				message += ' (нет доступных слотов настройки)';
			}
			new Notice(message);

		} catch (error) {
			console.error('Error pasting item:', error);
			new Notice('Ошибка при вставке предмета из буфера обмена');
		}
	}

	/**
	 * Remove equipment item
	 */
	function handleRemoveItem(itemId: string) {
		const index = equipmentList.findIndex(i => i.id === itemId);
		if (index !== -1) {
			equipmentList.splice(index, 1);
			triggerChange();
		}
	}

	/**
	 * Update item name
	 */
	function handleNameChange(itemId: string, newName: string) {
		const item = equipmentList.find(i => i.id === itemId);
		if (item) {
			item.name.value = newName;
			// Clear link if name changed
			if (item.linkedUrl) {
				item.linkedUrl = undefined;
				item.linkedType = undefined;
			}
			debouncedTriggerChange();
			// Auto-search for link after name change
			debouncedAutoFindItemLink(itemId);
		}
	}

	/**
	 * Toggle item location (on character / in backpack)
	 */
	function handleLocationToggle(itemId: string) {
		const item = equipmentList.find(i => i.id === itemId);
		if (item) {
			item.onCharacter = !item.onCharacter;
			triggerChange();
		}
	}

	/**
	 * Toggle magic item flag
	 */
	function handleMagicToggle(itemId: string) {
		const item = equipmentList.find(i => i.id === itemId);
		if (item) {
			item.isMagic = !item.isMagic;
			// Clear attunement if no longer magic
			if (!item.isMagic) {
				item.isAttuned = false;
			}
			triggerChange();
		}
	}

	/**
	 * Toggle attunement
	 */
	function handleAttunementToggle(itemId: string) {
		const item = equipmentList.find(i => i.id === itemId);
		if (item && canAttune(itemId)) {
			item.isAttuned = !item.isAttuned;
			triggerChange();
		}
	}

	/**
	 * Handle link button click - open side panel if linked
	 */
	async function handleLinkClick(itemId: string) {
		const item = equipmentList.find(i => i.id === itemId);
		if (!item || !uiEventListener) return;

		if (item.linkedUrl) {
			// Already linked - open in side panel
			switch (item.linkedType) {
				case 'armor':
					await uiEventListener.onArmorClick(item.linkedUrl);
					break;
				case 'item':
					await uiEventListener.onItemClick(item.linkedUrl);
					break;
				case 'artifact':
					await uiEventListener.onArtifactClick(item.linkedUrl);
					break;
			}
		} else {
			new Notice('Предмет не найден в базе данных');
		}
	}

	/**
	 * Open the notes popup for editing item notes.
	 */
	function handleNotesClick(id: string, e: MouseEvent) {
		e.stopPropagation();
		const item = equipmentList.find(i => i.id === id);
		const target = e.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();

		currentNotes = item?.notes?.value || '';
		showNotesPopup = {
			id,
			x: rect.left,
			y: rect.bottom + 5
		};
	}

	/**
	 * Save the notes from the popup and close it.
	 */
	function handleSaveNotes() {
		if (showNotesPopup) {
			const item = equipmentList.find(i => i.id === showNotesPopup!.id);
			if (item) {
				item.notes = { value: currentNotes };
				item.notesVisibility = currentNotes.trim().length > 0;
			}
			triggerChange();
		}
		showNotesPopup = null;
	}

	/**
	 * Close the notes popup without saving.
	 */
	function handleCloseNotes(e?: MouseEvent) {
		if (e) e.stopPropagation();
		showNotesPopup = null;
	}

	/**
	 * Close the notes popup when clicking outside of it.
	 */
	function handleClickOutside(e: MouseEvent) {
		if (showNotesPopup) {
			const target = e.target as HTMLElement;
			if (!target.closest('.notes-popup')) {
				handleCloseNotes();
			}
		}
	}

	/**
	 * Show notes preview on hover
	 */
	function handleNotesHoverEnter(id: string, e: MouseEvent) {
		hoveredInfoIconId = id;
		const item = equipmentList.find(i => i.id === id);
		const notesContent = item?.notes?.value?.trim();

		if (notesContent) {
			const target = e.currentTarget as HTMLElement;
			const rect = target.getBoundingClientRect();

			showNotesPreview = {
				id,
				x: rect.left,
				y: rect.bottom + 5,
				content: notesContent
			};
		}
	}

	/**
	 * Hide notes preview on mouse leave
	 */
	function handleNotesHoverLeave() {
		hoveredInfoIconId = null;
		showNotesPreview = null;
	}

	// Auto-find links for items when component loads
	$effect(() => {
		if (entityLinkService && equipmentList.length > 0) {
			equipmentList.forEach(item => {
				if (!item.linkedUrl && item.name.value.trim()) {
					autoFindItemLink(item.id);
				}
			});
		}
	});

	const coinTypes = [
		{ key: 'cp' as const, label: 'ММ', fullLabel: 'Медные монеты' },
		{ key: 'sp' as const, label: 'СМ', fullLabel: 'Серебряные монеты' },
		{ key: 'ep' as const, label: 'ЭП', fullLabel: 'Электрум' },
		{ key: 'gp' as const, label: 'ЗМ', fullLabel: 'Золотые монеты' },
		{ key: 'pp' as const, label: 'ПП', fullLabel: 'Платиновые монеты' }
	];
</script>

<svelte:window onclick={handleClickOutside} />

<div class="character-equipment-block">
	<!-- Money Tracker Section -->
	<div class="money-section">
		<div class="money-tracker">
			{#each coinTypes as coinType}
				<div class="coin-input-group">
					<input
						id="coin-{coinType.key}"
						type="text"
						class="coin-input"
						value={coinInputs[coinType.key]}
						oninput={(e) => handleCoinChange(coinType.key, e.currentTarget.value)}
						onblur={() => handleCoinBlur(coinType.key)}
						onkeydown={(e) => handleCoinKeydown(e, coinType.key)}
						aria-label={coinType.fullLabel}
						aria-describedby="coin-hint-{coinType.key}"
					/>
					<label for="coin-{coinType.key}" class="coin-label">
						{coinType.label}
					</label>
					<div id="coin-hint-{coinType.key}" class="sr-only">
						Можно ввести число или математическое выражение (например, 10+5)
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Equipment Grid Section -->
	<div class="equipment-section">
		{#if equipmentList.length > 0}
			<div class="equipment-grid">
				{#each equipmentList as item (item.id)}
					{@const hasNotes = !!(item.notes?.value?.trim())}
					{@const isHovered = hoveredInfoIconId === item.id}
					{@const shouldShowNotes = hasNotes || isHovered}
					<div class="equipment-item" role="group" aria-labelledby="item-name-{item.id}">
						<!-- Item Name and Actions Row -->
						<div class="item-main-row">
							<!-- Item Name Input -->
							<input
								id="item-name-{item.id}"
								type="text"
								class="item-name-input"
								value={item.name.value}
								oninput={(e) => handleNameChange(item.id, e.currentTarget.value)}
								placeholder="Название предмета"
								aria-label="Название предмета"
							/>

							<!-- Action Buttons -->
							<div class="item-actions">
								<!-- Notes Icon -->
								<div
									class="notes-icon-wrapper"
									class:visible={shouldShowNotes}
									onclick={(e) => handleNotesClick(item.id, e)}
									onkeydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											handleNotesClick(item.id, e);
										}
									}}
									onmouseenter={(e) => handleNotesHoverEnter(item.id, e)}
									onmouseleave={handleNotesHoverLeave}
									role="button"
									tabindex="0"
									aria-label="Открыть заметки"
								>
									<IconButton
										icon={Info}
										hint="Заметки"
										onClick={() => {}}
										size={14}
									/>
								</div>

								<!-- Location Toggle -->
								<button
									class="location-toggle"
									class:on-character={item.onCharacter}
									onclick={() => handleLocationToggle(item.id)}
									role="switch"
									aria-checked={item.onCharacter}
									aria-label={item.onCharacter ? 'На персонаже' : 'В рюкзаке'}
									title={item.onCharacter ? 'На персонаже' : 'В рюкзаке'}
								>
									{#if item.onCharacter}
										<PackageOpen size={14} />
									{:else}
										<Backpack size={14} />
									{/if}
								</button>

								<!-- Link Button (only show if linked) -->
								{#if item.linkedUrl}
									<button
										class="link-button linked"
										onclick={() => handleLinkClick(item.id)}
										aria-label="Открыть в базе данных"
										title="Открыть в базе данных"
									>
										<Link size={14} />
									</button>
								{/if}

								<!-- Magic Toggle Icon -->
								<button
									class="magic-toggle"
									class:active={item.isMagic}
									onclick={() => handleMagicToggle(item.id)}
									role="switch"
									aria-checked={item.isMagic}
									aria-label="Магический предмет"
									title="Магия"
								>
									<Sparkles size={14} />
								</button>

								<!-- Attunement Toggle Icon (conditional) -->
								{#if item.isMagic}
									<button
										class="attunement-toggle"
										class:active={item.isAttuned}
										class:disabled={!canAttune(item.id)}
										onclick={() => handleAttunementToggle(item.id)}
										disabled={!canAttune(item.id)}
										role="switch"
										aria-checked={item.isAttuned}
										aria-label="Настройка на предмет"
										title="Настройка"
									>
										<Zap size={14} />
									</button>
								{/if}

								<!-- Delete Button -->
								<button
									class="delete-button"
									onclick={() => handleRemoveItem(item.id)}
									aria-label="Удалить предмет"
									title="Удалить"
								>
									<X size={14} />
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Add Item Button Row -->
		<div class="add-item-row">
			<button class="add-item-button" onclick={handleAddItem} aria-label="Добавить новый предмет">
				<Plus size={18} />
				<span>Добавить предмет</span>
			</button>

			<!-- Paste button -->
			<button class="paste-button" onclick={handlePasteItem} aria-label="Вставить предмет из буфера обмена" title="Вставить">
				<Clipboard size={18} />
			</button>

			{#if attunedCount > 0}
				<div class="attunement-counter" aria-live="polite">
					Настройка: {attunedCount}/3
				</div>
			{/if}
		</div>

		<!-- Equipment Notes Section -->
		{#if equipmentText}
			<div class="equipment-notes">
				<textarea
					id="equipment-notes"
					class="notes-textarea-readonly"
					readonly
					value={equipmentText}
					aria-label="Импортированное снаряжение"
				></textarea>
			</div>
		{/if}
	</div>

	<!-- Screen Reader Announcement for Attunement Limit -->
	{#if attunedCount >= 3}
		<div class="sr-only" aria-live="polite">
			Достигнут лимит настройки на предметы (3 из 3)
		</div>
	{/if}
</div>

<!-- Notes hover preview -->
{#if showNotesPreview}
	<div
		class="notes-preview"
		style="left: {showNotesPreview.x}px; top: {showNotesPreview.y}px;"
		onmouseenter={() => {
			// Keep preview open when hovering over it
			if (showNotesPreview) {
				hoveredInfoIconId = showNotesPreview.id;
			}
		}}
		onmouseleave={handleNotesHoverLeave}
		role="tooltip"
		aria-live="polite"
	>
		<div class="notes-preview-content">
			{@html showNotesPreview.content}
		</div>
	</div>
{/if}

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
	.character-equipment-block {
		container-type: inline-size;
		padding: 16px;
		background-color: var(--background-primary);
		border: 1px solid var(--background-modifier-border);
		border-radius: 6px;
		margin-bottom: 16px;
	}

	/* Money Tracker Section */
	.money-section {
		margin-bottom: 16px;
	}

	.money-tracker {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 8px;
	}

	@container (max-width: 400px) {
		.money-tracker {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.coin-input-group {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.coin-input {
		width: 100%;
		min-width: 0;
		padding: 8px;
		background-color: var(--background-secondary);
		border: 1px solid var(--background-modifier-border);
		border-radius: 4px;
		font-size: 14px;
		font-weight: 600;
		color: var(--text-accent);
		text-align: center;
		transition: border-color 0.2s, box-shadow 0.2s;
		box-sizing: border-box;
	}

	.coin-input:focus {
		outline: none;
		border-color: var(--text-accent);
		box-shadow: 0 0 0 2px var(--text-accent-hover);
	}

	.coin-label {
		font-size: 10px;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--text-muted);
		text-align: center;
	}

	/* Equipment Section */
	.equipment-section {
		margin-top: 0;
	}

	.attunement-counter {
		font-size: 12px;
		font-weight: 600;
		color: var(--text-muted);
		padding: 4px 12px;
		background-color: var(--background-secondary);
		border-radius: 12px;
		border: 1px solid var(--background-modifier-border);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.equipment-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
		margin-bottom: 12px;
	}

	@container (max-width: 600px) {
		.equipment-grid {
			grid-template-columns: 1fr;
		}
	}

	.equipment-item {
		background-color: var(--background-secondary);
		border: 1px solid var(--background-modifier-border);
		border-radius: 4px;
		display: flex;
		flex-direction: column;
		transition: box-shadow 0.2s;
	}

	.equipment-item:focus-within {
		box-shadow: 0 0 0 2px var(--text-accent-hover);
	}

	.item-main-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.item-name-input {
		flex: 1;
		padding: 6px 8px;
		background-color: var(--background-primary);
		border: 1px solid var(--background-modifier-border);
		border-radius: 4px;
		font-size: 13px;
		font-weight: 500;
		color: var(--text-normal);
		transition: border-color 0.2s;
	}

	.item-name-input:focus {
		outline: none;
		border-color: var(--text-accent);
	}

	.item-name-input::placeholder {
		color: var(--text-faint);
	}

	.item-actions {
		display: flex;
		align-items: center;
		gap: 4px;
		flex-shrink: 0;
	}

	.notes-icon-wrapper {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		opacity: 0;
		transition: opacity 0.2s;
	}

	.notes-icon-wrapper.visible {
		opacity: 1;
	}

	.location-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4px;
		background-color: var(--background-primary);
		border: 1px solid var(--background-modifier-border);
		border-radius: 4px;
		color: var(--text-muted);
		cursor: pointer;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.location-toggle:hover {
		background-color: var(--background-modifier-hover);
	}

	.location-toggle.on-character {
		background-color: var(--text-accent);
		border-color: var(--text-accent);
		color: var(--text-on-accent);
	}

	.location-toggle:focus-visible {
		outline: 2px solid var(--text-accent);
		outline-offset: 2px;
	}

	.link-button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4px;
		background-color: var(--background-primary);
		border: 1px solid var(--background-modifier-border);
		border-radius: 4px;
		color: var(--text-muted);
		cursor: pointer;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.link-button:hover:not(:disabled) {
		background-color: var(--background-modifier-hover);
	}

	.link-button.linked {
		color: var(--text-accent);
		border-color: var(--text-accent);
		cursor: pointer;
	}

	.link-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.link-button:focus-visible {
		outline: 2px solid var(--text-accent);
		outline-offset: 2px;
	}

	.magic-toggle,
	.attunement-toggle,
	.delete-button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4px;
		background-color: var(--background-primary);
		border: 1px solid var(--background-modifier-border);
		border-radius: 4px;
		color: var(--text-muted);
		cursor: pointer;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.magic-toggle:hover,
	.attunement-toggle:hover:not(:disabled),
	.delete-button:hover {
		background-color: var(--background-modifier-hover);
	}

	.magic-toggle.active,
	.attunement-toggle.active {
		color: var(--text-accent);
		border-color: var(--text-accent);
		background-color: var(--background-primary);
	}

	.attunement-toggle:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.delete-button {
		color: var(--text-error);
	}

	.delete-button:hover {
		background-color: var(--background-modifier-error);
		border-color: var(--text-error);
	}

	.magic-toggle:focus-visible,
	.attunement-toggle:focus-visible,
	.delete-button:focus-visible {
		outline: 2px solid var(--text-accent);
		outline-offset: 2px;
	}

	.add-item-row {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;  /* Allow wrapping on very narrow screens */
	}

	.add-item-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		flex: 1;
		padding: 12px;
		background-color: var(--background-secondary);
		border: 2px dashed var(--background-modifier-border);
		border-radius: 4px;
		color: var(--text-muted);
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.add-item-button:hover {
		background-color: var(--background-modifier-hover);
		border-color: var(--text-accent);
		color: var(--text-accent);
	}

	.add-item-button:focus-visible {
		outline: 2px solid var(--text-accent);
		outline-offset: 2px;
	}

	.paste-button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 12px;
		background-color: var(--background-secondary);
		border: 2px solid var(--background-modifier-border);
		border-radius: 4px;
		color: var(--text-muted);
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.paste-button:hover {
		background-color: var(--background-modifier-hover);
		border-color: var(--text-accent);
		color: var(--text-accent);
	}

	.paste-button:focus-visible {
		outline: 2px solid var(--text-accent);
		outline-offset: 2px;
	}

	/* Equipment Notes Section */
	.equipment-notes {
		margin-top: 12px;
	}

	.notes-textarea-readonly {
		width: 100%;
		min-height: 80px;
		padding: 8px;
		background-color: var(--background-secondary);
		border: 1px solid var(--background-modifier-border);
		border-radius: 4px;
		font-size: 13px;
		color: var(--text-normal);
		resize: vertical;
		font-family: var(--font-text);
		box-sizing: border-box;
	}

	.notes-textarea-readonly:focus {
		outline: none;
		border-color: var(--text-accent);
	}

	/* Notes hover preview */
	.notes-preview {
		position: fixed;
		z-index: 999;
		background-color: var(--background-primary);
		border: 1px solid var(--background-modifier-border);
		border-radius: 4px;
		padding: 8px 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		max-width: 300px;
		font-size: 13px;
		color: var(--text-normal);
		pointer-events: auto;
	}

	.notes-preview-content {
		overflow-wrap: break-word;
		word-wrap: break-word;
		line-height: 1.5;
	}

	/* Style HTML content in preview */
	.notes-preview-content :global(p) {
		margin: 0 0 8px 0;
	}

	.notes-preview-content :global(p:last-child) {
		margin-bottom: 0;
	}

	.notes-preview-content :global(strong) {
		font-weight: 600;
		color: var(--text-normal);
	}

	.notes-preview-content :global(em) {
		font-style: italic;
	}

	.notes-preview-content :global(ul),
	.notes-preview-content :global(ol) {
		margin: 0 0 8px 0;
		padding-left: 20px;
	}

	.notes-preview-content :global(li) {
		margin-bottom: 4px;
	}

	.notes-preview-content :global(code) {
		background-color: var(--background-secondary);
		padding: 2px 4px;
		border-radius: 3px;
		font-family: var(--font-monospace);
		font-size: 0.9em;
	}

	/* Notes popup */
	.notes-popup {
		position: fixed;
		z-index: 1000;
		background-color: var(--background-primary);
		border: 1px solid var(--background-modifier-border);
		border-radius: 4px;
		padding: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		min-width: 250px;
	}

	.notes-popup-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
		padding-bottom: 8px;
		border-bottom: 1px solid var(--background-modifier-border);
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
		padding: 8px;
		background-color: var(--background-secondary);
		border: 1px solid var(--background-modifier-border);
		border-radius: 4px;
		font-size: 13px;
		color: var(--text-normal);
		resize: vertical;
		font-family: var(--font-text);
		margin-bottom: 8px;
	}

	.notes-textarea:focus {
		outline: none;
		border-color: var(--text-accent);
	}

	.notes-popup-footer {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
	}

	.save-button,
	.cancel-button {
		padding: 6px 12px;
		border-radius: 4px;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.save-button {
		background-color: var(--text-accent);
		color: var(--text-on-accent);
		border: 1px solid var(--text-accent);
	}

	.save-button:hover {
		background-color: var(--text-accent-hover);
	}

	.cancel-button {
		background-color: var(--background-secondary);
		color: var(--text-normal);
		border: 1px solid var(--background-modifier-border);
	}

	.cancel-button:hover {
		background-color: var(--background-modifier-hover);
	}

	/* Screen Reader Only */
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
</style>
