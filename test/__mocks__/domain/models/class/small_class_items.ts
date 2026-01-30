import { ClassesFilters } from "../../../../../src/domain/models/class/ClassesFilters"
import { SmallClass } from "../../../../../src/domain/models/class/SmallClass"

export const classesFilters = {
    diceTypes: ["к6", "к8", "к10", "к12"],
    sources: ["PHB", "XGE", "TCE", "SCAG*"]
} as ClassesFilters;

// Base Classes
export const smallClassBard = {
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
    parentClassUrl: undefined
} as SmallClass;

export const smallClassWizard = {
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
    parentClassUrl: undefined
} as SmallClass;

export const smallClassFighter = {
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
    parentClassUrl: undefined
} as SmallClass;

export const smallClassBarbarian = {
    name: {
        rus: "Варвар",
        eng: "Barbarian"
    },
    url: "/classes/barbarian",
    dice: "к12",
    source: {
        shortName: "PHB",
        name: "Книга игрока",
        group: {
            name: "Официальные источники",
            shortName: "Basic"
        }
    },
    isArchetype: false,
    parentClassUrl: undefined
} as SmallClass;

export const smallClassArtificer = {
    name: {
        rus: "Изобретатель",
        eng: "Artificer"
    },
    url: "/classes/artificer",
    dice: "к8",
    source: {
        shortName: "TCE",
        name: "Котел Таши со всякой всячиной",
        group: {
            name: "Официальные источники",
            shortName: "Basic"
        }
    },
    isArchetype: false,
    parentClassUrl: undefined
} as SmallClass;

// Archetypes for Bard
export const smallArchetypeValor = {
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
    parentClassUrl: "/classes/bard"
} as SmallClass;

export const smallArchetypeLore = {
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
    parentClassUrl: "/classes/bard"
} as SmallClass;

export const smallArchetypeGlamour = {
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
    parentClassUrl: "/classes/bard"
} as SmallClass;

// Archetypes for Wizard
export const smallArchetypeAbjuration = {
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
    parentClassUrl: "/classes/wizard"
} as SmallClass;

export const smallArchetypeEvocation = {
    name: {
        rus: "Школа Вызова",
        eng: "School of Evocation"
    },
    url: "/classes/wizard/school-of-evocation",
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
    parentClassUrl: "/classes/wizard"
} as SmallClass;

// Archetypes for Fighter
export const smallArchetypeChampion = {
    name: {
        rus: "Чемпион",
        eng: "Champion"
    },
    url: "/classes/fighter/champion",
    dice: "к10",
    source: {
        shortName: "PHB",
        name: "Книга игрока",
        group: {
            name: "Официальные источники",
            shortName: "Basic"
        }
    },
    isArchetype: true,
    parentClassUrl: "/classes/fighter"
} as SmallClass;

// Homebrew archetype
export const smallArchetypeHomebrewTest = {
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
    parentClassUrl: "/classes/barbarian"
} as SmallClass;

export const smallClassItems = [
    smallClassBard,
    smallClassWizard,
    smallClassFighter,
    smallClassBarbarian,
    smallClassArtificer,
    smallArchetypeValor,
    smallArchetypeLore,
    smallArchetypeGlamour,
    smallArchetypeAbjuration,
    smallArchetypeEvocation,
    smallArchetypeChampion,
    smallArchetypeHomebrewTest
];
