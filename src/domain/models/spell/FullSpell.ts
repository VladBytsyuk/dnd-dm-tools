import type { Class } from "../common/Class";
import type { SmallSpell } from "./SmallSpell";

export interface FullSpell extends SmallSpell {
    range: string;
    duration: string;
    time: string;
    classes?: Class[];
    subclasses?: Class[];
    description: string;
    upper?: string;
}