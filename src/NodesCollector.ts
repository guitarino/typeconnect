import { lastArrayItem } from "./utils/lastArrayItem";
import { Node } from "./Node.types";

export class NodesCollector {
    static instance: NodesCollector;

    static get() {
        if (NodesCollector.instance) {
            return NodesCollector.instance;
        }
        else {
            return new NodesCollector();
        }
    }

    collectedStack: Array<Array<Node>> = [];

    start() {
        const collectedNodes = [];
        this.collectedStack.push(collectedNodes);
    }

    collect(node: Node) {
        if (!this.collectedStack.length) {
            return;
        }
        lastArrayItem(this.collectedStack).push(node);
    }

    stop() {
        const lastCollectedNodes = this.collectedStack.pop();
        if (lastCollectedNodes) {
            return lastCollectedNodes;
        }
        return [];
    }
}