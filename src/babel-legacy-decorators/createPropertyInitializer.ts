import { Node } from "../Node.types";
import { createPropertyInitializerOptions } from "../decorators.types";

export function createPropertyInitializer({
    property,
    enumerable,
    configurable,
    shouldSaveValue,
    createAndGetNode
}: createPropertyInitializerOptions) {
    return function populateSettersGettersAndGetNodeInitializer(target: Object) {
        let isInitialized = false;
        let node: Node;
        let value;
        if (shouldSaveValue) {
            value = target[property];
            delete target[property];
        }
        function initializeNodeIfNeeded() {
            if (!isInitialized) {
                node = createAndGetNode(target, value);
                isInitialized = true;
            }
        }
        Object.defineProperty(target, property, {
            enumerable: enumerable,
            configurable: configurable,
            get() {
                initializeNodeIfNeeded();
                return node.getValue();
            },
            set(newValue) {
                node.setValue(newValue);
            }
        });
        return initializeNodeIfNeeded;
    }
}