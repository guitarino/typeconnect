import { NodesCollector } from "./NodesCollector";
import { Node } from "./Node.types";
import { Computed } from "./Computed.types";
import { setNodesUpdateFlag } from "./utils/setNodesUpdateFlag";
import { recalculateAndUpdatedNodeValuesIfNeeded } from "./utils/recalculateAndUpdatedNodeValuesIfNeeded";
import { getDerivedChildrenForNodes } from "./utils/getDerivedChildrenForNodes";
import { insertAndGetNewNodes } from "./utils/insertAndGetNewNodes";
import { NodeUpdateFlag } from "./NodeUpdateFlag";

export class ComputedClass extends NodeClass implements Computed {
    private nodesCollector: NodesCollector;

    constructor(nodesCollector: NodesCollector, calculateValue: () => any) {
        this.nodesCollector = nodesCollector;
        this.calculateValue = calculateValue;
        this.recalculateValueAndUpdate();
    }

    public calculateValue: () => any;

    public updateFlag: number = NodeUpdateFlag.NotUpdated;

    public dependencies: Node[] = [];

    public derivedNodes: Computed[] = [];

    public value: any;

    public getValue() {
        this.nodesCollector.collect(this);
        return this.value;
    }

    public setValue(newValue) {
        if (this.value !== newValue) {
            this.value = newValue;
            this.updateFlag = NodeUpdateFlag.Updated;
            this.recalculateDerived();
        }
    }

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
            this.recalculateValueAndUpdate();
        }
    }

    private recalculateValueAndUpdate() {
        this.nodesCollector.start();
        const newValue = this.calculateValue();
        this.dependencies = this.nodesCollector.stop();
        if (this.value !== newValue) {
            this.value = newValue;
            this.updateFlag = NodeUpdateFlag.Updated;
        }
    }

    private recalculateDerived() {
        const derivedDescendents = this.getDerivedDescendents();
        setNodesUpdateFlag(derivedDescendents, NodeUpdateFlag.Unknown);
        recalculateAndUpdatedNodeValuesIfNeeded(derivedDescendents);
        setNodesUpdateFlag(derivedDescendents, NodeUpdateFlag.NotUpdated);
    }

    private getDerivedDescendents() {
        let parents: Node[] = [this];
        const derivedDescendents: Computed[] = [];
        while (parents.length) {
            const derivedChildren = getDerivedChildrenForNodes(parents);
            parents = insertAndGetNewNodes(derivedDescendents, derivedChildren);
        }
        return derivedDescendents;
    }
}