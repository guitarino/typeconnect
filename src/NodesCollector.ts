import { lastArrayItem } from "./utils/lastArrayItem";
import { Node as INode } from "./Node.types";
import { NodesCollector as INodesCollector } from "./NodesCollector.types";

export class NodesCollector implements INodesCollector {
    static instance: INodesCollector;

    static get() {
        if (!NodesCollector.instance) {
            NodesCollector.instance = new NodesCollector();
        }
        return NodesCollector.instance;
    }

    private collectedStack: INode[][] = [];

    start() {
        const collectedNodes = [];
        this.collectedStack.push(collectedNodes);
    }

    collect(node: INode) {
        if (!this.collectedStack.length) {
            return;
        }
        lastArrayItem(this.collectedStack).push(node);
    }

    stop() {
        if (!this.collectedStack.length) {
            return [];
        }
        const lastCollectedNodes = this.collectedStack.pop();
        if (lastCollectedNodes) {
            return lastCollectedNodes;
        }
        return [];
    }
}