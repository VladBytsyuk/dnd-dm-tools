import type { DetailType } from "../common/DetailType";
import type { Price } from "../common/Price";
import type { SmallArtifact } from "./SmallArtifact";

export interface FullArtifact extends SmallArtifact {
    description: string;
    detailType?: DetailType[];
    cost: Price;
    images?: string[];
    detailCustamization?: string[];
}
