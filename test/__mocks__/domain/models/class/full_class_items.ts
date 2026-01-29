import { FullClass } from "../../../../../src/domain/models/class/FullClass"

// Base Classes with HTML
export const fullClassBard: FullClass = {
    id: 1,
    name: {
        rus: "Бард",
        eng: "Bard"
    },
    url: "/classes/bard",
    dice: "к8",
    source: {
        shortName: "PHB",
        name: "Книга игрока",
        group: {
            name: "Официальные источники",
            shortName: "Basic"
        }
    },
    isArchetype: false,
    parentClassUrl: undefined,
    associatedUrl: "/classes/fragment/bard",
    associatedHtml: "<div class='class-description'><h1>Бард</h1><p>Описание класса барда...</p></div>",
    archetypeType: undefined
};

export const fullClassWizard: FullClass = {
    id: 2,
    name: {
        rus: "Волшебник",
        eng: "Wizard"
    },
    url: "/classes/wizard",
    dice: "к6",
    source: {
        shortName: "PHB",
        name: "Книга игрока",
        group: {
            name: "Официальные источники",
            shortName: "Basic"
        }
    },
    isArchetype: false,
    parentClassUrl: undefined,
    associatedUrl: "/classes/fragment/wizard",
    associatedHtml: "<div class='class-description'><h1>Волшебник</h1><p>Описание класса волшебника...</p></div>",
    archetypeType: undefined
};

export const fullClassFighter: FullClass = {
    id: 3,
    name: {
        rus: "Воин",
        eng: "Fighter"
    },
    url: "/classes/fighter",
    dice: "к10",
    source: {
        shortName: "PHB",
        name: "Книга игрока",
        group: {
            name: "Официальные источники",
            shortName: "Basic"
        }
    },
    isArchetype: false,
    parentClassUrl: undefined,
    associatedUrl: "/classes/fragment/fighter",
    associatedHtml: "<div class='class-description'><h1>Воин</h1><p>Описание класса воина...</p></div>",
    archetypeType: undefined
};

// Archetypes with archetypeType
export const fullArchetypeValor: FullClass = {
    id: 4,
    name: {
        rus: "Коллегия Доблести",
        eng: "College of Valor"
    },
    url: "/classes/bard/college-of-valor",
    dice: "к8",
    source: {
        shortName: "PHB",
        name: "Книга игрока",
        group: {
            name: "Официальные источники",
            shortName: "Basic"
        }
    },
    isArchetype: true,
    parentClassUrl: "/classes/bard",
    associatedUrl: "/classes/fragment/bard/college-of-valor",
    associatedHtml: "<div class='archetype-description'><h2>Коллегия Доблести</h2><p>Описание архетипа...</p></div>",
    archetypeType: {
        name: "Базовые",
        order: 0
    }
};

export const fullArchetypeLore: FullClass = {
    id: 5,
    name: {
        rus: "Коллегия Знаний",
        eng: "College of Lore"
    },
    url: "/classes/bard/college-of-lore",
    dice: "к8",
    source: {
        shortName: "PHB",
        name: "Книга игрока",
        group: {
            name: "Официальные источники",
            shortName: "Basic"
        }
    },
    isArchetype: true,
    parentClassUrl: "/classes/bard",
    associatedUrl: "/classes/fragment/bard/college-of-lore",
    associatedHtml: "<div class='archetype-description'><h2>Коллегия Знаний</h2><p>Описание архетипа...</p></div>",
    archetypeType: {
        name: "Базовые",
        order: 0
    }
};

export const fullArchetypeGlamour: FullClass = {
    id: 6,
    name: {
        rus: "Коллегия Очарования",
        eng: "College of Glamour"
    },
    url: "/classes/bard/college-of-glamour",
    dice: "к8",
    source: {
        shortName: "XGE",
        name: "Руководство Занатара обо всём",
        group: {
            name: "Официальные источники",
            shortName: "Basic"
        }
    },
    isArchetype: true,
    parentClassUrl: "/classes/bard",
    associatedUrl: "/classes/fragment/bard/college-of-glamour",
    associatedHtml: "<div class='archetype-description'><h2>Коллегия Очарования</h2><p>Описание архетипа из XGE...</p></div>",
    archetypeType: {
        name: "Расширенные",
        order: 1
    }
};

export const fullArchetypeAbjuration: FullClass = {
    id: 7,
    name: {
        rus: "Школа Ограждения",
        eng: "School of Abjuration"
    },
    url: "/classes/wizard/school-of-abjuration",
    dice: "к6",
    source: {
        shortName: "PHB",
        name: "Книга игрока",
        group: {
            name: "Официальные источники",
            shortName: "Basic"
        }
    },
    isArchetype: true,
    parentClassUrl: "/classes/wizard",
    associatedUrl: "/classes/fragment/wizard/school-of-abjuration",
    associatedHtml: "<div class='archetype-description'><h2>Школа Ограждения</h2><p>Описание школы магии...</p></div>",
    archetypeType: {
        name: "Базовые",
        order: 0
    }
};

export const fullArchetypeHomebrewTest: FullClass = {
    id: 8,
    name: {
        rus: "Тестовый Путь",
        eng: "Test Path"
    },
    url: "/classes/barbarian/test-path",
    dice: "к12",
    source: {
        shortName: "HB",
        name: "Homebrew Content",
        group: {
            name: "Homebrew",
            shortName: "HB"
        }
    },
    isArchetype: true,
    parentClassUrl: "/classes/barbarian",
    associatedUrl: "/classes/fragment/barbarian/test-path",
    associatedHtml: "<div class='archetype-description'><h2>Тестовый Путь</h2><p>Homebrew архетип...</p></div>",
    archetypeType: {
        name: "Homebrew",
        order: 2
    }
};

export const fullClassItems = [
    fullClassBard,
    fullClassWizard,
    fullClassFighter,
    fullArchetypeValor,
    fullArchetypeLore,
    fullArchetypeGlamour,
    fullArchetypeAbjuration,
    fullArchetypeHomebrewTest
];
