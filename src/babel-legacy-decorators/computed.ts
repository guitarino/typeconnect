import { Computed } from "../Computed";
import { createPropertyInitializer } from "./shared";

export const COMPUTED_INITIALIZERS = '_typeConnectComputedInitializers';

export const computed: any = (
    target,
    property,
    descriptor
) => {
    if (!target[COMPUTED_INITIALIZERS]) {
        target[COMPUTED_INITIALIZERS] = [];
    }
    const getter = descriptor.get;
    target[COMPUTED_INITIALIZERS].push(createPropertyInitializer(
        property,
        descriptor.enumerable,
        descriptor.configurable,
        function createAndGetComputedNode(targetInstance) {
            return new Computed(getter.bind(targetInstance));
        }
    ));
    return descriptor;
}