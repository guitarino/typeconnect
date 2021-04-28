import { create as createComputed } from './Computed';
import { create as createObserved } from './Observed';
import { create as createAPI } from './connect';
import { CyclicError } from './ResolutionVisitor';
import { UpdateManager } from './UpdateManager';
import { DependenciesManager } from './DependenciesManager';
import { NodeCollector } from './NodeCollector';
import type { IComputed } from './Computed.types';
import type { IObserved } from './Observed.types';
import { createConfiguration } from './configuration';

export { CyclicError };

export type { IComputed, IObserved };

const nodeCollector = new NodeCollector();
const dependenciesManager = new DependenciesManager(nodeCollector);
const updateManager = new UpdateManager(dependenciesManager, nodeCollector);

export function create() {
	const configuration = createConfiguration();
	const Computed = createComputed(updateManager, configuration);
	const Observed = createObserved(updateManager, configuration);
	const { connect, connectFactory, connectObject, configureConnect, connectEffect } = createAPI(configuration, updateManager, Computed, Observed);

	return {
		Computed,
		Observed,
		connect,
		connectFactory,
		connectObject,
		configureConnect,
		connectEffect,
		updateManager,
	}
}