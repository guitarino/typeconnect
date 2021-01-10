import { IComputed } from "./Computed.types";
import { INode } from "./Node.types";
import { UpdateManager } from "./UpdateManager";

export class Observed<T> implements INode<T> {
	private updateManager: UpdateManager;
	public value: T;
	public derivedNodes: IComputed<any>[] = [];

	constructor(value: T) {
		this.updateManager = UpdateManager.get();
		this.updateManager.addObserved(this, value);
	}

	public set(newValue: T) {
		this.updateManager.set(this, newValue);
	}

	public get() {
		return this.updateManager.get(this);
	}
}