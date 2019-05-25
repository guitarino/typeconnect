import { lastArrayItem } from "./utils/lastArrayItem";
import { Node as INode } from "./Node.types";
import { NodesCollector as INodesCollector } from "./NodesCollector.types";
import { addUniqueItemToArray } from "./utils/addUniqueItemToArray";

export class NodesCollector implements INodesCollector {
    static instance: INodesCollector;

    static get() {
        if (!NodesCollector.instance) {
            NodesCollector.instance = new NodesCollector();
        }
        return NodesCollector.instance;
    }

    private collectedStack: INode<any>[][] = [];

    start() {
        const collectedNodes = [];
        this.collectedStack.push(collectedNodes);
    }

    collect<T>(node: INode<T>) {
        if (!this.collectedStack.length) {
            return;
        }
        const lastCollected = lastArrayItem(this.collectedStack);
        addUniqueItemToArray(node, lastCollected);
    }

    stop() {
        const lastCollectedNodes = this.collectedStack.pop();
        if (lastCollectedNodes) {
            return lastCollectedNodes;
        }
        return [];
    }
}