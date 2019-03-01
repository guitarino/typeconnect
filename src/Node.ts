import { setNodesUpdateFlag } from "./utils/setNodesUpdateFlag";
import { recalculateAndUpdatedNodeValuesIfNeeded } from "./utils/recalculateAndUpdatedNodeValuesIfNeeded";
import { getDerivedChildrenForNodes } from "./utils/getDerivedChildrenForNodes";
import { insertAndGetNewNodes } from "./utils/insertAndGetNewNodes";
import { NodeUpdateFlag } from "./NodeUpdateFlag";
import { NodesCollector } from "./NodesCollector";
import { Computed } from "./Computed.types";
import { Node } from "./Node.types";

export class NodeClass implements Node {
    protected nodesCollector: NodesCollector;

    constructor(nodesCollector: NodesCollector) {
        this.nodesCollector = nodesCollector;
    }

    public derivedNodes: Computed[] = [];

    public updateFlag: number = NodeUpdateFlag.NotUpdated;

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