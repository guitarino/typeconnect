import { INode } from "./Node.types";
import { Computed } from "./Computed";
import { Observed } from "./Observed";

type NodeLookup = {
	[k: string]: INode<any>
};

type Configuration = {
	addPropertyNamesToNodes: boolean,
	addNodeLookupToClass: boolean,
};

type NewableClass<ConstructorArguments extends Array<any>, ClassInstance> = {
	new (...args: ConstructorArguments): ClassInstance;
};

type PropertyDescriptors = {
	[k: string]: PropertyDescriptor
}

const configuration: Configuration = {
	addPropertyNamesToNodes: false,
	addNodeLookupToClass: false,
};

export function configureConnect(newConfiguration: Partial<Configuration>) {
	if (newConfiguration.addPropertyNamesToNodes) {
		configuration.addPropertyNamesToNodes = newConfiguration.addPropertyNamesToNodes;
	}
	if (newConfiguration.addNodeLookupToClass) {
		configuration.addNodeLookupToClass = newConfiguration.addNodeLookupToClass;
	}
}

export function connect<UserClass extends NewableClass<Array<any>, any>>(userClass: UserClass): UserClass {
	class connectedClass extends userClass {
		constructor(...args) {
			super(...args);
			connectObject(this);
		}
	}
	return connectedClass;
}

export function connectFactory<A extends Array<any>, R>(factoryFunction: (...args: A) => R): (...args: A) => R {
	return function connectedFactory(...args: A): R {
		const result = factoryFunction(...args);
		connectObject(result);
		return result;
	}
}

export function connectObject<T extends Object>(object: T): T {
	const nodeLookup = {};
	const propertyDescriptors = getAllPropertyDescriptors(object);
	deleteOwnPropertiesFromObject(object);
	defineConnectedProperties(object, propertyDescriptors, nodeLookup);
	if (configuration.addNodeLookupToClass) {
		defineNodeLookup(object, nodeLookup);
	}
	return object;
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
	for (let p in propertyDescriptors) {
		const propertyDescriptor = propertyDescriptors[p];
		const { descriptor, initializer } = createComputedInitializer(object, p, propertyDescriptor, nodeLookup);
		propertyInitializers.push(initializer);
		Object.defineProperty(object, p, descriptor);
	}
	initializeProperties(object, propertyInitializers);
}

function initializeProperties(object: Object, propertyInitializers: Array<Function>) {
	for (let i = 0; i < propertyInitializers.length; i++) {
		const propertyInitializer = propertyInitializers[i];
		propertyInitializer();
	}
}

function defineNodeLookup(object: Object, nodeLookup: NodeLookup) {
	Object.defineProperty(object, '_nodeLookup', {
		configurable: true,
		enumerable: true,
		writable: true,
		value: nodeLookup
	});
}

function defineNodeName(node: INode<any>, name: string) {
	Object.defineProperty(node, '_nodeName', {
		configurable: true,
		enumerable: true,
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
			else if (typeof propertyDescriptor.value === 'function') {
				node = new Computed(propertyDescriptor.value.bind(object));
			}
			else {
				node = new Observed(propertyDescriptor.value);
			}
			if (configuration.addPropertyNamesToNodes) {
				defineNodeName(node, name);
			}
			if (configuration.addNodeLookupToClass) {
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