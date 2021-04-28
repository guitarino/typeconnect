import { IComputed } from "./Computed.types";
import { IObserved } from "./Observed.types";
import type { Configuration } from "./configuration";
import type { UpdateManager } from "./UpdateManager";

export function create(updateManager: UpdateManager, configuration: Configuration) {

	return class Observed<T> implements IObserved<T> {
		public value: T;
		public derivedNodes: IComputed<any>[] = [];

		constructor(value: T) {
			updateManager.addObserved(this, value);
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