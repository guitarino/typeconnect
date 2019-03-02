import { Observed } from "../Observed";
import { NodesCollector } from "../NodesCollector";
import { createPropertyInitializer } from "./shared";

export const OBSERVED_INITIALIZERS = '_typeConnectObservedInitializers';

function createAndGetObservedNode(_targetInstance: Object, value: any) {
    return new Observed(NodesCollector.get(), value);
}

export function observed(
    target,
    property,
    descriptor
) {
    if (!target[OBSERVED_INITIALIZERS]) {
        target[OBSERVED_INITIALIZERS] = [];
    }
    target[OBSERVED_INITIALIZERS].push(createPropertyInitializer(
        property,
        descriptor.enumerable,
        descriptor.configurable,
        createAndGetObservedNode
    ));
}