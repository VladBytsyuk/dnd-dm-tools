<script lang="ts">
	import type { ClassEntry } from '../../../../domain/models/character/ClassEntry';
	import type { EntityLinkResult } from '../../../../domain/services/EntityLinkService';
	import type { App } from 'obsidian';
	import AlignmentPicker from './AlignmentPicker.svelte';
	import LinkedInput from './LinkedInput.svelte';
	import MulticlassInput from './MulticlassInput.svelte';

	interface Props {
		name: { value: string };
		info: {
			classes: ClassEntry[];
			level: number;
			race: string;
			background?: string;
			playerName?: string;
			alignment?: string;
			experience?: number;
		};
		avatar?: {
			jpeg?: string;
			webp?: string;
		};

		// Event handlers
		onNameChange?: (name: string) => void;
		onClassesChange?: (classes: ClassEntry[]) => void;
		onRaceChange?: (race: string) => void;
		onBackgroundChange?: (background: string) => void;
		onPlayerNameChange?: (playerName: string) => void;
		onAlignmentChange?: (alignment: string) => void;
		onExperienceAdd?: (additionalXp: number) => void;

		// Database lookup services
		onLookupRace?: (race: string) => Promise<EntityLinkResult>;
		onLookupClass?: (className: string) => Promise<EntityLinkResult>;
		onLookupBackground?: (bg: string) => Promise<EntityLinkResult>;

		// App instance for modals
		app?: App;
	}

	let {
		name,
		info,
		avatar,
		onNameChange,
		onClassesChange,
		onRaceChange,
		onBackgroundChange,
		onPlayerNameChange,
		onAlignmentChange,
		onExperienceAdd,
		onLookupRace,
		onLookupClass,
		onLookupBackground,
		app
	}: Props = $props();

	const avatarUrl = $derived(avatar?.webp || avatar?.jpeg || '');

	// XP popup state
	let showXpPopup = $state(false);
	let xpToAdd = $state('');
	let xpPopupRef: HTMLDivElement | undefined = $state();
	let xpButtonRef: HTMLButtonElement | undefined = $state();

	function handleNameInput(event: Event) {
		const newName = (event.target as HTMLInputElement).value;
		onNameChange?.(newName);
	}

	function toggleXpPopup(event: MouseEvent) {
		event.stopPropagation();
		showXpPopup = !showXpPopup;
		if (showXpPopup) {
			xpToAdd = '';
			// Focus input after popup opens
			setTimeout(() => {
				const input = xpPopupRef?.querySelector('input');
				input?.focus();
			}, 10);
		}
	}

	function handleXpAdd() {
		const amount = parseInt(xpToAdd) || 0;
		if (amount !== 0 && onExperienceAdd) {
			onExperienceAdd(amount);
		}
		showXpPopup = false;
		xpToAdd = '';
	}

	function handleXpKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleXpAdd();
		} else if (event.key === 'Escape') {
			showXpPopup = false;
			xpToAdd = '';
		}
	}

	// Close popup when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as Node;
		if (showXpPopup &&
			xpPopupRef &&
			!xpPopupRef.contains(target) &&
			xpButtonRef &&
			!xpButtonRef.contains(target)) {
			showXpPopup = false;
			xpToAdd = '';
		}
	}

	// Format experience for display
	const experienceDisplay = $derived((info.experience || 0).toLocaleString('ru-RU'));
</script>

<svelte:window onclick={handleClickOutside} />

<div class="character-header">
	<div class="header-content">
		{#if avatarUrl}
			<div class="avatar-container">
				<img src={avatarUrl} alt={name.value} class="avatar-image" />
			</div>
		{/if}
		<div class="header-info">
			<!-- Name and Level on one line -->
			<div class="name-level-row">
				<input
					type="text"
					value={name.value}
					oninput={handleNameInput}
					class="character-name-input seamless-input"
					placeholder="Имя персонажа"
				/>
				<div class="level-badge">Ур. {info.level}</div>
			</div>

			<!-- Race and Background on one line -->
			<div class="race-background-row">
				<LinkedInput
					value={info.race}
					placeholder="Раса"
					onchange={onRaceChange}
					onLookup={onLookupRace}
				/>
				<span class="separator">•</span>
				<LinkedInput
					value={info.background || ''}
					placeholder="Предыстория"
					onchange={onBackgroundChange}
					onLookup={onLookupBackground}
				/>
			</div>

			<!-- Classes (multiclass support) -->
			<div class="classes-section">
				<MulticlassInput
					classes={info.classes}
					onchange={onClassesChange}
					onLookupClass={onLookupClass}
				/>
			</div>

			<!-- Bottom row: Alignment, Player, XP -->
			<div class="bottom-row">
				<div class="bottom-item">
					<span class="label">Мировоззрение:</span>
					<AlignmentPicker
						value={info.alignment || 'true-neutral'}
						onchange={onAlignmentChange}
					/>
				</div>
				<div class="bottom-item">
					<span class="label">Игрок:</span>
					<input
						type="text"
						value={info.playerName || ''}
						oninput={(e) => onPlayerNameChange?.(e.currentTarget.value)}
						class="text-input seamless-input"
						placeholder="—"
					/>
				</div>
				<div class="bottom-item">
					<span class="label">Опыт:</span>
					<div class="xp-container">
						<span class="xp-value">{experienceDisplay}</span>
						{#if onExperienceAdd}
							<div class="xp-add-wrapper">
								<button
									bind:this={xpButtonRef}
									class="xp-add-btn"
									onclick={toggleXpPopup}
									title="Добавить опыт"
									type="button"
								>+</button>
								{#if showXpPopup}
									<div class="xp-popup" bind:this={xpPopupRef}>
										<input
											type="number"
											bind:value={xpToAdd}
											onkeydown={handleXpKeydown}
											placeholder="0"
											class="xp-popup-input"
										/>
										<button
											class="xp-popup-btn xp-popup-btn-confirm"
											onclick={handleXpAdd}
											type="button"
										>✓</button>
										<button
											class="xp-popup-btn xp-popup-btn-cancel"
											onclick={() => { showXpPopup = false; xpToAdd = ''; }}
											type="button"
										>✕</button>
									</div>
								{/if}
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.character-header {
		padding: 8px;
		background: linear-gradient(135deg, var(--background-secondary) 0%, var(--background-primary) 100%);
		border: 2px solid var(--background-modifier-border);
		border-radius: 6px;
		margin-bottom: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.header-content {
		display: flex;
		align-items: flex-start;
		gap: 10px;
	}

	.avatar-container {
		flex-shrink: 0;
	}

	.avatar-image {
		width: 70px;
		height: 70px;
		border-radius: 50%;
		object-fit: cover;
		border: 2px solid var(--text-accent);
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
	}

	.header-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	/* Name and Level Row */
	.name-level-row {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 0;
	}

	.character-name-input {
		flex: 1;
		font-size: 18px;
		font-weight: 700;
		color: var(--text-normal);
		min-width: 0;
	}

	.level-badge {
		padding: 1px 8px;
		font-size: 13px;
		font-weight: 700;
		color: var(--text-accent);
		background-color: var(--background-primary-alt);
		border: 1px solid var(--background-modifier-border);
		border-radius: 10px;
		white-space: nowrap;
	}

	/* Race and Background Row */
	.race-background-row {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		margin-bottom: 2px;
	}

	.race-background-row :global(.linked-input-container) {
		flex: 1;
	}

	.separator {
		color: var(--text-muted);
		opacity: 0.5;
		user-select: none;
	}

	/* Classes Section */
	.classes-section {
		margin: 2px 0;
	}

	/* Bottom Row */
	.bottom-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		font-size: 11px;
		color: var(--text-muted);
		margin-top: 2px;
	}

	.bottom-item {
		display: flex;
		align-items: center;
		gap: 4px;
		flex: 1;
	}

	.bottom-item:first-child {
		justify-content: flex-start;
	}

	.bottom-item:nth-child(2) {
		justify-content: center;
	}

	.bottom-item:last-child {
		justify-content: flex-end;
	}

	.label {
		font-weight: 600;
		white-space: nowrap;
	}

	.xp-container {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.xp-value {
		color: var(--text-normal);
		font-weight: 600;
	}

	.xp-add-wrapper {
		position: relative;
	}

	.xp-add-btn {
		width: 20px;
		height: 20px;
		padding: 0;
		border: 1px solid var(--background-modifier-border);
		border-radius: 3px;
		background-color: var(--background-primary);
		color: var(--text-muted);
		font-size: 14px;
		font-weight: 700;
		line-height: 1;
		cursor: pointer;
		transition: all 0.2s;
		flex-shrink: 0;
	}

	.xp-add-btn:hover {
		background-color: var(--background-primary-alt);
		color: var(--text-normal);
		border-color: var(--text-accent);
		transform: scale(1.1);
	}

	.xp-popup {
		position: absolute;
		top: 24px;
		right: 0;
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 6px;
		background-color: var(--background-primary);
		border: 1px solid var(--background-modifier-border);
		border-radius: 4px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		z-index: 100;
		min-width: 120px;
	}

	.xp-popup-input {
		flex: 1;
		padding: 3px 6px;
		font-size: 11px;
		border: 1px solid var(--background-modifier-border);
		border-radius: 2px;
		background-color: var(--background-primary-alt);
		color: var(--text-normal);
		min-width: 60px;
	}

	.xp-popup-input:focus {
		outline: none;
		border-color: var(--text-accent);
	}

	.xp-popup-btn {
		width: 22px;
		height: 22px;
		padding: 0;
		border: 1px solid var(--background-modifier-border);
		border-radius: 2px;
		font-size: 12px;
		line-height: 1;
		cursor: pointer;
		transition: all 0.2s;
		flex-shrink: 0;
	}

	.xp-popup-btn-confirm {
		background-color: var(--interactive-accent);
		color: var(--text-on-accent);
	}

	.xp-popup-btn-confirm:hover {
		background-color: var(--interactive-accent-hover);
	}

	.xp-popup-btn-cancel {
		background-color: var(--background-primary);
		color: var(--text-muted);
	}

	.xp-popup-btn-cancel:hover {
		background-color: var(--background-modifier-error);
		color: var(--text-error);
	}

	/* Seamless Input Styling - looks like regular text when not focused */
	.seamless-input {
		padding: 0px 2px;
		border: 1px solid transparent;
		border-radius: 2px;
		background-color: transparent;
		color: var(--text-normal);
		transition: all 0.2s;
		line-height: 1.3;
	}

	.seamless-input::placeholder {
		color: var(--text-faint);
		opacity: 0.5;
	}

	.seamless-input:hover {
		background-color: var(--background-primary-alt);
		border-color: var(--background-modifier-border);
	}

	.seamless-input:focus {
		outline: none;
		background-color: var(--background-primary);
		border-color: var(--text-accent);
		box-shadow: 0 0 0 1px var(--background-modifier-border-focus);
	}

	.text-input {
		font-size: 11px;
		min-width: 60px;
	}

	/* Alignment Picker Styling */
	.bottom-item :global(.alignment-picker) {
		font-size: 10px;
		padding: 0px 2px;
		border: 1px solid transparent;
		background-color: transparent;
		color: var(--text-normal);
		line-height: 1.3;
		min-width: 150px;
	}

	.bottom-item :global(.alignment-picker:hover) {
		background-color: var(--background-primary-alt);
		border-color: var(--background-modifier-border);
	}

	.bottom-item :global(.alignment-picker:focus) {
		background-color: var(--background-primary);
		border-color: var(--text-accent);
	}

	@media (max-width: 768px) {
		.header-content {
			flex-direction: column;
			align-items: center;
		}

		.name-level-row {
			flex-direction: column;
			align-items: flex-start;
			gap: 4px;
		}

		.race-background-row {
			flex-direction: column;
			align-items: flex-start;
			gap: 4px;
		}

		.separator {
			display: none;
		}

		.bottom-row {
			flex-direction: column;
			align-items: flex-start;
			gap: 8px;
		}

		.character-name-input {
			font-size: 18px;
		}
	}
</style>
