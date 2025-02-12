import { FullMonster } from "src/domain/monster";
import { TEXTS } from "src/res/texts";

export function renderLayout5e(container: Element, monster: FullMonster) {
    console.log(`Render monster: ${monster.name.eng}`);
    container.addClass('layout-5e');

    const statblock = document.createElement('div');
    statblock.addClass('layout-5e-statblock');
    container.appendChild(statblock)

    addHeader(statblock, monster);
    addDivider(statblock);
    addBaseInfo(statblock, monster);
    addDivider(statblock);
    addScoresTable(statblock, monster);
    addDivider(statblock);
    addBaseInfoProperties(statblock, monster);
    addDivider(statblock);
    addAbilities(statblock, monster);
    addBlock(statblock, monster.actions, TEXTS.layoutActions);
    addBlock(statblock, monster.bonusActions, TEXTS.layoutBonusActions);
    addBlock(statblock, monster.reactions, TEXTS.layoutReactions);
    addBlock(statblock, monster.legendary.list, TEXTS.layoutLegendaryActions, monster.legendary.description);
    if (monster.lair) {
        addBlock(statblock, [], TEXTS.layoutLair, monster.lair.description);
        addBlock(statblock, [], TEXTS.layoutLairActions, monster.lair.action);
        addBlock(statblock, [], TEXTS.layoutRegionalEffects, monster.lair.effect);
    }
}

function addDivider(parent: HTMLElement) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('height', '5');
    svg.setAttribute('width', '100%');
    svg.addClass('tapered-rule');
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', '0,0 400,2.5 0,5');
    svg.appendChild(polyline);

    parent.appendChild(svg);
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
        `<b>${TEXTS.layoutArmorClass}:</b> ${monster.armorClass}`,
    );
    createDivHtml(
        baseInfoBlock, 'layout-5e-statblock-base-info-item', 
        `<b>${TEXTS.layoutHits}:</b> ${monster.hits.average} (${monster.hits.formula})`,
    );
    createDivHtml(
        baseInfoBlock, 'layout-5e-statblock-base-info-item', 
        `<b>${TEXTS.layoutSpeed}:</b> ${monster.speed.map(speed => `${speed.name ?? ''} ${speed.value} фт.`).join(", ")}`,
    );
}

function addScoresTable(parent: HTMLElement, monster: FullMonster) {
    const scoresTable = createDiv(parent, 'layout-5e-statblock-scores-table');
    createDivTable(scoresTable, TEXTS.layoutStr, monster.ability.str);
    createDivTable(scoresTable, TEXTS.layoutDex, monster.ability.dex);
    createDivTable(scoresTable, TEXTS.layoutCon, monster.ability.con);
    createDivTable(scoresTable, TEXTS.layoutInt, monster.ability.int);
    createDivTable(scoresTable, TEXTS.layoutWis, monster.ability.wiz);
    createDivTable(scoresTable, TEXTS.layoutCha, monster.ability.cha);
}

function addBaseInfoProperties(parent: HTMLElement, monster: FullMonster) {
    const baseInfoBlock = createDiv(parent, 'layout-5e-statblock-base-info');
    if (monster.savingThrows) {
        createDivProperty(baseInfoBlock, `<b>${TEXTS.layoutSaves}:</b> ${monster.savingThrows.map(it => `${it.name} ${modifierStr(it.value)}`).join(', ')}`);
    }
    if (monster.skills) {
        createDivProperty(baseInfoBlock, `<b>${TEXTS.layoutSkills}:</b> ${monster.skills.map(it => `${it.name} ${modifierStr(it.value)}`).join(', ')}`);
    }
    if (monster.damageVulnerabilities) {
        createDivProperty(baseInfoBlock, `<b>${TEXTS.layoutDamageVulnerabilities}:</b> ${monster.damageVulnerabilities.join(', ')}`);
    }
    if (monster.damageResistances) {
        createDivProperty(baseInfoBlock, `<b>${TEXTS.layoutDamageResistances}:</b> ${monster.damageResistances.join(', ')}`);
    }
    if (monster.damageImmunities) {
        createDivProperty(baseInfoBlock, `<b>${TEXTS.layoutDamageImmunities}:</b> ${monster.damageImmunities.join(', ')}`);
    }
    if (monster.conditionImmunities) {
        createDivProperty(baseInfoBlock, `<b>${TEXTS.layoutConditionImmunities}:</b> ${monster.conditionImmunities.join(', ')}`);
    }
    if (monster.senses) {
        createDivProperty(baseInfoBlock, `<b>${TEXTS.layoutSenses}:</b> пассивная внимательность ${monster.senses.passivePerception}`);
    }
    if (monster.languages) {
        createDivProperty(baseInfoBlock, `<b>${TEXTS.layoutLanguages}:</b> ${monster.languages.join(", ")}`);
    }
    if (monster.challengeRating) {
        createDivProperty(baseInfoBlock, `<b>${TEXTS.layoutChallengeRating}:</b> ${monster.challengeRating} ${monster.experience ? `(${monster.experience} XP)` : ``}`);
    }
}

function addAbilities(parent: HTMLElement, monster: FullMonster) {
    const abilities = document.createElement('div');
    abilities.addClass('layout-5e-statblock-property-block');
    monster.feats.forEach(feat => {
        createProperty(abilities, feat.name, feat.value.replace('<p>', '').replace('</p>', ''));
    });
    parent.appendChild(abilities);
}

function addBlock(
    parent: HTMLElement,
    data: { name: string, value: string }[],
    title: string,
    description: string | null = null,
) {
    if (!data) return;
    const container = document.createElement('div');
    container.addClass('layout-5e-statblock-property-block');

    const header = document.createElement('div');
    header.addClass('layout-5e-statblock-block-header');
    header.setText(title);
    container.appendChild(header);

    if (description) {
        const desc = document.createElement('div');
        desc.innerHTML = description;
        container.appendChild(desc);
    }

    data.forEach(item => {
        createProperty(container, item.name, item.value.replace('<p>', '').replace('</p>', ''));
    });
    parent.appendChild(container);
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

function createDivProperty(parent: HTMLElement, text: string): HTMLElement {
    return createDivHtml(parent, 'layout-5e-statblock-base-info-item', text)
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

function createProperty(parent: HTMLElement, name: string, value: string): HTMLElement {
    const item = document.createElement('div');
    item.innerHTML = `<b>${name}.</b> ${value}`;
    parent.appendChild(item);
    return item;
}

function valueToModifier(value: number): string {
    const modifier = (value - 10) / 2;
    return modifierStr(modifier);
}

function modifierStr(modifier: number): string {
    if (modifier >= 0) {
        return `+${modifier}`;
    } else {
        return `${modifier}`;
    }
}
