import type { SmallFeat } from "../../../../../../src/domain/models/feat/SmallFeat";
import type { FeatsFilters } from "../../../../../../src/domain/models/feat/FeatsFilters";

export const smallFeat1: SmallFeat = {
    name: { rus: 'Вдохновляющий лидер', eng: 'Inspiring Leader' },
    requirements: 'Харизма 13 или выше',
    url: '/feats/inspiring-leader',
    source: {
        shortName: 'PHB',
        name: 'Player\'s Handbook',
        group: { name: 'Core', shortName: 'C' },
        homebrew: false,
    },
};

export const smallFeat2: SmallFeat = {
    name: { rus: 'Меткий стрелок', eng: 'Sharpshooter' },
    requirements: 'Нет',
    url: '/feats/sharpshooter',
    source: {
        shortName: 'PHB',
        name: 'Player\'s Handbook',
        group: { name: 'Core', shortName: 'C' },
        homebrew: false,
    },
};

export const smallFeat3: SmallFeat = {
    name: { rus: 'Адепт стихий', eng: 'Elemental Adept' },
    requirements: 'Способность накладывать хотя бы одно заклинание',
    url: '/feats/elemental-adept',
    source: {
        shortName: 'XGE',
        name: 'Xanathar\'s Guide to Everything',
        group: { name: 'Supplements', shortName: 'S' },
        homebrew: false,
    },
};

export const featsFilters: FeatsFilters = {
    sources: ['PHB', 'XGE'],
};
