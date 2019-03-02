import { Computed } from "../Computed";
import { NodesCollector } from "../NodesCollector";
import { createPropertyInitializer } from "./shared";

export const COMPUTED_INITIALIZERS = '_typeConnectComputedInitializers';

export function computed(
    target,
    property,
    descriptor
) {
    if (!target[COMPUTED_INITIALIZERS]) {
        target[COMPUTED_INITIALIZERS] = [];
    }
    const getter = descriptor.get;
    target[COMPUTED_INITIALIZERS].push(createPropertyInitializer(
        property,
        descriptor.enumerable,
        descriptor.configurable,
        function createAndGetComputedNode(targetInstance) {
            return new Computed(NodesCollector.get(), getter.bind(targetInstance));
        }
    ));
    return descriptor;
}