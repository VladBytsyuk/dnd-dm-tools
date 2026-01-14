<script lang="ts">
	import { Trash2, Skull, Dices, Heart, Shield, Eye, Users, Meh } from "lucide-svelte";
	import { d20, roll } from "src/domain/dice";
	import { formatModifier } from "src/domain/modifier";
	import type { EncounterParticipant, EncounterParticipantCondition } from "../../../domain/models/encounter/EncounterParticipant";
	import ParticipantConditionsGrid from "./ParticipantConditionsGrid.svelte";

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
		resolveIconSrc
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
		resolveIconSrc: (path: string) => string;
	}>();
	
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

	// --- арифметика в числовых полях ---
	const evalNumericExpression = (exprRaw: string): number | null => {
		const expr = (exprRaw ?? "").trim();
		if (!expr.length) return null;

		if (!/^[0-9+\-*/().\s]+$/.test(expr)) {
			const n = Number(expr);
			return Number.isFinite(n) ? n : null;
		}

		const tokens: string[] = [];
		let i = 0;
		while (i < expr.length) {
			const c = expr[i];
			if (c === " " || c === "\t" || c === "\n") {
				i++;
				continue;
			}
			if (/[0-9.]/.test(c)) {
				let j = i + 1;
				while (j < expr.length && /[0-9.]/.test(expr[j])) j++;
				tokens.push(expr.slice(i, j));
				i = j;
				continue;
			}
			if ("+-*/()".includes(c)) {
				tokens.push(c);
				i++;
				continue;
			}
			return null;
		}

		// unary minus => 0 -
		const fixed: string[] = [];
		for (let k = 0; k < tokens.length; k++) {
			const t = tokens[k];
			if (t === "-" && (k === 0 || tokens[k - 1] === "(" || "+-*/".includes(tokens[k - 1]))) {
				fixed.push("0", "-");
			} else {
				fixed.push(t);
			}
		}

		const prec: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2 };
		const out: string[] = [];
		const ops: string[] = [];

		for (const t of fixed) {
			if (/^[0-9.]+$/.test(t)) {
				out.push(t);
				continue;
			}
			if (t in prec) {
				while (ops.length) {
					const top = ops[ops.length - 1];
					if (top in prec && prec[top] >= prec[t]) out.push(ops.pop()!);
					else break;
				}
				ops.push(t);
				continue;
			}
			if (t === "(") {
				ops.push(t);
				continue;
			}
			if (t === ")") {
				while (ops.length && ops[ops.length - 1] !== "(") out.push(ops.pop()!);
				if (!ops.length) return null;
				ops.pop();
				continue;
			}
			return null;
		}

		while (ops.length) {
			const op = ops.pop()!;
			if (op === "(" || op === ")") return null;
			out.push(op);
		}

		const stack: number[] = [];
		for (const t of out) {
			if (/^[0-9.]+$/.test(t)) {
				const n = Number(t);
				if (!Number.isFinite(n)) return null;
				stack.push(n);
				continue;
			}
			const b = stack.pop();
			const a = stack.pop();
			if (a == null || b == null) return null;

			let r = 0;
			if (t === "+") r = a + b;
			else if (t === "-") r = a - b;
			else if (t === "*") r = a * b;
			else if (t === "/") r = a / b;
			else return null;

			if (!Number.isFinite(r)) return null;
			stack.push(r);
		}
		return stack.length === 1 ? stack[0] : null;
	};

	const applyNumericExpression = (field: keyof EncounterParticipant, raw: string, roundToInt = true) => {
		if (!isEditable) return;
		const v = evalNumericExpression(raw);
		if (v == null) return;
		onSetValue(participant.id, field, roundToInt ? Math.trunc(v) : v);
	};

	const applyClamped = (field: keyof EncounterParticipant, raw: string, min: number, max: number) => {
		if (!isEditable) return;
		const v = evalNumericExpression(raw);
		if (v == null) return;
		onSetValue(participant.id, field, clamp(Math.trunc(v), min, max));
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

		// ✅ NEW: всегда “нормализуем” отображаемое значение в инпуте
		el.value = String(finalHp);

		// обновляем состояние
		onSetValue(participant.id, "isDead", finalDead);
		onSetValue(participant.id, "hpCurrent", finalHp);
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

	const PRESET_COLORS = [
		"#3B82F6", // насыщенный синий
		"#F97316", // оранжевый
		"#EF4444", // красный
		"#FACC15", // жёлтый
		"#FB923C", // тёплый оранжево-жёлтый
		"#A855F7", // фиолетовый
		"#84CC16", // салатовый
		"#22C55E", // зелёный
		"#EC4899", // розовый
		"#22D3EE", // голубой
		"#111827", // почти чёрный
		"#F9FAFB"  // белый
	];

	let isColorPickerOpen = $state(false);

	function getParticipantColor(): string {
		return (participant as any).colorHex ?? "#94a3b8";
	}

	function toggleColorPicker(e: MouseEvent | KeyboardEvent) {
		if (!isEditable) return;
		e.stopPropagation();
		isColorPickerOpen = !isColorPickerOpen;
	}

	function setColor(hex: string) {
		if (!isEditable) return;
		onSetValue(participant.id, "colorHex" as any, hex);
		isColorPickerOpen = false;
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
		onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") toggleColorPicker(e); }}
	>
		{#if isColorPickerOpen}
			<div 
				class="color-popover" 
				role="button"
				tabindex="0"
				aria-label="Цвет участника"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") e.stopPropagation(); }}
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
							onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") setColor(hex) }}
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
        onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onOpenStatblock(participant) } }}
        onclick={() => onOpenStatblock(participant)} 
        aria-label="Открыть существо"
    >
		{#if participant.imageUrl}
			<img
				alt={participant.name}
				src={participant.imageUrl}
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
						onkeydown={doDeathSave}
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
								onclick={() => { if (canMakeDeathSave()) { deathSavesFail = clamp(deathSavesFail + 1, 0, 3) } }}
        						onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { if (canMakeDeathSave()) { deathSavesFail = clamp(deathSavesFail + 1, 0, 3) } } }}
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
								onclick={() => { if (canMakeDeathSave()) { deathSavesSuccess = clamp(deathSavesSuccess + 1, 0, 3) } }}
        						onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { if (canMakeDeathSave()) { deathSavesSuccess = clamp(deathSavesSuccess + 1, 0, 3) } } }}
							></span>
						{/each}
					</div>
				</div>
			{/if}

			{#if isEditable}
				<div class="side" role="group" aria-label="Сторона">
					<div
						class="sideBtn"
						data-kind="pc"
						data-active={(participant.side ?? "neutral") === "pc"}
						aria-label="Союзники"
						onclick={() => onSetValue(participant.id, "side", "pc")}
						onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSetValue(participant.id, "side", "pc") }}
						role="button"
						tabindex="0"
					>
						<Users size={16} />
					</div>

					<div
						class="sideBtn"
						data-kind="neutral"
						data-active={(participant.side ?? "neutral") === "neutral"}
						aria-label="Независимые"
						onclick={() => onSetValue(participant.id, "side", "neutral")}
						onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSetValue(participant.id, "side", "neutral") }}
						role="button"
						tabindex="0"
					>
						<Meh size={16} />
					</div>

					<div
						class="sideBtn"
						data-kind="enemy"
						data-active={(participant.side ?? "neutral") === "enemy"}
						aria-label="Враги"
						onclick={() => onSetValue(participant.id, "side", "enemy")}
						onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSetValue(participant.id, "side", "enemy") }}
						role="button"
						tabindex="0"
					>
						<Skull size={16} />
					</div>
				</div>
			{:else}
				<!-- в readonly можно либо показывать тот же блок без клика, либо просто ничего -->
				<div class="side readonly" aria-label="Сторона">
					<div class="sideBtn" data-kind="pc" data-active={(participant.side ?? "neutral") === "pc"} aria-label="Союзники">
						<Users size={16} />
					</div>
					<div class="sideBtn" data-kind="neutral" data-active={(participant.side ?? "neutral") === "neutral"} aria-label="Независимые">
						<Meh size={16} />
					</div>
					<div class="sideBtn" data-kind="enemy" data-active={(participant.side ?? "neutral") === "enemy"} aria-label="Враги">
						<Skull size={16} />
					</div>
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
					onkeydown={(e) => { if (e.key === "Enter") applyNumericExpression("initiative", (e.target as HTMLInputElement).value) }}
					onblur={(e) => applyNumericExpression("initiative", (e.target as HTMLInputElement).value)}
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
						onkeydown={(e) => {
							if (e.key === "Enter") applyHpCurrentExpression(e.target as HTMLInputElement);
						}}
						onblur={(e) => applyHpCurrentExpression(e.target as HTMLInputElement)}
						readonly={!isEditable}
					/>
					<span class="slash">/</span>
					<input
						class="num inputlike input-centered"
						value={String(participant.hpMax ?? 0)}
						inputmode="numeric"
						aria-label="Максимальные Хиты"
						onkeydown={(e) => {
							if (e.key === "Enter") applyNumericExpression("hpMax", (e.target as HTMLInputElement).value);
						}}
						onblur={(e) => applyNumericExpression("hpMax", (e.target as HTMLInputElement).value)}
						readonly={!isEditable}
					/>
					<span class="slash">+</span>
					<input
						class="num inputlike input-centered temp"
						value={String(participant.hpTemporary ?? 0)}
						inputmode="numeric"
						aria-label="Временные Хиты"
						onkeydown={(e) => {
							if (e.key === "Enter") applyNumericExpression("hpTemporary", (e.target as HTMLInputElement).value);
						}}
						onblur={(e) => applyNumericExpression("hpTemporary", (e.target as HTMLInputElement).value)}
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
					onkeydown={(e) => {
						if (e.key === "Enter") applyNumericExpression("armorClass", (e.target as HTMLInputElement).value);
					}}
					onblur={(e) => applyNumericExpression("armorClass", (e.target as HTMLInputElement).value)}
					readonly={!isEditable}
				/>
			</div>

			<div class="field">
				<div class="field-icon" aria-label="Пассивное Восприятие"><Eye size={16} /></div>
				<input
					class="num inputlike input-centered"
					value={String(participant.passivePerception ?? 10)}
					inputmode="numeric"
					onkeydown={(e) => {
						if (e.key === "Enter") applyNumericExpression("passivePerception", (e.target as HTMLInputElement).value);
					}}
					onblur={(e) => applyNumericExpression("passivePerception", (e.target as HTMLInputElement).value)}
					readonly={!isEditable}
				/>
			</div>
		</div>

		<div class="line3">
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
					onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onToggleDead(participant.id) } }}
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
					onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onRemove(participant.id) } }}
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
    :global(.theme-light) {
        --active-participant-bg: #00000088;
    }

    :global(.theme-dark) {
        --active-participant-bg: #ffffff88;
    }

	.row {
		position: relative;
		display: grid;
		grid-template-columns: 62px 1fr auto;
		gap: 4px;
		align-items: stretch;
		border-top: 1px solid var(--background-modifier-border);
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
		background: color-mix(in srgb, var(--active-participant-bg) 10%, transparent);
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

	.line3 {
		margin-top: 4px;
		margin-bottom: 4px;
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
