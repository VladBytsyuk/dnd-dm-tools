import { mount } from "svelte";
import type { FullRace } from "src/domain/models/race/FullRace";
import type { RaceFilters } from "src/domain/models/race/RaceFilters";
import { BaseSidePanel } from "./BaseSidePanel";
import type { SmallRace } from "src/domain/models/race/SmallRace";
import BaseSidePanelUi from "src/ui/layout/uikit/BaseSidePanelUi.svelte";
import RaceFullUi from "src/ui/layout/race/RaceFullUi.svelte";
import RaceSmallUi from "src/ui/layout/race/RaceSmallUi.svelte";
import { emptyFilters } from "src/domain/models/common/Filters";
import type { FilterConfig } from "src/domain/utils/FilterConfig";

export class RaceSidePanel extends BaseSidePanel<SmallRace, FullRace, RaceFilters> {

    getKey(): string { return "races"; }
    getRibbonIconName(): string { return "users"; }
    getTitle(): string { return "Расы"; }

    async mountSvelteComponent(element: Element) {
        const filterConfig: FilterConfig<RaceFilters>[] = [
            { key: 'sources', label: 'Источник' },
            { key: 'abilities', label: 'Способности' },
            { key: 'types', label: 'Типы' },
        ];

        const abilityToRussian: Record<string, string> = {
            'STRENGTH': 'Сила',
            'DEXTERITY': 'Ловкость',
            'CONSTITUTION': 'Телосложение',
            'INTELLIGENCE': 'Интеллект',
            'WISDOM': 'Мудрость',
            'CHARISMA': 'Харизма',
            'ONE': 'к одной',
            'CHOICE': 'к другой',
            'CHOICE_DOUBLE': '+2 и +1 / +1 к трем',
            'CHOICE_UNIQUE': 'к 2 другим',
        };

        const russianToAbility: Record<string, string> = {
            'Сила': 'STRENGTH',
            'Ловкость': 'DEXTERITY',
            'Телосложение': 'CONSTITUTION',
            'Интеллект': 'INTELLIGENCE',
            'Мудрость': 'WISDOM',
            'Харизма': 'CHARISMA',
            'к одной': 'ONE',
            'к другой': 'CHOICE',
            '+2 и +1 / +1 к трем': 'CHOICE_DOUBLE',
            'к 2 другим': 'CHOICE_UNIQUE',
        };

        const abilityDisplayOrder: string[] = [
            'Сила', 'Ловкость', 'Телосложение', 'Интеллект', 'Мудрость', 'Харизма',
            'к одной', 'к другой', '+2 и +1 / +1 к трем', 'к 2 другим'
        ];

        const filterDisplayTransform = (filters: RaceFilters): RaceFilters => {
            const translated = filters.abilities.map(key => abilityToRussian[key] || key);
            const sorted = translated.sort((a, b) => {
                const aIndex = abilityDisplayOrder.indexOf(a);
                const bIndex = abilityDisplayOrder.indexOf(b);
                const aOrder = aIndex !== -1 ? aIndex : 999;
                const bOrder = bIndex !== -1 ? bIndex : 999;
                return aOrder - bOrder;
            });
            return { ...filters, abilities: sorted };
        };

        const filterApplyTransform = (filters: RaceFilters): RaceFilters => ({
            ...filters,
            abilities: filters.abilities.map(name => russianToAbility[name] || name),
        });

        mount(BaseSidePanelUi, {
            target: element,
            props: {
                initialFullItem: this.fullItem,
                initialFilters: emptyFilters<RaceFilters>(['abilities', 'types', 'sources']),
                repository: this.repository,
                uiEventListener: this.uiEventListener,
                filterConfig,
                groupTitleBuilder: (group: { sort: string }) => group.sort,
                FullItemSlot: RaceFullUi,
                SmallItemSlot: RaceSmallUi,
                filterDisplayTransform,
                filterApplyTransform,
            },
        });
    }
}
