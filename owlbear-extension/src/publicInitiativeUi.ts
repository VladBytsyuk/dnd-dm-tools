import type { PublicInitiativeState, PublicInitiativeStatus } from "./types";

const STATUS_LABELS: Record<PublicInitiativeStatus["kind"], string> = {
	bloodied: "Меньше половины хитов",
	concentration: "Концентрация",
	condition: "Состояние",
	down: "0 хитов",
	dead: "Смерть",
};

export function renderPublicInitiative(container: HTMLElement, state: PublicInitiativeState | null): void {
	container.replaceChildren();
	if (!state) {
		const empty = document.createElement("p");
		empty.className = "initiative-empty";
		empty.textContent = "Инициатива ещё не опубликована";
		container.append(empty);
		return;
	}

	const heading = document.createElement("header");
	heading.className = "initiative-heading";
	const title = document.createElement("span");
	title.textContent = "Инициатива";
	const round = document.createElement("span");
	round.className = "initiative-round";
	round.textContent = `Раунд ${state.round}`;
	heading.append(title, round);
	container.append(heading);

	const list = document.createElement("ol");
	list.className = "initiative-list";
	for (const participant of state.participants) list.append(renderParticipant(participant));
	container.append(list);
}

function renderParticipant(participant: PublicInitiativeState["participants"][number]): HTMLLIElement {
	const row = document.createElement("li");
	row.className = "initiative-participant";
	row.dataset.active = String(participant.isActive);
	row.dataset.down = String(participant.statuses.some((status) => status.kind === "down"));
	row.dataset.dead = String(participant.statuses.some((status) => status.kind === "dead"));
	row.style.setProperty("--participant-color", participant.color);

	const portrait = document.createElement("div");
	portrait.className = "initiative-portrait";
	if (participant.portraitUrl) {
		const image = document.createElement("img");
		image.src = participant.portraitUrl;
		image.alt = participant.name;
		image.addEventListener("error", () => {
			image.replaceWith(createPortraitFallback(participant.name));
		});
		portrait.append(image);
	} else {
		portrait.append(createPortraitFallback(participant.name));
	}

	const content = document.createElement("div");
	content.className = "initiative-participant-content";
	const line = document.createElement("div");
	line.className = "initiative-name-line";
	const name = document.createElement("span");
	name.className = "initiative-name";
	name.textContent = participant.name;
	const initiative = document.createElement("span");
	initiative.className = "initiative-score";
	initiative.setAttribute("aria-label", `Инициатива: ${participant.initiative}`);
	initiative.textContent = String(participant.initiative);
	line.append(name, initiative);
	content.append(line);

	if (participant.statuses.length > 0) {
		const statuses = document.createElement("div");
		statuses.className = "initiative-statuses";
		for (const status of participant.statuses) statuses.append(renderStatus(status));
		content.append(statuses);
	}
	row.append(portrait, content);
	return row;
}

function renderStatus(status: PublicInitiativeStatus): HTMLElement {
	const item = document.createElement("span");
	item.className = "initiative-status";
	item.title = STATUS_LABELS[status.kind];
	item.setAttribute("aria-label", STATUS_LABELS[status.kind]);
	const icon = document.createElement("img");
	icon.src = `./status-icons/${status.icon}.svg`;
	icon.alt = "";
	item.append(icon);
	if (status.remainingRounds !== undefined) {
		const rounds = document.createElement("span");
		rounds.className = "initiative-status-rounds";
		rounds.textContent = String(status.remainingRounds);
		item.append(rounds);
	}
	return item;
}

function createPortraitFallback(name: string): HTMLSpanElement {
	const fallback = document.createElement("span");
	fallback.className = "initiative-portrait-fallback";
	fallback.textContent = initials(name);
	return fallback;
}

function initials(name: string): string {
	const initials = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("");
	return initials.toLocaleUpperCase() || "?";
}
