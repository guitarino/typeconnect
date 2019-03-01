import { Observed } from "../Observed";
import { NodesCollector } from "../NodesCollector";

function initializeObserved(target: Object, property: string, defaultValue: any) {
    const observedNode = new Observed(NodesCollector.get(), defaultValue);
    Object.defineProperty(target, property, {
        get() {
            return observedNode.getValue();
        },
        set(newValue) {
            observedNode.setValue(newValue);
        }
    });
}

export function observed(_target, property, descriptor) {
    return {
        configurable: descriptor.configurable,
        enumerable: descriptor.enumerable,
        initializer(...args) {
            debugger;
            const defaultValue = ('value' in descriptor) ?
                descriptor.value :
                descriptor.initializer.apply(this, args);
            initializeObserved(this, property, defaultValue);
        }
    }
}