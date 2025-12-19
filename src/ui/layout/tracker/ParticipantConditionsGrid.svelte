<script lang="ts">

	export type ConditionDef = {
		url: string;
		title: string; // название для tooltip
		iconSrc: string; // путь к svg в исходниках проекта
	};

	// дефолтный набор (15)
	const conditions: ConditionDef[] = [
		{ url: "/screens/unconscious", title: "Бессознательный / Unconscious", iconSrc: "src/assets/icons/conditions/unconscious.svg" },
		{ url: "/screens/frightened", title: "Испуганный / Frightened", iconSrc: "src/assets/icons/conditions/frightened.svg" },
		{ url: "/screens/exhaustion", title: "Истощенный / Exhaustion", iconSrc: "src/assets/icons/conditions/exhaustion.svg" },

		{ url: "/screens/invisible", title: "Невидимый / Invisible", iconSrc: "src/assets/icons/conditions/invisible.svg" },
		{ url: "/screens/incapacitated", title: "Недееспособный / Incapacitated", iconSrc: "src/assets/icons/conditions/incapacitated.svg" },
		{ url: "/screens/deafened", title: "Оглохший / Deafened", iconSrc: "src/assets/icons/conditions/deafened.svg" },

		{ url: "/screens/petrified", title: "Окаменевший / Petrified", iconSrc: "src/assets/icons/conditions/petrified.svg" },
		{ url: "/screens/restrained", title: "Опутанный / Restrained", iconSrc: "src/assets/icons/conditions/restrained.svg" },
		{ url: "/screens/blinded", title: "Ослеплённый / Blinded", iconSrc: "src/assets/icons/conditions/blinded.svg" },

		{ url: "/screens/poisoned", title: "Отравленный / Poisoned", iconSrc: "src/assets/icons/conditions/poisoned.svg" },
		{ url: "/screens/charmed", title: "Очарованный / Charmed", iconSrc: "src/assets/icons/conditions/charmed.svg" },
		{ url: "/screens/stunned", title: "Ошеломлённый / Stunned", iconSrc: "src/assets/icons/conditions/stunned.svg" },

		{ url: "/screens/paralyzed", title: "Парализованный / Paralyzed", iconSrc: "src/assets/icons/conditions/paralyzed.svg" },
		{ url: "/screens/condition_prone", title: "Сбитый с ног / Prone", iconSrc: "src/assets/icons/conditions/prone.svg" },
		{ url: "/screens/grappled", title: "Схваченный / Grappled", iconSrc: "src/assets/icons/conditions/grappled.svg" }
	];

	let {
		active = new Set<string>(),
		onOpen,
		onChange,
		resolveIconSrc	
	} = $props<{
		active?: Set<string>;
		onOpen: (url: string) => void;
		onChange: (nextActive: Set<string>) => void;
		resolveIconSrc: (path: string) => string;
	}>();

	const toggle = (c: ConditionDef) => {
		const next = new Set(active);
		if (next.has(c.url)) next.delete(c.url);
		else next.add(c.url);

		onChange(next);
		onOpen(c.url);
	};
</script>

<div class="grid" role="group">
	{#each conditions as c (c.url)}
		<div
			class="cell"
			data-active={active.has(c.url)}
			aria-pressed={active.has(c.url)}
            aria-label={c.title}
            role="button"
            tabindex="0"
			onclick={() => toggle(c)}
            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { toggle(c) } }}
		>
			<img class="icon" src={resolveIconSrc(c.iconSrc)} alt={c.title} />
        </div>
	{/each}
</div>

<style>
	/* Вписывается по высоте в правый блок строки: родитель просто задаёт высоту контейнера */
	.grid {
		height: 100%;
		width: 100%;
		display: grid;
		grid-template-columns: repeat(15, 1fr);
		grid-template-rows: repeat(1, 1fr);
		gap: 2px;
		align-content: stretch;
	}

	.cell {
		position: relative;
		display: grid;
		place-items: center;
		border-radius: 10px;
		padding: 0;
		cursor: pointer;
		min-width: 0;
		min-height: 0;
	}

	/* Иконки белые по умолчанию: предполагается, что svg монохромные.
	   Если svg “чёрные”, то можно сделать их белыми через filter — оставил мягкий вариант. */
	.icon {
		width: 24px;
		height: 24px;
		opacity: 0.9;
		filter: brightness(10) saturate(0); /* делает почти белой */
		pointer-events: none;
	}

	/* Активное состояние */
	.cell[data-active="true"] {
		border-color: color-mix(in srgb, var(--interactive-accent) 55%, var(--background-modifier-border));
		background: color-mix(in srgb, var(--interactive-accent) 100%, var(--background-primary));
	}

	.cell[data-active="true"] .icon {
		filter: none;
		opacity: 1;
		/* акцент через tint: лучше всего, если иконки сделаны в 1 цвет (currentColor).
		   Но с <img> так нельзя — поэтому используем “подсветку” фоном + снятие фильтра. */
	}

	.cell:focus-visible {
		outline: 2px solid var(--interactive-accent);
		outline-offset: 2px;
	}
</style>
