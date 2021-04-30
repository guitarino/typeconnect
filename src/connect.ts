import type { INode } from "./Node.types";
import type { create as createComputed } from "./Computed";
import type { create as createObserved } from "./Observed";
import type { UpdateManager } from "./UpdateManager";
import type { Configuration } from './configuration';
import { configureConnect } from './configuration';

type NodeLookup = {
	[k: string]: INode<any>
};

type NewableClass<ConstructorArguments extends Array<any>, ClassInstance> = {
	new (...args: ConstructorArguments): ClassInstance;
};

type PropertyDescriptors = {
	[k: string]: PropertyDescriptor
}

export function create(configuration: Configuration, updateManager: UpdateManager, Computed: ReturnType<typeof createComputed>, Observed: ReturnType<typeof createObserved>) {

	function connect<UserClass extends NewableClass<Array<any>, any>>(userClass: UserClass): UserClass {
		class connectedClass extends userClass {
			constructor(...args) {
				super(...args);
				connectObject(this);
			}
		}
		return connectedClass;
	}

	function connectFactory<A extends Array<any>, R>(factoryFunction: (...args: A) => R): (...args: A) => R {
		return function connectedFactory(...args: A): R {
			const result = factoryFunction(...args);
			connectObject(result);
			return result;
		}
	}

	function connectObject<T extends Object>(object: T): T {
		const nodeLookup = {};
		const propertyDescriptors = getAllPropertyDescriptors(object);
		deleteOwnPropertiesFromObject(object);
		defineConnectedProperties(object, propertyDescriptors, nodeLookup);
		if (configuration.addNodeLookup) {
			defineNodeLookup(object, nodeLookup);
		}
		return object;
	}

	function connectEffect<ComputedValue, Result>(
		calculate: () => ComputedValue,
		effect: (computedValue: ComputedValue) => Result,
	): () => Result {
		const runEffect = (computedValue: ComputedValue) =>
			updateManager.callWithoutCollect(() => effect(computedValue));

		const computed = new Computed(() => {
			const computedValue = calculate();
			runEffect(computedValue);
			return computedValue;
		});

		const returnedEffect = () => runEffect(computed.get());

		if (configuration.addNodeLookup) {
			defineNodeOnEffect(returnedEffect, computed);
		}

		return returnedEffect;
	}

	function deleteOwnPropertiesFromObject(object: Object): void {
		const ownProperties = Object.getOwnPropertyNames(object);
		for (let i = 0; i < ownProperties.length; i++) {
			const p = ownProperties[i];
			delete ownProperties[p];
		}
	}

	function getAllPropertyDescriptors(object: Object): PropertyDescriptors {
		const propertyDescriptors: PropertyDescriptors = {};
		addOwnPropertyDescriptors(object, propertyDescriptors);
		while (object = Object.getPrototypeOf(object)) {
			addOwnPropertyDescriptors(object, propertyDescriptors);
		}
		return propertyDescriptors;
	}

	function addOwnPropertyDescriptors(object: Object, propertyDescriptors: PropertyDescriptors) {
		const propertyNames = Object.getOwnPropertyNames(object);
		for (let i = 0; i < propertyNames.length; i++) {
			const propertyName = propertyNames[i];
			const propertyDescriptor = Object.getOwnPropertyDescriptor(object, propertyName);
			if (propertyDescriptor && !(propertyName in propertyDescriptors)) {
				propertyDescriptors[propertyName] = propertyDescriptor;
			}
		}
	}

	function defineConnectedProperties(object: Object, propertyDescriptors: PropertyDescriptors, nodeLookup: NodeLookup): void {
		const propertyInitializers: Array<Function> = [];
		for (const p in propertyDescriptors) {
			const propertyDescriptor = propertyDescriptors[p];
			const { descriptor, initializer } = createComputedInitializer(object, p, propertyDescriptor, nodeLookup);
			propertyInitializers.push(initializer);
			Object.defineProperty(object, p, descriptor);
		}
		initializeProperties(propertyInitializers);
	}

	function initializeProperties(propertyInitializers: Array<Function>) {
		for (let i = 0; i < propertyInitializers.length; i++) {
			const propertyInitializer = propertyInitializers[i];
			propertyInitializer();
		}
	}

	function defineNodeOnEffect(effect: Object, node: INode<any>) {
		Object.defineProperty(effect, '_node', {
			configurable: true,
			enumerable: false,
			writable: true,
			value: node,
		});
	}

	function defineNodeLookup(object: Object, nodeLookup: NodeLookup) {
		Object.defineProperty(object, '_nodeLookup', {
			configurable: true,
			enumerable: false,
			writable: true,
			value: nodeLookup
		});
	}

	function defineNodeName(node: INode<any>, name: string) {
		Object.defineProperty(node, '_nodeName', {
			configurable: true,
			enumerable: false,
			writable: true,
			value: name
		});
	}

	function createComputedInitializer(object: Object, name: string, propertyDescriptor: PropertyDescriptor, nodeLookup: NodeLookup) {
		let node: INode<any>;
		let isInitialized = false;
		function initializeNodeIfNeeded() {
			if (!isInitialized) {
				if (propertyDescriptor.get) {
					node = new Computed(propertyDescriptor.get.bind(object));
				}
				else {
					node = new Observed(propertyDescriptor.value);
				}
				if (configuration.addPropertyNamesToNodes) {
					defineNodeName(node, name);
				}
				if (configuration.addNodeLookup) {
					nodeLookup[name] = node;
				}
				isInitialized = true;
			}
		}
		return {
			initializer: initializeNodeIfNeeded,
			descriptor: typeof propertyDescriptor.value === 'function'
				? propertyDescriptor
				: {
					configurable: propertyDescriptor.configurable,
					enumerable: propertyDescriptor.enumerable,
					get() {
						initializeNodeIfNeeded();
						return node.get();
					},
					set(newValue) {
						node.set(newValue);
					}
				}
		}
	}

	return {
		connect,
		connectFactory,
		connectObject,
		connectEffect,
		configureConnect: function(newConfiguration: Partial<Configuration>) {
			configureConnect(configuration, newConfiguration);
		},
	}
}