import { IComputed } from "./Computed.types";
import { INode } from "./Node.types";
import { UpdateManager } from "./UpdateManager";

export class Computed<T> implements IComputed<T> {
	private updateManager: UpdateManager;
	public value: T;
	public derivedNodes: IComputed<any>[] = [];
	public calculate: () => T;
	public dependencies: INode<any>[] = [];

	constructor(calculate: () => T) {
		this.updateManager = UpdateManager.get();
		this.updateManager.addComputed(this, calculate);
	}

	public set(newValue: T) {
		this.updateManager.set(this, newValue);
	}

	public get() {
		return this.updateManager.get(this);
	}
}