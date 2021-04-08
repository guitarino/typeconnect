import { IComputed } from "./Computed.types";
import { INode } from "./Node.types";
import { UpdateManager } from "./UpdateManager";

export function create(updateManager: UpdateManager) {

	return class Computed<T> implements IComputed<T> {
		public value: T;
		public derivedNodes: IComputed<any>[] = [];
		public calculate: () => T;
		public dependencies: INode<any>[] = [];

		constructor(calculate: () => T) {
			updateManager.addComputed(this, calculate);
		}

		public set(newValue: T) {
			updateManager.set(this, newValue);
		}

		public get() {
			return updateManager.get(this);
		}
	}
}