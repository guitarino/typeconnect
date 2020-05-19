import { setNodesUpdateFlag } from "./utils/setNodesUpdateFlag";
import { recalculateAndUpdatedNodeValuesIfNeeded } from "./utils/recalculateAndUpdatedNodeValuesIfNeeded";
import { visitToDeriveDescendents } from "./utils/visitToDeriveDescendents";
import { NodeUpdateFlag } from "./NodeUpdateFlag";
import { NodesCollector } from "./NodesCollector";
import { NodesCollector as INodesCollector } from "./NodesCollector.types";
import { Computed as IComputed } from "./Computed.types";
import { Node as INode } from "./Node.types";

export abstract class Node<T> implements INode<T> {
    public abstract value: T;
    public derivedNodes: IComputed<any>[] = [];
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
        const derivedDescendents: IComputed<any>[] = [];
        const visitingDescendents: IComputed<any>[] = [];
        const visitedDescendents: IComputed<any>[] = [];
        for (let i = 0; i < this.derivedNodes.length; i++) {
            visitToDeriveDescendents(this.derivedNodes[i], derivedDescendents, visitingDescendents, visitedDescendents);
        }
        return derivedDescendents;
    }
}