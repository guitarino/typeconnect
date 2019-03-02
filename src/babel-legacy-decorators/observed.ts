import { Observed } from "../Observed";
import { createPropertyInitializer } from "./shared";

export const OBSERVED_INITIALIZERS = '_typeConnectObservedInitializers';

function createAndGetObservedNode(_targetInstance: Object, value: any) {
    return new Observed(value);
}

export const observed: any = (
    target,
    property,
    descriptor
) => {
    if (!target[OBSERVED_INITIALIZERS]) {
        target[OBSERVED_INITIALIZERS] = [];
    }
    target[OBSERVED_INITIALIZERS].push(createPropertyInitializer(
        property,
        descriptor.enumerable,
        descriptor.configurable,
        createAndGetObservedNode
    ));
    return descriptor;
}