import { OBSERVED_INITIALIZERS } from "./observed";
import { COMPUTED_INITIALIZERS } from "./computed";

export function connect(target: Object) {
    const observedInitializers = target.constructor.prototype[OBSERVED_INITIALIZERS];
    const computedInitializers = target.constructor.prototype[COMPUTED_INITIALIZERS];
    const nodeInitializers: Function[] = [];
    for (let i = 0; i < observedInitializers.length; i++) {
        const initilizePropertyAndGetNodeInitializer = observedInitializers[i];
        nodeInitializers.push(initilizePropertyAndGetNodeInitializer(target, true));
    }
    for (let i = 0; i < computedInitializers.length; i++) {
        const initilizePropertyAndGetNodeInitializer = computedInitializers[i];
        nodeInitializers.push(initilizePropertyAndGetNodeInitializer(target, false));
    }
    for (let i = 0; i < nodeInitializers.length; i++) {
        const initializeNode = nodeInitializers[i];
        initializeNode();
    }
}