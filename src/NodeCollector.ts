import { INode } from "./Node.types";
import { addUniqueItemToArray, lastArrayItem } from "./utils";

export class NodeCollector {
	
	private collectedStack: INode<any>[][] = [];

	start() {
		const collectedNodes = [];
		this.collectedStack.push(collectedNodes);
	}

	collect(node: INode<any>) {
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