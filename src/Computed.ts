import { Node as INode } from "./Node.types";
import { Computed as IComputed } from "./Computed.types";
import { NodeUpdateFlag } from "./NodeUpdateFlag";
import { Node } from "./Node";
import { addUniqueItemToArray } from "./utils/addUniqueItemToArray";
import { removeItemFromArrayIfExists } from "./utils/removeItemFromArrayIfExists";

export class Computed<T> extends Node<T> implements IComputed<T> {
	public value: T;
	public calculateValue: () => T;
	public dependencies: INode<any>[] = [];

	constructor(calculateValue: () => T) {
		super();
		this.calculateValue = calculateValue;

		// Calculate initial value:
		this.nodesCollector.start();
		const newValue = this.calculateValue();
		this.setDependencies(this.nodesCollector.stop());
		this.value = newValue;
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
			this.nodesCollector.start();
			const newValue = this.calculateValue();
			this.setDependencies(this.nodesCollector.stop());
			if (this.value !== newValue) {
				this.value = newValue;
				this.updateFlag = NodeUpdateFlag.Updated;
			}
		}
	}

	private setDependencies(newDependencies) {
		this.removeFromDerivedListOfDependencies();
		this.dependencies = newDependencies;
		this.addToDerivedListOfDependencies();
	}

	private removeFromDerivedListOfDependencies() {
		for (let i = 0; i < this.dependencies.length; i++) {
			const dependency = this.dependencies[i];
			removeItemFromArrayIfExists(this, dependency.derivedNodes);
		}
	}

	private addToDerivedListOfDependencies() {
		for (let i = 0; i < this.dependencies.length; i++) {
			const dependency = this.dependencies[i];
			addUniqueItemToArray(this, dependency.derivedNodes);
		}
	}
}