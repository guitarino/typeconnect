import { Node } from "../Node.types";
import { createAndGetNode } from "../decorators.types";

export function createPropertyInitializer(
    property: string,
    enumerable: boolean,
    configurable: boolean,
    createAndGetNode: createAndGetNode
) {
    return function populateSettersGettersAndGetNodeInitializer(target: Object, shouldSaveValue: boolean) {
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