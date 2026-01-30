import ClassFullUi from "src/ui/layout/class/ClassFullUi.svelte";
import type { FullClass } from "src/domain/models/class/FullClass";
import type { SmallClass } from "src/domain/models/class/SmallClass";
import type { ClassesFilters } from "src/domain/models/class/ClassesFilters";
import { BaseMdCodeBlockProcessor } from "./BaseMdCodeBlockProcessor";

export class ClassesMdCodeBlockProcessor
    extends BaseMdCodeBlockProcessor<SmallClass, FullClass, ClassesFilters> {

    getCodeBlockName() { return 'dnd-class'; }
    getUi() { return ClassFullUi; }
}
