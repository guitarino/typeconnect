import { Node } from "./Node.types";

export interface Computed<T> extends Node<T> {
    recalculateValueAndUpdateIfNeeded: () => void;
}