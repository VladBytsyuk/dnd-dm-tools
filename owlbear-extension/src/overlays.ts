import type { OwlbearParticipantSnapshot, TokenMarker } from "./types";

export function deriveMarkers(participant: OwlbearParticipantSnapshot, round: number): TokenMarker[] {
	const markers: TokenMarker[] = [];
	const defeated = participant.isDead || participant.hpCurrent <= 0;
	const bloodied = participant.hpMax > 0 && participant.hpCurrent <= participant.hpMax / 2 && participant.hpCurrent > 0 && !defeated;
	const remainingConditionRounds = participant.conditions
		.map((condition) => condition.expiresOnRound == null ? null : Math.max(0, condition.expiresOnRound - round))
		.filter((value): value is number => value != null);

	if (bloodied) {
		markers.push({ kind: "bloodied", text: "50%", color: "#dc2626" });
	}

	if (defeated) {
		markers.push({ kind: "defeated", text: "0", color: "#111827" });
	}

	if (participant.isConcentrating) {
		markers.push({ kind: "concentration", text: "C", color: "#7c3aed" });
	}

	if (remainingConditionRounds.length > 0) {
		markers.push({
			kind: "condition-duration",
			text: String(Math.min(...remainingConditionRounds)),
			color: "#2563eb",
		});
	}

	return markers;
}
