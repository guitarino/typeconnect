import { Computed } from "../Computed";
import { getPropertyInitializers } from "./propertyInitialiers";
import { createPropertyInitializer } from "./createPropertyInitializer";

export const computed: any = (
    target,
    property,
    descriptor
) => {
    const getter = descriptor.get;
    const propertyInitializers = getPropertyInitializers(target.constructor.prototype);
    propertyInitializers.push(createPropertyInitializer({
        property,
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
        shouldSaveValue: false,
        createAndGetNode: function createAndGetComputedNode(targetInstance) {
            return new Computed(getter.bind(targetInstance));
        }
    }));
    return descriptor;
}