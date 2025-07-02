export interface IDiceRollListener {
    onDiceRoll: (label: string, value: number) => void;
}
