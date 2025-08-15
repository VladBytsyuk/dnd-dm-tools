import { mapDiceRollerTags } from "../mappers";
import type { Speed } from "../models/common/Speed";
import type { WeaponProperty } from "../models/common/WeaponProperty";

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

export const joinProperties = (items: Array<WeaponProperty>) => {
    if (items.length === 0) return '';
    const mapper = (it: WeaponProperty) => {
        const distanceSuffix = it.distance ? ` (${it.distance})` : '';
        return "<a href=\"" + it.url + "\">" + it.name + "</a>" + distanceSuffix;
    };
    return separate(items.map(mapper)) || '';
};

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