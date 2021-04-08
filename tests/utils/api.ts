import { CyclicError, create } from '../../src/index';
import type { IComputed, IObserved } from '../../src/index';

export { CyclicError };

export type { IComputed, IObserved };

const { 
    Computed,
    Observed,
    connect,
    connectFactory,
    connectObject,
    configureConnect,
    updateManager
} = create();

export {
    Computed,
    Observed,
    connect,
    connectFactory,
    connectObject,
    configureConnect,
    updateManager,
}