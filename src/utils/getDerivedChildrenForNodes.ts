import { Node } from "../Node.types";
import { Computed } from "../Computed.types";

export function getDerivedChildrenForNodes(nodes: Node[]): Computed[] {
    const derivedChildren: Computed[] = [];
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        for (let j = 0; j < node.derivedNodes.length; j++) {
            const derivedNode = node.derivedNodes[j];
            if (derivedChildren.indexOf(derivedNode) < 0) {
                derivedChildren.push(derivedNode);
            }
        }
    }
    return derivedChildren;
}