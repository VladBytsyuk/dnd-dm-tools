import type { SmallClass } from "src/domain/models/class/SmallClass";
import { type ClassesFilters } from "src/domain/models/class/ClassesFilters";
import type DB from "../database/DB";
import { EmptyFullClass, type FullClass } from 'src/domain/models/class/FullClass';
import { BaseRepository } from './BaseRepository';
import { createFilters } from "src/domain/models/common/Filters";
import type { Group, Repository } from "src/domain/repositories/Repository";


export class ClassesRepository
    extends BaseRepository<SmallClass, FullClass, ClassesFilters>
    implements Repository<SmallClass, FullClass, ClassesFilters> {

    constructor(database: DB) {
        super(
            database,
            database.smallClassDao,
            database.fullClassDao,
        );
    }

    async collectFiltersFromAllItems(allSmallItems: SmallClass[]): Promise<ClassesFilters | null> {
        const diceTypesSet = new Set<string>();
        const sourcesSet = new Set<string>();

        for (const classItem of allSmallItems) {
            diceTypesSet.add(classItem.dice);
            sourcesSet.add(classItem.source.shortName + (classItem.source.group.shortName != "Basic" ? "*" : ""));
        }

        return createFilters<ClassesFilters>({
            diceTypes: Array.from(diceTypesSet),
            sources: Array.from(sourcesSet)
        });
    }

    async groupItems(smallItems: SmallClass[]): Promise<Group<SmallClass>[]> {
        const groups = smallItems.reduce((acc, classItem) => {
            const sourceKey = classItem.source.shortName;
            (acc[sourceKey] ||= []).push(classItem);
            return acc;
        }, {} as { [key: string]: SmallClass[] });

        const priorityOrder = ['PHB', 'XGE', 'TCE'];

        return Object.entries(groups)
            .map(([sourceShortName, smallClasses]) => ({ sort: sourceShortName, smallItems: smallClasses }))
            .sort((a, b) => {
                const aIndex = priorityOrder.indexOf(a.sort);
                const bIndex = priorityOrder.indexOf(b.sort);

                // Both in priority list
                if (aIndex !== -1 && bIndex !== -1) {
                    return aIndex - bIndex;
                }
                // Only a in priority list
                if (aIndex !== -1) return -1;
                // Only b in priority list
                if (bIndex !== -1) return 1;
                // Neither in priority list - sort alphabetically
                return a.sort.localeCompare(b.sort);
            });
    }

    createEmptyFullItem(): FullClass | undefined {
        return EmptyFullClass();
    }
}
