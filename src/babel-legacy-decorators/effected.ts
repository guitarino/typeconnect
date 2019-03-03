import { Computed } from "../Computed";
import { getPropertyInitializers } from "./propertyInitialiers";

export const effected: any = (
    target,
    property,
    descriptor
) => {
    const propertyInitializers = getPropertyInitializers(target.constructor.prototype);
    propertyInitializers.push(
        function initilizePropertyAndGetNodeInitializer(targetInstance: Object) {
            return function initializeNode() {
                return new Computed(targetInstance[property].bind(targetInstance));
            }
        }
    );
    return descriptor;
}