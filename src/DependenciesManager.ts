import type { IComputed } from "./Computed.types";
import type { INode } from "./Node.types";
import type { NodeCollector } from "./NodeCollector";
import { addUniqueItemToArray, removeItemFromArrayIfExists } from "./utils";

export class DependenciesManager {
	
	private nodeCollector: NodeCollector;

	constructor(nodeCollector: NodeCollector) {
		this.nodeCollector = nodeCollector;
	}

	public calculateValueAndDependencies(node: IComputed<any>) {
		this.nodeCollector.start();
		const newValue = node.calculate();
		this.setDependencies(node, this.nodeCollector.stop());
		return newValue;
	}

	private setDependencies(node: IComputed<any>, newDependencies: INode<any>[]) {
		this.removeFromDerivedListOfDependencies(node);
		node.dependencies = newDependencies;
		this.addToDerivedListOfDependencies(node);
	}

	private removeFromDerivedListOfDependencies(node: IComputed<any>) {
		for (let i = 0; i < node.dependencies.length; i++) {
			const dependency = node.dependencies[i];
			removeItemFromArrayIfExists(node, dependency.derivedNodes);
		}
	}

	private addToDerivedListOfDependencies(node: IComputed<any>) {
		for (let i = 0; i < node.dependencies.length; i++) {
			const dependency = node.dependencies[i];
			addUniqueItemToArray(node, dependency.derivedNodes);
		}
	}
}