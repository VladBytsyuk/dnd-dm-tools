<script lang="ts">
	import { Trash2, Skull, Dices, Heart, Shield, Eye, Users, Meh } from "lucide-svelte";
	import { d20, roll } from "src/domain/dice";
	import { formatModifier } from "src/domain/modifier";
	import { evalNumericExpression } from "src/domain/utils/mathExpression";
	import type { EncounterParticipant, EncounterParticipantCondition } from "../../../domain/models/encounter/EncounterParticipant";
	import ParticipantConditionsGrid from "./ParticipantConditionsGrid.svelte";
	import { onMount } from "svelte";

	let {
		participant,
		isEditable,
		isActive,
		onOpenStatblock,
		onOpenConditionDetails,
		onSetValue,
		onToggleDead,
		onRemove,
		onConditionChange,
		onConditionDelete,
		getRound,
        onImageRequested
	} = $props<{
		participant: EncounterParticipant;
		isEditable: boolean;
		isActive: boolean;

		onOpenStatblock: (p: EncounterParticipant) => void;
		onOpenConditionDetails: (url: string) => void;
		onSetValue: (id: number, field: keyof EncounterParticipant, value: any) => void;
		onToggleDead: (id: number) => void;
		onRemove: (id: number) => void;
		onConditionChange: (participantId: number, condition: EncounterParticipantCondition) => void;
		onConditionDelete: (participantId: number, url: string) => void;
		getRound: () => number;
        onImageRequested: (url: string) => Promise<string>;
	}>();

	let image: string | null = $state(null);

	onMount(async () => {
        if (participant.imageUrl) {
            image = await onImageRequested(participant.imageUrl);
        }
    });
	
	let deathSavesSuccess = $state(0);
	let deathSavesFail = $state(0);

	$effect(() => {
		if (deathSavesFail == 3) {
			onSetValue(participant.id, "isDead", true);
		}
		if (!getIsDown(participant)) {
			deathSavesSuccess = 0;
			deathSavesFail = 0;
		}
	});

	$effect(() => {
		const hpMax = Math.max(0, Number(participant.hpMax ?? 0));
		const hpCurrent = Math.max(0, Number(participant.hpCurrent ?? 0));

		if (hpCurrent > hpMax) {
			onSetValue(participant.id, "hpCurrent", hpMax);
		}
	});


	const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

	const getIsDead = (p: EncounterParticipant) => Boolean(p.isDead);
	const getIsDown = (p: EncounterParticipant) => Number(p.hpCurrent ?? 0) <= 0 && !p.isDead;
	const isActivationKey = (e: KeyboardEvent) => e.key === "Enter" || e.key === " ";

	function onActivation(e: KeyboardEvent, action: () => void) {
		if (isActivationKey(e)) action();
	}

	function getInputValue(e: Event) {
		return (e.target as HTMLInputElement).value;
	}

	const applyNumericExpression = (field: keyof EncounterParticipant, raw: string, roundToInt = true) => {
		if (!isEditable) return;
		const v = evalNumericExpression(raw);
		if (v == null) return;
		onSetValue(participant.id, field, roundToInt ? Math.trunc(v) : v);
	};

	const applyNumericExpressionFromEvent = (field: keyof EncounterParticipant, e: Event, roundToInt = true) => {
		applyNumericExpression(field, getInputValue(e), roundToInt);
	};

	const applyNumericExpressionOnEnter = (field: keyof EncounterParticipant, e: KeyboardEvent, roundToInt = true) => {
		if (e.key === "Enter") applyNumericExpressionFromEvent(field, e, roundToInt);
	};

	const applyHpCurrentExpression = (el: HTMLInputElement) => {
		if (!isEditable) return;

		const raw = (el.value ?? "").trim();
		const v = evalNumericExpression(raw);
		if (v == null) return;

		const hpMax = Math.max(0, Math.trunc(Number(participant.hpMax ?? 0)));
		const n = Math.trunc(v);

		const deathThreshold = hpMax > 0 ? -hpMax : 0;

		let finalHp = 0;
		let finalDead = false;

		if (n <= deathThreshold) {
			finalHp = 0;
			finalDead = true;
		} else if (n <= 0) {
			finalHp = 0;
			finalDead = false; // down
		} else {
			finalDead = false;
			finalHp = hpMax > 0 ? clamp(n, 0, hpMax) : Math.max(0, n);
		}

		el.value = String(finalHp);

		onSetValue(participant.id, "isDead", finalDead);
		onSetValue(participant.id, "hpCurrent", finalHp);
	};

	const applyHpCurrentExpressionFromEvent = (e: Event) => {
		applyHpCurrentExpression(e.target as HTMLInputElement);
	};

	const applyHpCurrentExpressionOnEnter = (e: KeyboardEvent) => {
		if (e.key === "Enter") applyHpCurrentExpressionFromEvent(e);
	};

	const canMakeDeathSave = () => {
		return isEditable && getIsDown(participant) && deathSavesFail < 3 && deathSavesSuccess < 3;
	};

	const doDeathSave = () => {
		if (!isEditable || !canMakeDeathSave()) return;

		const r = roll(d20()(0));

		if (r === 1) deathSavesFail += 2;
		else if (r >= 2 && r <= 9) deathSavesFail += 1;
		else if (r >= 10 && r <= 19) deathSavesSuccess += 1;
		else if (r === 20) deathSavesSuccess += 2;

		deathSavesSuccess = clamp(deathSavesSuccess, 0, 3);
		deathSavesFail = clamp(deathSavesFail, 0, 3);

		// 3 провала => мёртв (это уже состояние участника → родителю)
		if (deathSavesFail >= 3) {
			onSetValue(participant.id, "isDead", true);
			onSetValue(participant.id, "hpCurrent", 0);
		}
	};

	function incrementDeathSaveFail() {
		if (canMakeDeathSave()) {
			deathSavesFail = clamp(deathSavesFail + 1, 0, 3);
		}
	}

	function incrementDeathSaveSuccess() {
		if (canMakeDeathSave()) {
			deathSavesSuccess = clamp(deathSavesSuccess + 1, 0, 3);
		}
	}

	const PRESET_COLORS = [
		"#1A6AFF", // насыщенный синий
		"#FF7433", // оранжевый
		"#FF4D4D", // красный
		"#FFD433", // жёлтый
		"#B07126", // коричневый
		"#884DFF", // фиолетовый
		"#85FF66", // салатовый
		"#519E00", // зелёный
		"#EB8AFF", // розовый
		"#44E0F1", // голубой
		"#222222", // почти чёрный
		"#FFFFFF"  // белый
	];

	const SIDE_OPTIONS = [
		{ kind: "pc", label: "Союзники", icon: Users },
		{ kind: "neutral", label: "Независимые", icon: Meh },
		{ kind: "enemy", label: "Враги", icon: Skull }
	] as const;

	let isColorPickerOpen = $state(false);

	function getParticipantColor(): string {
		return participant.colorHex ?? "#94a3b8";
	}

	function toggleColorPicker(e: MouseEvent | KeyboardEvent) {
		if (!isEditable) return;
		e.stopPropagation();
		isColorPickerOpen = !isColorPickerOpen;
	}

	function setColor(hex: string) {
		if (!isEditable) return;
		onSetValue(participant.id, "colorHex", hex);
		isColorPickerOpen = false;
	}

	function setSide(side: EncounterParticipant["side"]) {
		if (!isEditable) return;
		onSetValue(participant.id, "side", side);
	}

	$effect(() => {
		if (!isColorPickerOpen) return;

		const onDoc = () => (isColorPickerOpen = false);
		document.addEventListener("click", onDoc, true);

		return () => document.removeEventListener("click", onDoc, true);
	});

</script>

<article
	class="row"
	data-active={isActive}
	data-side={participant.side ?? "neutral"}
	data-down={getIsDown(participant)}
	data-dead={getIsDead(participant)}
>
	<div
		class="row-accent"
		style="background: {getParticipantColor()};"
		role="button"
		tabindex="0"
		aria-label="Цвет участника"
		onclick={toggleColorPicker}
		onkeydown={(e) => onActivation(e, () => toggleColorPicker(e))}
	>
		{#if isColorPickerOpen}
			<div 
				class="color-popover" 
				role="button"
				tabindex="0"
				aria-label="Цвет участника"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => onActivation(e, () => e.stopPropagation())}
			>
				<div class="color-grid">
					{#each PRESET_COLORS as hex}
						<div
							class="color-swatch"
							style="background:{hex};"
							aria-label={"Выбрать цвет " + hex}
							role="button"
							tabindex="0"
							onclick={() => setColor(hex)}
							onkeydown={(e) => onActivation(e, () => setColor(hex))}
						></div>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<div 
        class="statbtn" 
        role="button"
        tabindex="0"
        onkeydown={(e) => onActivation(e, () => onOpenStatblock(participant))}
        onclick={() => onOpenStatblock(participant)} 
        aria-label="Открыть существо"
    >
		{#if participant.imageUrl}
			<img
				alt={participant.name}
				src={image}
				onerror={(e: Event) => { if (e.target instanceof HTMLImageElement) e.target.src = "https://ttg.club/img/no-img.webp" }}
			/>
		{:else}
			<div class="portrait-fallback">
				<Skull size={48} />
			</div>
		{/if}
	</div>

	<div class="main">
		<div class="line1">
			{#if isEditable}
				<input
					class="name inputlike"
					value={participant.name}
					oninput={(e) => onSetValue(participant.id, "name", (e.target as HTMLInputElement).value)}
				/>
			{:else}
				<div class="name">{participant.name}</div>
			{/if}

			{#if getIsDown(participant)}
				<div class="death">
					<div 
						class="death-roll" 
						onclick={doDeathSave} 
						onkeydown={(e) => onActivation(e, doDeathSave)}
						role="button"
						tabindex="0"
						aria-label="Спасбросок на смерть"
					>
						<Dices size={16} />
					</div>

					<div class="death-pips">
						{#each [0, 1, 2] as i}
							<span
								class="pip fail"
								class:on={deathSavesFail > i}
								aria-label="Провал"
								role="button"
								tabindex="0"
								onclick={incrementDeathSaveFail}
        						onkeydown={(e) => onActivation(e, incrementDeathSaveFail)}
							></span>
						{/each}

						<span class="dash">—</span>

						{#each [0, 1, 2] as i}
							<span
								class="pip success"
								class:on={deathSavesSuccess > i}
								aria-label="Успех"
								role="button"
								tabindex="0"
								onclick={incrementDeathSaveSuccess}
        						onkeydown={(e) => onActivation(e, incrementDeathSaveSuccess)}
							></span>
						{/each}
					</div>
				</div>
			{/if}

			{#if isEditable}
				<div class="side" role="group" aria-label="Сторона">
					{#each SIDE_OPTIONS as side}
						{@const SideIcon = side.icon}
						<div
							class="sideBtn"
							data-kind={side.kind}
							data-active={(participant.side ?? "neutral") === side.kind}
							aria-label={side.label}
							onclick={() => setSide(side.kind)}
							onkeydown={(e) => onActivation(e, () => setSide(side.kind))}
							role="button"
							tabindex="0"
						>
							<SideIcon size={16} />
						</div>
					{/each}
				</div>
			{:else}
				<div class="side readonly" aria-label="Сторона">
					{#each SIDE_OPTIONS as side}
						{@const SideIcon = side.icon}
						<div
							class="sideBtn"
							data-kind={side.kind}
							data-active={(participant.side ?? "neutral") === side.kind}
							aria-label={side.label}
						>
							<SideIcon size={16} />
						</div>
					{/each}
				</div>
			{/if}

		</div>

		<div class="line2">
			<div class="field">
				<div class="field-icon" aria-label="Инициатива"><Dices size={16} /></div>
				<input
					class="num inputlike input-centered"
					value={String(participant.initiative ?? 0)}
					inputmode="numeric"
					placeholder={formatModifier(participant.initiativeModifier)}
					onkeydown={(e) => applyNumericExpressionOnEnter("initiative", e)}
					onblur={(e) => applyNumericExpressionFromEvent("initiative", e)}
					readonly={!isEditable}
				/>
			</div>

			<div class="field hp">
                <div class="field-icon" aria-label="Хиты"><Heart size={16} /></div>
				<div class="hpwrap">
					<input
						class="num inputlike input-centered"
						value={String(participant.hpCurrent ?? 0)}
						inputmode="numeric"
						aria-label="Текущие Хиты"
						onkeydown={applyHpCurrentExpressionOnEnter}
						onblur={applyHpCurrentExpressionFromEvent}
						readonly={!isEditable}
					/>
					<span class="slash">/</span>
					<input
						class="num inputlike input-centered"
						value={String(participant.hpMax ?? 0)}
						inputmode="numeric"
						aria-label="Максимальные Хиты"
						onkeydown={(e) => applyNumericExpressionOnEnter("hpMax", e)}
						onblur={(e) => applyNumericExpressionFromEvent("hpMax", e)}
						readonly={!isEditable}
					/>
					<span class="slash">+</span>
					<input
						class="num inputlike input-centered temp"
						value={String(participant.hpTemporary ?? 0)}
						inputmode="numeric"
						aria-label="Временные Хиты"
						onkeydown={(e) => applyNumericExpressionOnEnter("hpTemporary", e)}
						onblur={(e) => applyNumericExpressionFromEvent("hpTemporary", e)}
						readonly={!isEditable}
					/>
				</div>
			</div>

			<div class="field">
				<div class="field-icon" aria-label="КД"><Shield size={16} /></div>
				<input
					class="num inputlike input-centered"
					value={String(participant.armorClass ?? 10)}
					inputmode="numeric"
					onkeydown={(e) => applyNumericExpressionOnEnter("armorClass", e)}
					onblur={(e) => applyNumericExpressionFromEvent("armorClass", e)}
					readonly={!isEditable}
				/>
			</div>

			<div class="field">
				<div class="field-icon" aria-label="Пассивное Восприятие"><Eye size={16} /></div>
				<input
					class="num inputlike input-centered"
					value={String(participant.passivePerception ?? 10)}
					inputmode="numeric"
					onkeydown={(e) => applyNumericExpressionOnEnter("passivePerception", e)}
					onblur={(e) => applyNumericExpressionFromEvent("passivePerception", e)}
					readonly={!isEditable}
				/>
			</div>

			<ParticipantConditionsGrid
				isEditable={isEditable}
				onOpenConditionDetails={(url: string) => onOpenConditionDetails(url)}
				onChange={(condition: EncounterParticipantCondition) => onConditionChange(participant.id, condition)}
				onDelete={(url: string) => onConditionDelete(participant.id, url)}
				getRound={getRound}
				getConditions={() => participant.conditions ?? []}
				/>
		</div>
	</div>

	<div class="right">
		{#if isEditable}
			<div class="right-buttons">
				<div 
					class="btn ghost danger"
					onclick={() => onToggleDead(participant.id)}
					onkeydown={(e) => onActivation(e, () => onToggleDead(participant.id))}
					aria-label="Смерть"
					role="button"
					tabindex="0"
				>
					<span class="deadDot"><Skull size={16} color="var(--text-error)"/></span>
				</div>
				<div
					class="btn ghost danger" 
					onclick={() => onRemove(participant.id)} 
					aria-label="Удалить"
					onkeydown={(e) => onActivation(e, () => onRemove(participant.id))}
					role="button"
					tabindex="0"
				>
					<Trash2 size={16} />
				</div>
			</div>
		{/if}
	</div>
</article>

<style>
	.row {
		--active-participant-bg: #3b82f6;

		position: relative;
		display: grid;
		grid-template-columns: 62px 1fr auto;
		gap: 4px;
		align-items: stretch;
		border-top: 1px solid var(--background-modifier-border);
	}

	.row[data-side="pc"] {
		--active-participant-bg: #22c55e;
	}

	.row[data-side="enemy"] {
		--active-participant-bg: #ef4444;
	}

	.row[data-side="neutral"] {
		--active-participant-bg: #3b82f6;
	}

	.row:first-child {
		border-top: none;
	}

	.row-accent {
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 4px;
		background: var(--text-muted);
	}

	.row[data-active="true"] {
		background: color-mix(in srgb, var(--active-participant-bg) 26%, transparent);
	}

	.row[data-down="true"] {
		opacity: 0.55;
	}

	.row[data-dead="true"] {
		opacity: 1;
		background: color-mix(in srgb, var(--text-error) 18%, transparent);
	}

	.statbtn {
		width: 64px;
		overflow: hidden;
		border: 1px solid var(--background-modifier-border);
		background: var(--background-primary);
		cursor: pointer;
		padding: 0;
		display: grid;
		place-items: center;
	}

	.statbtn img {
		width: 100%;
		object-fit: cover;
		display: block;
	}

	.portrait-fallback {
		opacity: 0.8;
	}

	.main {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.line1 {
		display: grid;
		grid-template-columns: minmax(120px, 1fr) auto auto;
		gap: 4px;
		align-items: center;
		min-width: 0;
	}

	.name {
		min-width: 0;
		font-weight: 800;
		font-size: 14px;
        line-height: 14px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.side {
		display: inline-flex;
		align-items: center;
		gap: 0px;
		height: 30px;
	}

	.sideBtn {
		display: inline-grid;
		place-items: center;
		width: 20px;
		height: 30px;

		border: 1px solid transparent;
		border-radius: 8px;
		background: transparent;

		color: rgba(255, 255, 255, 0.85); /* “белая” иконка */
		cursor: pointer;
		padding: 0;
	}

	.side.readonly .sideBtn {
		cursor: default;
	}

	.sideBtn:hover {
		background: var(--background-modifier-hover);
	}

	/* выбранная сторона — подсветка цветом */
	.sideBtn[data-active="true"][data-kind="pc"] {
		color: #22c55e;
	}

	.sideBtn[data-active="true"][data-kind="enemy"] {
		color: #ef4444;
	}

	.sideBtn[data-active="true"][data-kind="neutral"] {
		color: #3b82f6;
	}

	/* доп. доступность */
	.sideBtn:focus-visible {
		outline: 2px solid var(--interactive-accent);
		outline-offset: 2px;
	}

	.line2 {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		align-items: center;
        align-content: center;
	}

	.field {
		display: flex;
		align-items: center;
        align-content: center;
		border-radius: 8px;
        padding: 0px 0px 0px 4px;
		background: var(--background-primary);
		border: 1px solid var(--background-modifier-border);
	}

    .field-icon {
        display: flex;
        align-items: center;
        align-content: center;
    }

	.hpwrap {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}

	.slash {
		opacity: 0.6;
		font-weight: 700;
	}

	.inputlike {
		border: 1px solid transparent;
		background: transparent;
		color: var(--text-normal);
		border-radius: 8px;
		padding: 2px 4px;
		line-height: 18px;
	}

    .input-centered{
        text-align: center;
    }

	.inputlike:focus {
		outline: none;
		border-color: var(--interactive-accent);
		background: var(--background-secondary);
	}

	.num {
		width: 36px;
		font-variant-numeric: tabular-nums;
		text-align: right;
	}

    .inputlike.num,
    .num.inputlike {
        text-align: center;
    }

	.right {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 2px 0;
	}

	.btn {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 2px;
		border-radius: 10px;
		background: var(--interactive-normal);
		color: var(--text-on-accent);
		cursor: pointer;
		user-select: none;
	}

	.btn.ghost {
		background: transparent;
		color: var(--text-normal);
	}

	.btn.danger {
		color: var(--text-error);
		border-color: var(--background-modifier-error);
	}

	.deadDot {
		display: inline-block;
	}

	.death {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		border-radius: 10px;
		border: 1px solid var(--background-modifier-border);
		background: var(--background-primary);
		justify-self: end; /* прижимаем вправо внутри grid */
		margin-left: auto;
	}

	.death-roll {
		display: inline-grid;
		place-items: center;
		width: 28px;
		height: 28px;
		border-radius: 10px;
		background: var(--background-primary);
		cursor: pointer;
		color: var(--text-normal);
	}
	
	.death-pips {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 4px 8px;
		border-radius: 999px;
	}

	.pip {
		width: 10px;
		height: 10px;
		border-radius: 999px;
		border: 1px solid var(--background-modifier-border);
		background: transparent;
		opacity: 0.85;
	}

	.pip.fail {
		border-color: var(--text-error);
	}

	.pip.success {
		border-color: var(--text-success);
	}

	.pip.on.fail {
		background: var(--text-error);
		opacity: 1;
	}

	.pip.on.success {
		background: var(--text-success);
		opacity: 1;
	}

	.dash {
		opacity: 0.6;
		font-weight: 700;
		margin: 0 2px;
	}

	.right-buttons {
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		align-content: center;
		justify-content: space-between;
		gap: 4px;
	}

	.row-accent {
		cursor: pointer;
	}

	.color-popover {
		position: absolute;
		left: 6px;
		top: 6px;
		z-index: 2000;

		background: var(--background-primary);
		border: 1px solid var(--background-modifier-border);
		border-radius: 10px;
		padding: 8px;
		box-shadow: 0 6px 20px rgba(0,0,0,.25);
	}

	.color-grid {
		display: grid;
		grid-template-columns: repeat(6, 18px);
		gap: 8px;
	}

	.color-swatch {
		width: 18px;
		height: 18px;
		border-radius: 999px;
		border: 1px solid var(--background-modifier-border);
		padding: 0;
		cursor: pointer;
	}

	.color-swatch:focus-visible {
		outline: 2px solid var(--interactive-accent);
		outline-offset: 2px;
	}


	@media (max-width: 900px) {
		.line1 {
			grid-template-columns: 1fr;
		}
		.num {
			width: 48px;
		}
	}
</style>
