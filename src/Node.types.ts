import { Computed } from "./Computed.types";

export interface Node {
    updateFlag: number;
    derivedNodes: Computed[];
}