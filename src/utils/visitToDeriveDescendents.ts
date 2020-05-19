import { Computed } from "../Computed.types";
import { CyclicError } from "../Errors";

export function visitToDeriveDescendents(node: Computed<any>, derivedDescendents: Computed<any>[], visitingDescendents: Computed<any>[], visitedDescendents: Computed<any>[]) {
    if (visitedDescendents.indexOf(node) >= 0) {
        return;
    }

    const visitingIndex = visitingDescendents.indexOf(node);
    if (visitingIndex >= 0) {
        throw new CyclicError([...visitingDescendents.slice(visitingIndex), node]);
    }

    const index = visitingDescendents.push(node) - 1;

    for (let i = 0; i < node.derivedNodes.length; i++) {
        visitToDeriveDescendents(node.derivedNodes[i], derivedDescendents, visitingDescendents, visitedDescendents);
    }

    visitingDescendents.splice(index, 1);
    visitedDescendents.push(node);
    derivedDescendents.unshift(node);
}