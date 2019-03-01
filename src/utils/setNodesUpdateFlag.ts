import { Node } from "../Node.types";

export function setNodesUpdateFlag(nodes: Node[], updateFlag: number) {
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.updateFlag = updateFlag;
    }
}