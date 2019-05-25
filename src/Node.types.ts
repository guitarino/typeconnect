import { Computed } from "./Computed.types";

export interface Node<T> {
    updateFlag: number;
    derivedNodes: Computed<any>[];
    getValue: () => T;
    setValue: (newValue: T) => void;
}