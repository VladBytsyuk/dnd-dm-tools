import { stat } from "fs";
import { FullMonster } from "src/domain/monster";

export function renderLayout5e(container: Element, monster: FullMonster) {
    console.log(`Render monster: ${monster.name.eng}`);
    container.addClass('layout-5e');

    const statblock = document.createElement('div');
    statblock.addClass('layout-5e-statblock');
    container.appendChild(statblock)

    addHeader(statblock, monster);
    addBaseInfo(statblock, monster);
    addScoresTable(statblock, monster);
    addBaseInfoProperties(statblock, monster);
}

function addHeader(parent: HTMLElement, monster: FullMonster) {
    const header = createDiv(parent, 'layout-5e-statblock-header');
    createDiv(header, 'layout-5e-statblock-header-name', monster.name.rus);
    createDiv(header, 'layout-5e-statblock-header-subtitle', `${monster.size.rus} ${monster.type.name}, ${monster.alignment}`);
}

function addBaseInfo(parent: HTMLElement, monster: FullMonster) {
    const baseInfoBlock = createDiv(parent, 'layout-5e-statblock-base-info');
    createDivHtml(
        baseInfoBlock, 'layout-5e-statblock-base-info-item', 
        `<b>Класс доспеха:</b> ${monster.armorClass}`,
    );
    createDivHtml(
        baseInfoBlock, 'layout-5e-statblock-base-info-item', 
        `<b>Хиты:</b> ${monster.hits.average} (${monster.hits.formula})`,
    );
    createDivHtml(
        baseInfoBlock, 'layout-5e-statblock-base-info-item', 
        `<b>Скорость:</b> ${monster.speed.map(speed => `${speed.name ?? ''} ${speed.value} фт.`).join(", ")}`,
    );
}

function addScoresTable(parent: HTMLElement, monster: FullMonster) {
    const scoresTable = createDiv(parent, 'layout-5e-statblock-scores-table');
    createDivTable(scoresTable, 'СИЛ', monster.ability.str);
    createDivTable(scoresTable, 'ЛОВ', monster.ability.dex);
    createDivTable(scoresTable, 'ТЕЛ', monster.ability.con);
    createDivTable(scoresTable, 'ИНТ', monster.ability.int);
    createDivTable(scoresTable, 'МУД', monster.ability.wiz);
    createDivTable(scoresTable, 'ХАР', monster.ability.cha);
}

function addBaseInfoProperties(parent: HTMLElement, monster: FullMonster) {
    const baseInfoBlock = createDiv(parent, 'layout-5e-statblock-base-info');
    createDivHtml(
        baseInfoBlock, 'layout-5e-statblock-base-info-item', 
        `<b>Чувства:</b> пассивная внимательность ${monster.senses.passivePerception}`,
    );
    createDivHtml(
        baseInfoBlock, 'layout-5e-statblock-base-info-item', 
        `<b>Языки:</b> ${monster.languages.join(", ")}`,
    );
    createDivHtml(
        baseInfoBlock, 'layout-5e-statblock-base-info-item', 
        `<b>Опасность:</b> ${monster.challengeRating}`,
    );
}

function createDiv(parent: HTMLElement, style: string | null = null, text: string | null = null): HTMLElement {
    const item = document.createElement('div');
    if (style != null) item.addClass(style);
    if (text != null) item.setText(text);
    parent.appendChild(item);
    return item;
}

function createDivHtml(parent: HTMLElement, style: string | null = null, text: string | null = null): HTMLElement {
    const item = document.createElement('div');
    if (style != null) item.addClass(style);
    if (text != null) item.innerHTML = text;
    parent.appendChild(item);
    return item;
}

function createDivTable(parent: HTMLElement, header: string, value: number): HTMLElement {
    const item = document.createElement('div');
    item.addClass('layout-5e-statblock-scores-table-item');
    parent.appendChild(item);

    const scoreName = document.createElement('h6');
    scoreName.setText(header);
    item.appendChild(scoreName);

    const scoreValue = document.createElement('div');
    scoreValue.setText(`${value} (${valueToModifier(value)})`);
    item.appendChild(scoreValue);

    return item;
}

function valueToModifier(value: number): string {
    const modifier = (value - 10) / 2;
    if (modifier >= 0) {
        return `+${modifier}`
    } else {
        return `${modifier}`
    }
}
