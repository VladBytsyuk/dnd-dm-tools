import { FullMonster } from "src/domain/monster";
import { TEXTS } from "src/res/texts";

type BlockData = { name: string; value: string };

export function renderLayout5e(container: Element, monster: FullMonster) {
    console.log(`Render monster: ${monster.name.eng}`);
    container.classList.add('layout-5e');

    const statblock = createElement(container, 'div', 'layout-5e-statblock');
    
    addSectionLeft(statblock, monster);
    addSectionRight(statblock, monster);
}

function createElement(
    parent: HTMLElement | Element,
    tag: string,
    className?: string,
    content?: string | HTMLElement
): HTMLElement {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content) {
        typeof content === 'string' 
            ? (element.innerHTML = content)
            : element.appendChild(content);
    }
    parent.appendChild(element);
    return element;
}

function addSectionLeft(parent: HTMLElement, monster: FullMonster) {
    const leftSection = createElement(parent, 'div', '', '')

    addHeader(leftSection, monster);
    addDivider(leftSection);
    addBaseInfo(leftSection, monster);
    addDivider(leftSection);
    addScoresTable(leftSection, monster);
    addDivider(leftSection);
    addAdditionalProperties(leftSection, monster);
    addDivider(leftSection);
}

function addSectionRight(parent: HTMLElement, monster: FullMonster) {
    const rightSection = createElement(parent, 'div', '', '')

    addAbilities(rightSection, monster);
    addActionBlock(rightSection, monster.actions, TEXTS.layoutActions);
    addActionBlock(rightSection, monster.bonusActions, TEXTS.layoutBonusActions);
    addActionBlock(rightSection, monster.reactions, TEXTS.layoutReactions);
    addLegendaryBlock(rightSection, monster);
    addLairBlocks(rightSection, monster);
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

function addHeader(parent: HTMLElement, { name, size, type, alignment }: FullMonster) {
    const header = createElement(parent, 'div', 'layout-5e-statblock-header');
    createElement(header, 'div', 'layout-5e-statblock-header-name', name.rus);
    createElement(header, 'div', 'layout-5e-statblock-header-subtitle', `${size.rus} ${type.name}, ${alignment}`);
}

function addBaseInfo(parent: HTMLElement, monster: FullMonster) {
    const { armorClass, hits, speed } = monster;
    const block = createElement(parent, 'div', 'layout-5e-statblock-base-info');

    const formatLine = (label: string, value: string) => 
        createElement(block, 'div', 'layout-5e-statblock-base-info-item', `<b>${label}:</b> ${value}`);

    formatLine(TEXTS.layoutArmorClass, armorClass.toString());
    formatLine(TEXTS.layoutHits, `${hits.average} (${hits.formula})`);
    formatLine(TEXTS.layoutSpeed, speed.map(s => `${s.name ?? ''} ${s.value} ${TEXTS.layoutFt}.`).join(', '));
}

function addScoresTable(parent: HTMLElement, { ability }: FullMonster) {
    const table = createElement(parent, 'div', 'layout-5e-statblock-scores-table');
    
    const addScore = (label: string, value: number) => {
        const item = createElement(table, 'div', 'layout-5e-statblock-scores-table-item');
        createElement(item, 'div', 'layout-5e-statblock-scores-table-item-title', `<b>${label}</b>`);
        createElement(item, 'div', '', `${value} (${formatModifier(value)})`);
    };

    addScore(TEXTS.layoutStr, ability.str);
    addScore(TEXTS.layoutDex, ability.dex);
    addScore(TEXTS.layoutCon, ability.con);
    addScore(TEXTS.layoutInt, ability.int);
    addScore(TEXTS.layoutWis, ability.wiz);
    addScore(TEXTS.layoutCha, ability.cha);
}

function addAdditionalProperties(parent: HTMLElement, monster: FullMonster) {
    const { 
        savingThrows, skills, damageVulnerabilities, damageResistances,
        damageImmunities, conditionImmunities, senses, languages, challengeRating 
    } = monster;
    
    const block = createElement(parent, 'div', 'layout-5e-statblock-base-info');

    const addProperty = (label: string, values: unknown[]) => {
        if (!values?.length) return;
        const content = values.join(', ');
        createElement(block, 'div', 'layout-5e-statblock-base-info-item', `<b>${label}:</b> ${content}`);
    };

    savingThrows && addProperty(TEXTS.layoutSaves, savingThrows.map(st => `${st.name} ${formatModifier(st.value)}`));
    skills && addProperty(TEXTS.layoutSkills, skills.map(s => `${s.name} ${formatModifier(s.value)}`));
    addProperty(TEXTS.layoutDamageVulnerabilities, damageVulnerabilities);
    addProperty(TEXTS.layoutDamageResistances, damageResistances);
    addProperty(TEXTS.layoutDamageImmunities, damageImmunities);
    addProperty(TEXTS.layoutConditionImmunities, conditionImmunities);
    
    senses && createElement(block, 'div', 'layout-5e-statblock-base-info-item', 
        `<b>${TEXTS.layoutSenses}:</b> ${TEXTS.layoutPassivePerception} ${senses.passivePerception}`);
    
    addProperty(TEXTS.layoutLanguages, languages);
    
    if (challengeRating) {
        const xp = monster.experience ? ` (${monster.experience} XP)` : '';
        createElement(block, 'div', 'layout-5e-statblock-base-info-item', 
            `<b>${TEXTS.layoutChallengeRating}:</b> ${challengeRating}${xp}`);
    }
}

function addAbilities(parent: HTMLElement, { feats }: FullMonster) {
    const block = createElement(parent, 'div', 'layout-5e-statblock-property-block');
    feats.forEach(({ name, value }) => 
        createElement(block, 'div', '', `<b>${name}.</b> ${value.replace(/<\/?p>/g, '')}`)
    );
}

function addActionBlock(
    parent: HTMLElement,
    data: BlockData[],
    title: string,
) {
    if (!data?.length) return;
    addGenericBlock(parent, data, title);
}

function addLegendaryBlock(parent: HTMLElement, { legendary }: FullMonster) {
    if (!legendary?.list.length) return;
    addGenericBlock(parent, legendary.list, TEXTS.layoutLegendaryActions, legendary.description);
}

function addLairBlocks(parent: HTMLElement, { lair }: FullMonster) {
    if (!lair) return;
    
    addGenericBlock(parent, [], TEXTS.layoutLair, lair.description);
    addGenericBlock(parent, [], TEXTS.layoutLairActions, lair.action);
    addGenericBlock(parent, [], TEXTS.layoutRegionalEffects, lair.effect);
}

function addGenericBlock(
    parent: HTMLElement,
    items: BlockData[],
    title: string,
    description?: string | null
) {
    const block = createElement(parent, 'div', 'layout-5e-statblock-property-block');
    createElement(block, 'div', 'layout-5e-statblock-block-header', title);
    
    if (description) {
        createElement(block, 'div', 'layout-5e-statblock-generic-description', description.replace(/<\/?p\b[^>]*>/gi, ''));
    }

    items.forEach(({ name, value }) => 
        createElement(block, 'div', '', `<b>${name}.</b> ${value.replace(/<\/?p\b[^>]*>/gi, '')}`)
    );
}

function formatModifier(value: number): string {
    return Math.floor((value - 10) / 2).toString()
        .replace(/^(-?)(\d+)/, (_, sign, num) => Number(num) >= 0 ? `+${num}` : `${sign}${num}`);
}
