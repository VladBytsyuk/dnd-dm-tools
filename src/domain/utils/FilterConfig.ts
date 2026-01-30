import type { Filters } from "../models/common/Filters";

export interface FilterConfig<F extends Filters> {
    key: keyof F;
    label: string;
}
