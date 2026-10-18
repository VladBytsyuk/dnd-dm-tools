import { mapDiceRollerTags } from "../mappers";
import type { Speed } from "../models/common/Speed";

export const handleHtml = (text: string): string => {
    return mapDiceRollerTags(getRidOfP(text))
}

export const getRidOfP = (text: string): string => {
    return text.replace(/<\/?p>/g, '');
}

export const separate = (text: Array<string>) =>
    text.join(', ');

export const joinList = (items: Array<{ name: string }> | null | undefined) =>
    separate(items?.map(it => it.name) ?? []) || '';


export const joinSpeed = (items: Array<Speed> | null | undefined) =>
    separate(items?.map(it => {
        let result = '';
        if (it.name) result += it.name;
        if (it.value) {
            if (result) result += ' ';
            result += (it.value ?? 0) + ` фт.`;
        }
        if (it.additional) result += ' (' + it.additional + ')';
        return result;
    }) ?? []) || '';

export const diceRoller = (label: string, formula: string, text: string = formula) => `<dice-roller label="${label}" formula="${formula}">${text}</dice-roller>`
