import { Computed } from "./Computed.types";

export interface Node {
    updateFlag: number;
    derivedNodes: Computed[];
    getValue: () => any;
    setValue: (newValue: any) => void;
}