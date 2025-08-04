import type { Speed } from "./monster";
import { mapDiceRollerTags } from "./mappers";

export const handleHtml = (text: string): string => {
    return mapDiceRollerTags(getRidOfP(text))
}

export const getRidOfP = (text: string): string => {
    return text.replace(/<\/?p>/g, '');
}

export const separate = (text: Array<string>) =>
    text.join(', ');

export const joinList = (items: Array<{ name: string }>) => 
    separate(items?.map(it => it.name)) || '';

export const joinSpeed = (items: Array<Speed>) =>
    separate(items?.map(it => {
        let result = '';
        if (it.name) result += it.name + ' ';
        if (it.value) result += it.value + ` фт. `;
        if (it.additional) result += '(' + it.additional + ')';
        return result;
    })) || '';

export const diceRoller = (label: string, formula: string, text: string = formula) => `<dice-roller label="${label}" formula="${formula}">${text}</dice-roller>`


export const onkeydown = (onclick: (event: KeyboardEvent) => void) => (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onclick(event);
    }
}   