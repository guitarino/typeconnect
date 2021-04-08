import { create as createComputed } from './Computed';
import { create as createObserved } from './Observed';
import { create as createAPI } from './connect';
import { CyclicError } from './ResolutionVisitor';
import { UpdateManager } from './UpdateManager';
import { DependenciesManager } from './DependenciesManager';
import { NodeCollector } from './NodeCollector';
import type { IComputed } from './Computed.types';
import type { IObserved } from './Observed.types';

export { CyclicError };

export type { IComputed, IObserved };

export function create() {
	const nodeCollector = new NodeCollector();
	const dependenciesManager = new DependenciesManager(nodeCollector);
	const updateManager = new UpdateManager(dependenciesManager, nodeCollector);
	const Computed = createComputed(updateManager);
	const Observed = createObserved(updateManager);
	const { connect, connectFactory, connectObject, configureConnect } = createAPI(Computed, Observed);

	return {
		Computed,
		Observed,
		connect,
		connectFactory,
		connectObject,
		configureConnect,
		updateManager,
	}
}