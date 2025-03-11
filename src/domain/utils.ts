import { TEXTS } from "src/res/texts_ru";
import type { Speed } from "./monster";

export const separate = (text: Array<string>) =>
    text.join(', ');

export const joinList = (items: Array<{ name: string }>) => 
    separate(items?.map(it => it.name)) || '';

export const joinSpeed = (items: Array<Speed>) =>
    separate(items?.map(it => {
        let result = '';
        if (it.name) result += it.name + ' ';
        if (it.value) result += it.value + ` ${TEXTS.layoutFt}. `;
        if (it.additional) result += '(' + it.additional + ')';
        return result;
    })) || '';
