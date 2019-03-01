import { Computed } from "../Computed.types";

export function recalculateAndUpdatedNodeValuesIfNeeded(nodes: Computed[]) {
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.recalculateValueAndUpdateIfNeeded();
    }
}