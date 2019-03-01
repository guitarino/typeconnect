import { Computed } from "../Computed";
import { NodesCollector } from "../NodesCollector";

function initializeComputed(target: Object, property: string, defaultComputeValue: () => any) {
    const computedNode = new Computed(NodesCollector.get(), defaultComputeValue);
    Object.defineProperty(target, property, {
        get() {
            return computedNode.getValue();
        },
        set(newValue) {
            computedNode.setValue(newValue);
        }
    });
}

export function computed(_target, property, descriptor) {
    return {
        configurable: descriptor.configurable,
        enumerable: descriptor.enumerable,
        initializer() {
            debugger;
            const defaultComputeValue = descriptor.get.bind(this);
            initializeComputed(this, property, defaultComputeValue);
        }
    }
}