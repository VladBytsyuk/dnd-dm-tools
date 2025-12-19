import type { RollTraceResult } from "../dice";

export interface IDiceRollListener {
    onDiceRoll: (label: string, value: RollTraceResult) => void;
}
