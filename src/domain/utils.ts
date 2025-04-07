import { TEXTS } from "src/res/texts_ru";
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
        if (it.value) result += it.value + ` ${TEXTS.layoutFt}. `;
        if (it.additional) result += '(' + it.additional + ')';
        return result;
    })) || '';

export const addLinkListeners = (onSpellHover: (url: string) => (node: HTMLElement) => void) => (node: HTMLElement) => {
    const handleLinkHover = (e: MouseEvent) => {
        const link = e.currentTarget as HTMLAnchorElement;
        const url = link.getAttribute('href')!;
        onSpellHover(url);
    }
    const spellsLinks = node.querySelectorAll<HTMLAnchorElement>('a[href^="/spells/"]');
    spellsLinks.forEach(link => {
        link.style.cursor = 'pointer';
        link.addEventListener('click', handleLinkHover);
    });
    return {
        destroy() {
            spellsLinks.forEach(link => link.removeEventListener('click', handleLinkHover));
        }
    };
}