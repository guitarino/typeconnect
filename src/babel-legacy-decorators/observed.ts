import { Observed } from "../Observed";
import { getPropertyInitializers } from "./propertyInitialiers";
import { createPropertyInitializer } from "./createPropertyInitializer";

function createAndGetObservedNode(_targetInstance: Object, value: any) {
    return new Observed(value);
}

export const observed: any = (
    target,
    property,
    descriptor
) => {
    const propertyInitializers = getPropertyInitializers(target.constructor.prototype);
    propertyInitializers.push(createPropertyInitializer({
        property,
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
        shouldSaveValue: true,
        createAndGetNode: createAndGetObservedNode
    }));
    return descriptor;
}