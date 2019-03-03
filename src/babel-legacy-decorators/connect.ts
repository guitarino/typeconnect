import { getPropertyInitializers, deletePropertyInitializers } from "./propertyInitialiers";

export function connect(target: Object) {
    const propertyInitializers = getPropertyInitializers(target.constructor.prototype);
    const nodeInitializers: Function[] = [];
    for (let i = 0; i < propertyInitializers.length; i++) {
        const initilizePropertyAndGetNodeInitializer = propertyInitializers[i];
        nodeInitializers.push(initilizePropertyAndGetNodeInitializer(target));
    }
    for (let i = 0; i < nodeInitializers.length; i++) {
        const initializeNode = nodeInitializers[i];
        initializeNode();
    }
    deletePropertyInitializers(target.constructor.prototype);
}