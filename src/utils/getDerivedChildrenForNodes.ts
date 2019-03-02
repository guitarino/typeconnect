import { Node } from "../Node.types";
import { Computed } from "../Computed.types";
import { addUniqueItemToArray } from "./addUniqueItemToArray";

export function getDerivedChildrenForNodes(nodes: Node[]): Computed[] {
    const derivedChildren: Computed[] = [];
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        for (let j = 0; j < node.derivedNodes.length; j++) {
            const derivedNode = node.derivedNodes[j];
            addUniqueItemToArray(derivedNode, derivedChildren);
        }
    }
    return derivedChildren;
}