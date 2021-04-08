import { IComputed } from "./Computed.types";
import { IObserved } from "./Observed.types";
import { UpdateManager } from "./UpdateManager";

export function create(updateManager: UpdateManager) {

	return class Observed<T> implements IObserved<T> {
		public value: T;
		public derivedNodes: IComputed<any>[] = [];

		constructor(value: T) {
			updateManager.addObserved(this, value);
		}

		public set(newValue: T) {
			updateManager.set(this, newValue);
		}

		public get() {
			return updateManager.get(this);
		}
	}
}