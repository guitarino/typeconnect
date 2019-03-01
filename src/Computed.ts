import { NodesCollector } from "./NodesCollector";
import { Node } from "./Node.types";
import { Computed } from "./Computed.types";
import { NodeUpdateFlag } from "./NodeUpdateFlag";
import { NodeClass } from "./Node";

export class ComputedClass extends NodeClass implements Computed {
    constructor(nodesCollector: NodesCollector, calculateValue: () => any) {
        super(nodesCollector);
        this.calculateValue = calculateValue;
        this.recalculateValueAndUpdate();
    }

    public calculateValue: () => any;

    public dependencies: Node[] = [];

    private isAtLeastOneDependencyChanged() {
        for (let i = 0; i < this.dependencies.length; i++) {
            const dependency = this.dependencies[i];
            if (dependency.updateFlag === NodeUpdateFlag.Updated) {
                return true;
            }
        }
        return false;
    }

    public recalculateValueAndUpdateIfNeeded() {
        if (this.isAtLeastOneDependencyChanged()) {
            this.nodesCollector.start();
            const newValue = this.calculateValue();
            this.dependencies = this.nodesCollector.stop();
            if (this.value !== newValue) {
                this.value = newValue;
                this.updateFlag = NodeUpdateFlag.Updated;
            }
        }
    }

    private recalculateValueAndUpdate() {
        this.nodesCollector.start();
        const newValue = this.calculateValue();
        this.dependencies = this.nodesCollector.stop();
        this.value = newValue;
    }
}