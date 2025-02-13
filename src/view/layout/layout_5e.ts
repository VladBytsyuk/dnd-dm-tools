import { FullMonster } from "src/domain/monster";
import { copyMonsterToClipboard } from "src/domain/monster_parser";
import { TEXTS } from "src/res/texts";

type BlockData = { name: string; value: string };

export function renderLayout5e(container: Element, monster: FullMonster, isTwoColumns: boolean = false) {
    console.log(`Render monster: ${monster.name.eng}`);
    const layout5e = createElement(container, 'div', 'layout-5e', '')

    const statblock = createElement(layout5e, 'div', isTwoColumns ? 'layout-5e-statblock-wide' : 'layout-5e-statblock');
    
    addSectionLeft(statblock, monster);
    addSectionRight(statblock, monster);
    addActionButtons(layout5e, monster);
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

function addActionButtons(parent: HTMLElement, monster: FullMonster) {
    // Создаем SVG-элемент
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.classList.add('layout-5e-copy-button', 'lucide', 'lucide-clipboard-copy'); // Добавляем классы

    // Создаем элемент <rect>
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', '8');
    rect.setAttribute('height', '4');
    rect.setAttribute('x', '8');
    rect.setAttribute('y', '2');
    rect.setAttribute('rx', '1');
    rect.setAttribute('ry', '1');
    svg.appendChild(rect);

    // Создаем первый <path>
    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path1.setAttribute('d', 'M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2');
    svg.appendChild(path1);

    // Создаем второй <path>
    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path2.setAttribute('d', 'M16 4h2a2 2 0 0 1 2 2v4');
    svg.appendChild(path2);

    // Создаем третий <path>
    const path3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path3.setAttribute('d', 'M21 14H11');
    svg.appendChild(path3);

    // Создаем четвертый <path>
    const path4 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path4.setAttribute('d', 'm15 10-4 4 4 4');
    svg.appendChild(path4);

    svg.addEventListener('click', () => {
        copyMonsterToClipboard(monster);
    })

    // Добавляем SVG в родительский элемент
    parent.appendChild(svg);
}

function addSectionLeft(parent: HTMLElement, monster: FullMonster) {
    const leftSection = createElement(parent, 'div', 'layout-5e-statblock-section', '')

    addHeader(leftSection, monster);
    addDivider(leftSection);
    addBaseInfo(leftSection, monster);
    addDivider(leftSection);
    addScoresTable(leftSection, monster);
    if (monster.ability) addDivider(leftSection);
    addAdditionalProperties(leftSection, monster);
    addDivider(leftSection);
}

function addSectionRight(parent: HTMLElement, monster: FullMonster) {
    const rightSection = createElement(parent, 'div', 'layout-5e-statblock-section', '')

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
    if (name) {
        createElement(header, 'div', 'layout-5e-statblock-header-name', name.rus);
    }
    if (size || type || alignment) {
        let text = ""
        if (size) text = text.concat(size.rus);
        if (size && type) text = text.concat(" ");
        if (type) text = text.concat(type.name);
        if ((size || type) && alignment) text = text.concat(", ");
        if (alignment) text = text.concat(alignment);
        createElement(header, 'div', 'layout-5e-statblock-header-subtitle', text);
    }
}

function addBaseInfo(parent: HTMLElement, monster: FullMonster) {
    const { armorClass, armors, hits, speed } = monster;
    const block = createElement(parent, 'div', 'layout-5e-statblock-base-info');

    const formatLine = (label: string, value: string) => 
        createElement(block, 'div', 'layout-5e-statblock-base-info-item', `<b>${label}:</b> ${value}`);

    if (armorClass) {
        let text = armorClass.toString()
        if (armors) {
            text = text.concat(` (`);
            armors.forEach((it, index) => {
                text = text.concat(it.name);
                if (index != armors.length - 1) {
                    text = text.concat(', ');
                }
            });
            text = text.concat(`)`);
        }
        formatLine(TEXTS.layoutArmorClass, text);
    }
    if (hits) {
        let text = ""
        if (hits.average) text = text.concat(hits.average.toString());
        if (hits.average && hits.formula) text = text.concat(" ");
        if (hits.formula) {
            text = text.concat(`(${hits.formula.toString()}`);
            if (hits.sign && hits.bonus) text = text.concat(hits.sign, hits.bonus.toString());
            text = text.concat(')');
        }
        formatLine(TEXTS.layoutHits, text);
    }
    if (speed) formatLine(TEXTS.layoutSpeed, speed.map(s => `${s.name ?? ''} ${s.value} ${TEXTS.layoutFt}.`).join(', '));
}

function addScoresTable(parent: HTMLElement, { ability }: FullMonster) {
    if (!ability) return;
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
    if (!feats) return;
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
