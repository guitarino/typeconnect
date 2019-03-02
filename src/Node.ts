import { setNodesUpdateFlag } from "./utils/setNodesUpdateFlag";
import { recalculateAndUpdatedNodeValuesIfNeeded } from "./utils/recalculateAndUpdatedNodeValuesIfNeeded";
import { getDerivedChildrenForNodes } from "./utils/getDerivedChildrenForNodes";
import { insertAndGetNewNodes } from "./utils/insertAndGetNewNodes";
import { NodeUpdateFlag } from "./NodeUpdateFlag";
import { NodesCollector } from "./NodesCollector";
import { NodesCollector as INodesCollector } from "./NodesCollector.types";
import { Computed as IComputed } from "./Computed.types";
import { Node as INode } from "./Node.types";

export class Node implements INode {
    public value: any;
    public derivedNodes: IComputed[] = [];
    public updateFlag: number = NodeUpdateFlag.NotUpdated;
    protected nodesCollector: INodesCollector;

    constructor() {
        this.nodesCollector = NodesCollector.get();
    }

    public getValue() {
        this.nodesCollector.collect(this);
        return this.value;
    }

    public setValue(newValue) {
        if (this.value !== newValue) {
            this.value = newValue;
            this.updateFlag = NodeUpdateFlag.Updated;
            this.recalculateDerived();
            this.updateFlag = NodeUpdateFlag.NotUpdated;
        }
    }

    private recalculateDerived() {
        const derivedDescendents = this.getDerivedDescendents();
        setNodesUpdateFlag(derivedDescendents, NodeUpdateFlag.Unknown);
        recalculateAndUpdatedNodeValuesIfNeeded(derivedDescendents);
        setNodesUpdateFlag(derivedDescendents, NodeUpdateFlag.NotUpdated);
    }

    private getDerivedDescendents() {
        let parents: INode[] = [this];
        const derivedDescendents: IComputed[] = [];
        while (parents.length) {
            const derivedChildren = getDerivedChildrenForNodes(parents);
            parents = insertAndGetNewNodes(derivedDescendents, derivedChildren);
        }
        return derivedDescendents;
    }
}