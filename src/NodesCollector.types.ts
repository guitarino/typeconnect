import { Node } from "./Node.types";

export interface NodesCollector {
    start: () => void;
    collect: <T>(node: Node<T>) => void;
    stop: () => Node<any>[];
}