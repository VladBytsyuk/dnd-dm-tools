<script lang="ts">
	import { Notice } from "obsidian";
	import { Clipboard, Eye, Link2, Plus, Trash2 } from "lucide-svelte";
	import { formatModifier } from "../../../../domain/modifier";
	import type { IUiEventListener } from "../../../../domain/listeners/ui_event_listener";
	import type { EntityLinkService } from "../../../../domain/services/EntityLinkService";
	import type { ClassEntry } from "../../../../domain/models/character/ClassEntry";
	import type { CharacterSpellEntry, CharacterSpellbookState, SpellLevelKey, SpellcastingAbilityCode } from "../../../../domain/models/character/CharacterSpellbook";
	import type { FullSpell } from "../../../../domain/models/spell/FullSpell";
	import AutocompleteInput from "../../uikit/AutocompleteInput.svelte";
	import IconButton from "../../uikit/IconButton.svelte";
	import { getFromClipboard } from "../../../../data/clipboard";
	import { calculatePreparedSpellLimit, calculateSpellSlotProgression } from "../../../../domain/utils/characterSpellcasting";

	type AbilityStats = Record<Exclude<SpellcastingAbilityCode, "">, { score: number; modifier: number }>;
	type SpellAutocompleteItem = { name: { rus: string; eng: string }; url: string; level: number };

	interface Props {
		spellbook: CharacterSpellbookState;
		stats: AbilityStats;
		classes: ClassEntry[];
		proficiency: number;
		spellAutocompleteItems?: SpellAutocompleteItem[];
		entityLinkService?: EntityLinkService;
		uiEventListener?: IUiEventListener;
		onChange?: (spellbook: CharacterSpellbookState) => void;
	}

	const abilityOptions: Array<{ code: SpellcastingAbilityCode; label: string }> = [
		{ code: "", label: "Не выбрана" },
		{ code: "str", label: "Сила" },
		{ code: "dex", label: "Ловкость" },
		{ code: "con", label: "Телосложение" },
		{ code: "int", label: "Интеллект" },
		{ code: "wis", label: "Мудрость" },
		{ code: "cha", label: "Харизма" },
	];

	const levelLabels: Record<SpellLevelKey, string> = {
		"0": "Заговоры",
		"1": "1 круг",
		"2": "2 круг",
		"3": "3 круг",
		"4": "4 круг",
		"5": "5 круг",
		"6": "6 круг",
		"7": "7 круг",
		"8": "8 круг",
		"9": "9 круг",
	};

	let {
		spellbook,
		stats,
		classes,
		proficiency,
		spellAutocompleteItems = [],
		entityLinkService,
		uiEventListener,
		onChange,
	}: Props = $props();

	const slotProgression = $derived(calculateSpellSlotProgression(classes || []));
	const selectedAbilityModifier = $derived(
		spellbook.baseAbilityCode ? stats[spellbook.baseAbilityCode].modifier : 0
	);
	const calculatedSaveDc = $derived(8 + (proficiency || 0) + selectedAbilityModifier);
	const calculatedAttackBonus = $derived((proficiency || 0) + selectedAbilityModifier);
	const displayedSaveDc = $derived(spellbook.saveDcOverride ?? calculatedSaveDc);
	const displayedAttackBonus = $derived(spellbook.attackBonusOverride ?? calculatedAttackBonus);
	const calculatedPreparedLimit = $derived(
		calculatePreparedSpellLimit(classes || [], spellbook.baseAbilityCode, stats)
	);
	const displayedPreparedLimit = $derived(
		spellbook.preparedSpellLimitOverride ?? calculatedPreparedLimit
	);
	const preparedSpellCount = $derived(countPreparedSpells(spellbook));
	const canPrepareMoreSpells = $derived(
		displayedPreparedLimit === null ? true : preparedSpellCount < displayedPreparedLimit
	);

	function updateSpellbook(mutator: (draft: CharacterSpellbookState) => void) {
		const draft = cloneSpellbook(spellbook);
		mutator(draft);
		onChange?.(draft);
	}

	function handleBaseAbilityChange(event: Event) {
		const code = (event.target as HTMLSelectElement).value as SpellcastingAbilityCode;
		updateSpellbook((draft) => {
			draft.baseAbilityCode = code;
			if (draft.saveDcOverride === calculatedSaveDc) {
				draft.saveDcOverride = null;
			}
			if (draft.attackBonusOverride === calculatedAttackBonus) {
				draft.attackBonusOverride = null;
			}
		});
	}

	function handleSaveDcInput(event: Event) {
		const parsed = parseNullableNumber((event.target as HTMLInputElement).value);
		updateSpellbook((draft) => {
			draft.saveDcOverride = parsed === null || parsed === calculatedSaveDc ? null : parsed;
		});
	}

	function handleAttackBonusInput(event: Event) {
		const parsed = parseNullableNumber((event.target as HTMLInputElement).value);
		updateSpellbook((draft) => {
			draft.attackBonusOverride = parsed === null || parsed === calculatedAttackBonus ? null : parsed;
		});
	}

	function handlePreparedLimitInput(event: Event) {
		const parsed = parseNullableNumber((event.target as HTMLInputElement).value);
		updateSpellbook((draft) => {
			draft.preparedSpellLimitOverride = parsed === null || parsed === calculatedPreparedLimit
				? null
				: Math.max(0, parsed);
		});
	}

	function getLevelState(levelKey: SpellLevelKey) {
		return spellbook.levels[levelKey];
	}

	function getEffectiveSlotCount(levelKey: SpellLevelKey): number {
		if (levelKey === "0") {
			return 0;
		}
		const override = spellbook.levels[levelKey].slotCountOverride;
		return override ?? slotProgression.slots[parseInt(levelKey, 10)] ?? 0;
	}

	function getDisplayedSlots(levelKey: SpellLevelKey): boolean[] {
		const effectiveCount = getEffectiveSlotCount(levelKey);
		const used = spellbook.levels[levelKey].slotsUsed;
		return Array.from({ length: effectiveCount }, (_, index) => Boolean(used[index]));
	}

	function getDisplayedPactSlots(): boolean[] {
		const pact = spellbook.pact;
		if (!pact || !slotProgression.pact) {
			return [];
		}
		const effectiveCount = pact.slotCountOverride ?? slotProgression.pact.slotCount;
		return Array.from({ length: effectiveCount }, (_, index) => Boolean(pact.slotsUsed[index]));
	}

	function handleSlotOverrideInput(levelKey: SpellLevelKey, event: Event) {
		const parsed = parseNullableNumber((event.target as HTMLInputElement).value);
		const calculated = levelKey === "0" ? 0 : slotProgression.slots[parseInt(levelKey, 10)] ?? 0;
		updateSpellbook((draft) => {
			const levelState = draft.levels[levelKey];
			levelState.slotCountOverride = parsed === null || parsed === calculated ? null : Math.max(0, parsed);
			const effectiveCount = levelState.slotCountOverride ?? calculated;
			levelState.slotsUsed = normalizeSlotArray(levelState.slotsUsed, effectiveCount);
		});
	}

	function toggleSlot(levelKey: SpellLevelKey, index: number) {
		updateSpellbook((draft) => {
			const levelState = draft.levels[levelKey];
			const count = levelState.slotCountOverride ?? slotProgression.slots[parseInt(levelKey, 10)] ?? 0;
			levelState.slotsUsed = normalizeSlotArray(levelState.slotsUsed, count);
			levelState.slotsUsed[index] = !levelState.slotsUsed[index];
		});
	}

	function handlePactOverrideInput(event: Event) {
		if (!slotProgression.pact) return;
		const parsed = parseNullableNumber((event.target as HTMLInputElement).value);
		updateSpellbook((draft) => {
			if (!draft.pact) {
				draft.pact = {
					slotLevel: slotProgression.pact!.slotLevel,
					slotCountOverride: null,
					slotsUsed: [],
				};
			}
			draft.pact.slotCountOverride = parsed === null || parsed === slotProgression.pact!.slotCount
				? null
				: Math.max(0, parsed);
			const effectiveCount = draft.pact.slotCountOverride ?? slotProgression.pact!.slotCount;
			draft.pact.slotLevel = slotProgression.pact!.slotLevel;
			draft.pact.slotsUsed = normalizeSlotArray(draft.pact.slotsUsed, effectiveCount);
		});
	}

	function togglePactSlot(index: number) {
		if (!slotProgression.pact) return;
		updateSpellbook((draft) => {
			if (!draft.pact) {
				draft.pact = {
					slotLevel: slotProgression.pact!.slotLevel,
					slotCountOverride: null,
					slotsUsed: [],
				};
			}
			const count = draft.pact.slotCountOverride ?? slotProgression.pact!.slotCount;
			draft.pact.slotLevel = slotProgression.pact!.slotLevel;
			draft.pact.slotsUsed = normalizeSlotArray(draft.pact.slotsUsed, count);
			draft.pact.slotsUsed[index] = !draft.pact.slotsUsed[index];
		});
	}

	function addManualSpell(levelKey: SpellLevelKey) {
		updateSpellbook((draft) => {
			draft.levels[levelKey].spells = [
				...draft.levels[levelKey].spells,
				createSpellEntry(parseInt(levelKey, 10)),
			];
		});
	}

	async function addSpellFromClipboard(levelKey: SpellLevelKey) {
		const clipboardSpell = await getFromClipboard<FullSpell>("spell");
		if (!clipboardSpell) {
			return;
		}

		const targetLevelKey = String(clipboardSpell.level) as SpellLevelKey;
		const targetExists = Object.prototype.hasOwnProperty.call(spellbook.levels, targetLevelKey);
		const finalLevelKey = targetExists ? targetLevelKey : levelKey;

		updateSpellbook((draft) => {
			draft.levels[finalLevelKey].spells = [
				...draft.levels[finalLevelKey].spells,
				createSpellEntry(clipboardSpell.level, clipboardSpell),
			];
		});

		if (finalLevelKey !== levelKey) {
			new Notice(`Заклинание добавлено в раздел "${levelLabels[finalLevelKey]}"`);
		}
	}

	function updateSpellName(levelKey: SpellLevelKey, spellId: string, value: string) {
		updateSpellbook((draft) => {
			const spell = findSpell(draft, levelKey, spellId);
			if (!spell) return;
			spell.name = value;
			if (!matchesLinkedName(spell, value, spellAutocompleteItems)) {
				delete spell.linkedSpellUrl;
			}
		});
	}

	function selectAutocompleteSpell(levelKey: SpellLevelKey, spellId: string, item: SpellAutocompleteItem) {
		const targetLevelKey = String(item.level) as SpellLevelKey;
		updateSpellbook((draft) => {
			const currentLevel = draft.levels[levelKey];
			const spellIndex = currentLevel.spells.findIndex((entry) => entry.id === spellId);
			if (spellIndex < 0) return;

			const existing = currentLevel.spells[spellIndex];
			const updated: CharacterSpellEntry = {
				...existing,
				name: item.name.rus,
				level: item.level,
				linkedSpellUrl: item.url,
			};

			currentLevel.spells = currentLevel.spells.filter((entry) => entry.id !== spellId);
			draft.levels[targetLevelKey].spells = [...draft.levels[targetLevelKey].spells, updated];
		});
	}

	async function relinkSpell(levelKey: SpellLevelKey, spellId: string) {
		const spell = findSpell(spellbook, levelKey, spellId);
		if (!spell || !entityLinkService || !spell.name.trim()) {
			return;
		}

		const result = await entityLinkService.findSpell(spell.name);
		if (!result.exists || !result.url) {
			new Notice("Заклинание не найдено в базе");
			return;
		}

		const matchedItem = spellAutocompleteItems.find((item) => item.url === result.url);
		if (!matchedItem) {
			return;
		}

		selectAutocompleteSpell(levelKey, spellId, matchedItem);
	}

	function togglePrepared(levelKey: SpellLevelKey, spellId: string) {
		updateSpellbook((draft) => {
			const spell = findSpell(draft, levelKey, spellId);
			if (!spell) return;
			if (!spell.prepared && levelKey !== "0") {
				const preparedLimit = draft.preparedSpellLimitOverride ?? calculatedPreparedLimit;
				if (preparedLimit !== null && countPreparedSpells(draft) >= preparedLimit) {
					return;
				}
			}
			spell.prepared = !spell.prepared;
		});
	}

	function removeSpell(levelKey: SpellLevelKey, spellId: string) {
		updateSpellbook((draft) => {
			draft.levels[levelKey].spells = draft.levels[levelKey].spells.filter((spell) => spell.id !== spellId);
		});
	}

	function openSpell(spell: CharacterSpellEntry) {
		if (!spell.linkedSpellUrl) {
			return;
		}
		uiEventListener?.onSpellClick(spell.linkedSpellUrl);
	}

	function findSpell(
		sourceSpellbook: CharacterSpellbookState,
		levelKey: SpellLevelKey,
		spellId: string
	): CharacterSpellEntry | undefined {
		return sourceSpellbook.levels[levelKey].spells.find((spell) => spell.id === spellId);
	}

	function cloneSpellbook(source: CharacterSpellbookState): CharacterSpellbookState {
		return {
			...source,
			levels: {
				"0": cloneLevel(source.levels["0"]),
				"1": cloneLevel(source.levels["1"]),
				"2": cloneLevel(source.levels["2"]),
				"3": cloneLevel(source.levels["3"]),
				"4": cloneLevel(source.levels["4"]),
				"5": cloneLevel(source.levels["5"]),
				"6": cloneLevel(source.levels["6"]),
				"7": cloneLevel(source.levels["7"]),
				"8": cloneLevel(source.levels["8"]),
				"9": cloneLevel(source.levels["9"]),
			},
			pact: source.pact
				? {
					slotLevel: source.pact.slotLevel,
					slotCountOverride: source.pact.slotCountOverride,
					slotsUsed: [...source.pact.slotsUsed],
				}
				: null,
			preparedSpellLimitOverride: source.preparedSpellLimitOverride,
		};
	}

	function cloneLevel(levelState: CharacterSpellbookState["levels"][SpellLevelKey]) {
		return {
			level: levelState.level,
			slotCountOverride: levelState.slotCountOverride,
			slotsUsed: [...levelState.slotsUsed],
			spells: levelState.spells.map((spell) => ({ ...spell })),
		};
	}

	function createSpellEntry(level: number, spell?: FullSpell): CharacterSpellEntry {
		const name = spell?.name.rus ?? "";
		return {
			id: crypto.randomUUID(),
			name,
			level,
			prepared: false,
			...(spell?.url ? { linkedSpellUrl: spell.url } : {}),
		};
	}

	function parseNullableNumber(value: string): number | null {
		const trimmed = value.trim();
		if (!trimmed) {
			return null;
		}
		const parsed = parseInt(trimmed, 10);
		return Number.isNaN(parsed) ? null : parsed;
	}

	function normalizeSlotArray(values: boolean[], count: number): boolean[] {
		return Array.from({ length: Math.max(0, count) }, (_, index) => Boolean(values[index]));
	}

	function matchesLinkedName(
		spell: CharacterSpellEntry,
		value: string,
		items: SpellAutocompleteItem[]
	): boolean {
		if (!spell.linkedSpellUrl) {
			return false;
		}
		const item = items.find((candidate) => candidate.url === spell.linkedSpellUrl);
		if (!item) {
			return false;
		}
		const normalized = value.trim().toLowerCase();
		return normalized === item.name.rus.toLowerCase() || normalized === item.name.eng.toLowerCase();
	}

	function countPreparedSpells(sourceSpellbook: CharacterSpellbookState): number {
		return Object.entries(sourceSpellbook.levels).reduce((sum, [levelKey, levelState]) => {
			if (levelKey === "0") {
				return sum;
			}
			return sum + levelState.spells.filter((spell) => spell.prepared).length;
		}, 0);
	}
</script>

<div class="character-spellbook">
	<div class="spellbook-header">
		<h3 class="section-title">Заклинания</h3>
	</div>

	<div class="spellcasting-summary">
		<label class="summary-field summary-field-wide">
			<span class="summary-label">Базовая</span>
			<select class="summary-select" value={spellbook.baseAbilityCode} onchange={handleBaseAbilityChange}>
				{#each abilityOptions as option}
					<option value={option.code}>{option.label}</option>
				{/each}
			</select>
		</label>

		<label class="summary-field">
			<span class="summary-label">СЛ</span>
			<input
				type="number"
				class="summary-input"
				class:overridden={spellbook.saveDcOverride !== null}
				value={displayedSaveDc}
				oninput={handleSaveDcInput}
			/>
		</label>

		<label class="summary-field">
			<span class="summary-label">Атака</span>
			<input
				type="text"
				class="summary-input"
				class:overridden={spellbook.attackBonusOverride !== null}
				value={formatModifier(displayedAttackBonus)}
				oninput={handleAttackBonusInput}
			/>
		</label>

		<label class="summary-field">
			<span class="summary-label">Подготовка</span>
			<div class="prepared-counter">
				<span class="prepared-count">{preparedSpellCount}/</span>
				<input
					type="number"
					class="summary-input"
					class:overridden={spellbook.preparedSpellLimitOverride !== null}
					value={displayedPreparedLimit ?? ""}
					oninput={handlePreparedLimitInput}
				/>
			</div>
		</label>
	</div>

	{#if slotProgression.pact}
		<div class="pact-row">
			<div class="pact-info">
				<span class="pact-title">Пакт колдуна</span>
				<span class="pact-level">{slotProgression.pact.slotLevel} круг</span>
			</div>
			<input
				type="number"
				class="slot-override"
				class:overridden={spellbook.pact?.slotCountOverride !== null}
				value={spellbook.pact?.slotCountOverride ?? slotProgression.pact.slotCount}
				oninput={handlePactOverrideInput}
			/>
			<div class="slot-circles">
				{#each getDisplayedPactSlots() as used, index}
					<button
						type="button"
						class="slot-circle"
						class:used
						onclick={() => togglePactSlot(index)}
						aria-label={`Пакт слот ${index + 1}`}
					></button>
				{/each}
			</div>
		</div>
	{/if}

	<div class="spell-levels">
		{#each Object.keys(levelLabels) as levelKey}
			{@const typedLevelKey = levelKey as SpellLevelKey}
			{@const levelState = getLevelState(typedLevelKey)}
			<div class="spell-level-group">
				<div class="spell-level-header">
					<div class="spell-level-title-row">
						<div class="spell-level-title">{levelLabels[typedLevelKey]}</div>
						{#if typedLevelKey !== "0"}
							<input
								type="number"
								class="slot-override"
								class:overridden={levelState.slotCountOverride !== null}
								value={levelState.slotCountOverride ?? (slotProgression.slots[parseInt(typedLevelKey, 10)] ?? 0)}
								oninput={(event) => handleSlotOverrideInput(typedLevelKey, event)}
							/>
						{/if}
					</div>
					<div class="spell-level-actions">
						<IconButton
							icon={Plus}
							hint="Добавить заклинание вручную"
							onClick={() => addManualSpell(typedLevelKey)}
							size={14}
						/>
						<IconButton
							icon={Clipboard}
							hint="Добавить заклинание из буфера"
							onClick={() => addSpellFromClipboard(typedLevelKey)}
							size={14}
						/>
					</div>
				</div>

				{#if typedLevelKey !== "0" && getEffectiveSlotCount(typedLevelKey) > 0}
					<div class="slot-circles">
						{#each getDisplayedSlots(typedLevelKey) as used, index}
							<button
								type="button"
								class="slot-circle"
								class:used
								onclick={() => toggleSlot(typedLevelKey, index)}
								aria-label={`Слот ${typedLevelKey} круга ${index + 1}`}
							></button>
						{/each}
					</div>
				{/if}

				<div class="spells-list">
					{#each levelState.spells as spell}
						<div class="spell-row" class:cantrip-row={typedLevelKey === "0"}>
							{#if typedLevelKey !== "0"}
								<button
									type="button"
									class="prepared-toggle"
									class:active={spell.prepared}
									disabled={!spell.prepared && !canPrepareMoreSpells}
									onclick={() => togglePrepared(typedLevelKey, spell.id)}
									aria-label={`Подготовлено: ${spell.name || "заклинание"}`}
								></button>
							{/if}

							<div class="spell-name-field">
								<AutocompleteInput
									value={spell.name}
									placeholder="Добавить заклинание"
									items={spellAutocompleteItems}
									onchange={(value) => updateSpellName(typedLevelKey, spell.id, value)}
									onSelect={(item) => selectAutocompleteSpell(typedLevelKey, spell.id, item)}
								/>
							</div>

							<div class="spell-actions">
								{#if spell.linkedSpellUrl}
									<IconButton
										icon={Eye}
										hint="Открыть заклинание"
										onClick={() => openSpell(spell)}
										size={14}
									/>
								{/if}
								{#if !spell.linkedSpellUrl && entityLinkService}
									<IconButton
										icon={Link2}
										hint="Связать с заклинанием из базы"
										onClick={() => relinkSpell(typedLevelKey, spell.id)}
										size={14}
									/>
								{/if}
								<IconButton
									icon={Trash2}
									hint="Удалить заклинание"
									onClick={() => removeSpell(typedLevelKey, spell.id)}
									size={14}
								/>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.character-spellbook {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.spellbook-header {
		padding-bottom: 4px;
		border-bottom: 1px solid var(--background-modifier-border);
	}

	.section-title {
		margin: 0;
		font-size: 13px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.spellcasting-summary {
		display: flex;
		flex-wrap: nowrap;
		gap: 8px;
		align-items: end;
	}

	.prepared-counter {
		display: flex;
		align-items: center;
		gap: 3px;
	}

	.prepared-count {
		font-size: 11px;
		font-weight: 700;
		color: var(--text-muted);
		white-space: nowrap;
	}

	.prepared-counter .summary-input {
		width: 4ch;
		min-width: 4ch;
		max-width: 4ch;
		padding-left: 1px;
		padding-right: 1px;
		text-align: center;
	}

	.summary-field {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
		flex: 0 0 auto;
	}

	.summary-field-wide {
		flex: 1 1 auto;
		min-width: 0;
	}

	.summary-label {
		font-size: 11px;
		font-weight: 700;
		color: var(--text-muted);
		text-transform: uppercase;
	}

	.summary-select,
	.summary-input,
	.slot-override {
		height: 28px;
		padding: 4px 6px;
		border-radius: 4px;
		border: 1px solid var(--background-modifier-border);
		background: var(--background-primary);
		color: var(--text-normal);
	}

	.summary-field:not(.summary-field-wide) .summary-input {
		width: 4ch;
		min-width: 4ch;
		max-width: 4ch;
		text-align: center;
	}

	.summary-input.overridden,
	.slot-override.overridden {
		color: var(--text-accent);
		border-color: var(--text-accent);
		background: color-mix(in srgb, var(--text-accent) 10%, var(--background-primary));
	}

	.pact-row,
	.spell-level-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 8px 0;
		border-bottom: 1px solid var(--background-modifier-border);
	}

	.pact-row {
		flex-direction: row;
		align-items: center;
	}

	.pact-info {
		display: flex;
		flex-direction: column;
		min-width: 0;
		margin-right: auto;
	}

	.pact-title,
	.spell-level-title {
		font-size: 12px;
		font-weight: 700;
	}

	.pact-level {
		font-size: 11px;
		color: var(--text-muted);
	}

	.spell-level-header,
	.spell-level-title-row,
	.spell-level-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.spell-level-header {
		justify-content: space-between;
	}

	.spell-level-actions {
		flex-shrink: 0;
	}

	.slot-circle,
	.prepared-toggle {
		border: 1px solid var(--background-modifier-border);
		background: var(--background-primary);
		color: var(--text-normal);
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.slot-circles {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.slot-circle,
	.prepared-toggle {
		width: 16px;
		height: 16px;
		border-radius: 999px;
		padding: 0;
	}

	.prepared-toggle:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.slot-circle.used,
	.prepared-toggle.active {
		background: var(--text-accent);
		border-color: var(--text-accent);
	}

	.spells-list {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.spell-row {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		gap: 3px;
		align-items: center;
		min-height: 18px;
	}

	.spell-row.cantrip-row {
		grid-template-columns: minmax(0, 1fr) auto;
	}

	.spell-name-field {
		min-width: 0;
	}

	.spell-name-field :global(.autocomplete-input) {
		padding: 0 1px;
		line-height: 1;
		font-size: 11px;
		height: 11px;
	}

	.spell-name-field :global(.dropdown-item) {
		padding: 2px 5px;
		font-size: 11px;
	}

	.spell-actions {
		display: flex;
		align-items: center;
		gap: 2px;
	}

	.spell-actions :global(.icon-button) {
		width: 16px;
		height: 16px;
		border-radius: 3px;
	}

	.prepared-toggle {
		width: 14px;
		height: 14px;
	}

	.slot-circle:hover,
	.prepared-toggle:hover {
		border-color: var(--text-accent);
	}

	@media (max-width: 900px) {
		.spellcasting-summary {
			gap: 6px;
		}

		.pact-row {
			flex-wrap: wrap;
		}

		.spell-level-header {
			flex-direction: column;
			align-items: stretch;
		}

		.spell-row {
			grid-template-columns: auto minmax(0, 1fr) auto;
		}

		.spell-row.cantrip-row {
			grid-template-columns: minmax(0, 1fr) auto;
		}
	}
</style>
