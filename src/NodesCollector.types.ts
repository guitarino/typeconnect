import { Node } from "./Node.types";

export interface NodesCollector {
    start: () => void;
    collect: (node: Node) => void;
    stop: () => Node[];
}