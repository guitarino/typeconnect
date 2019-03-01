import { Node } from "./Node.types";

export interface Computed extends Node {
    recalculateValueAndUpdateIfNeeded: () => void;
}