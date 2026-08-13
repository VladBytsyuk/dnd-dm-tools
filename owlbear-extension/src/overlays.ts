import type { OwlbearParticipantSnapshot, TokenMarker } from "./types";

const CONDITION_ICONS: Record<string, string> = {
	"/screens/unconscious": "unconscious",
	"/screens/frightened": "frightened",
	"/screens/exhaustion": "exhaustion",
	"/screens/invisible": "invisible",
	"/screens/incapacitated": "incapacitated",
	"/screens/deafened": "deafened",
	"/screens/petrified": "petrified",
	"/screens/restrained": "restrained",
	"/screens/blinded": "blinded",
	"/screens/poisoned": "poisoned",
	"/screens/charmed": "charmed",
	"/screens/stunned": "stunned",
	"/screens/paralyzed": "paralyzed",
	"/screens/condition_prone": "prone",
	"/screens/grappled": "grappled",
};

const CONDITION_ORDER = Object.keys(CONDITION_ICONS);

export type MarkerLayout = {
	marker: TokenMarker;
	x: number;
	y: number;
};

export function deriveMarkers(participant: OwlbearParticipantSnapshot, round: number): TokenMarker[] {
	if (participant.isDead) {
		return [{ kind: "dead", icon: "dead" }];
	}

	const markers: TokenMarker[] = [];
	if (participant.hpCurrent <= 0) {
		markers.push({ kind: "down", icon: "down" });
	} else if (participant.hpMax > 0 && participant.hpCurrent < participant.hpMax / 2) {
		markers.push({ kind: "bloodied", icon: "bloodied" });
	}

	if (participant.isConcentrating) {
		markers.push({ kind: "concentration", icon: "concentration" });
	}

	const knownConditions: TokenMarker[] = [];
	const unknownConditions: TokenMarker[] = [];
	for (const condition of participant.conditions) {
		if (condition.expiresOnRound != null && condition.expiresOnRound <= round) continue;
		const marker: TokenMarker = {
			kind: "condition",
			icon: CONDITION_ICONS[condition.url] ?? "condition",
			conditionUrl: condition.url,
			remainingRounds: condition.expiresOnRound == null ? undefined : condition.expiresOnRound - round,
		};
		if (CONDITION_ICONS[condition.url]) knownConditions.push(marker);
		else unknownConditions.push(marker);
	}

	knownConditions.sort((left, right) => CONDITION_ORDER.indexOf(left.conditionUrl!) - CONDITION_ORDER.indexOf(right.conditionUrl!));
	unknownConditions.sort((left, right) => left.conditionUrl!.localeCompare(right.conditionUrl!));
	return [...markers, ...knownConditions, ...unknownConditions];
}

export function layoutMarkers(markers: TokenMarker[], diameter: number): MarkerLayout[] {
	const iconSize = diameter * 0.2;
	const gap = diameter * 0.03;
	const inset = diameter * 0.04;
	const start = diameter / 2 - inset - iconSize / 2;

	return markers.map((marker, index) => {
		const column = index % 4;
		const row = Math.floor(index / 4);
		return {
			marker,
			x: start - column * (iconSize + gap),
			y: -start + row * (iconSize + gap),
		};
	});
}
