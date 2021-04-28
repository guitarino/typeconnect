import type { IComputed } from "./Computed.types";
import type { INode } from "./Node.types";
import type { Configuration } from "./configuration";
import type { UpdateManager } from "./UpdateManager";

export function create(updateManager: UpdateManager, configuration: Configuration) {

	return class Computed<T> implements IComputed<T> {
		public value: T;
		public derivedNodes: IComputed<any>[] = [];
		public calculate: () => T;
		public dependencies: INode<any>[] = [];

		constructor(calculate: () => T) {
			updateManager.addComputed(this, calculate);
		}

		public set(newValue: T) {
			if (configuration.setCallback) {
				configuration.setCallback(this, newValue);
			}
			updateManager.set(this, newValue);
		}

		public get() {
			return updateManager.get(this);
		}
	}
}