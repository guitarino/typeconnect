import { Node } from "./Node";
import { Computed } from "./Computed";
import { Observed } from ".";
import { NewableClass, PropertyDescriptors, Configuration, NodeLookup } from "./connect.types";

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
            connectConstructor(this);
        }
    }
    return connectedClass;
}

function connectConstructor(object: Object): void {
    const nodeLookup = {};
    const propertyDescriptors = getAllPropertyDescriptors(object);
    deleteOwnPropertiesFromObject(object);
    defineConnectedProperties(object, propertyDescriptors, nodeLookup);
    if (configuration.addNodeLookupToClass) {
        defineNodeLookup(object, nodeLookup);
    }
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

function defineNodeName(node: Node<any>, name: string) {
    Object.defineProperty(node, '_nodeName', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: name
    });
}

function createComputedInitializer(object: Object, name: string, propertyDescriptor: PropertyDescriptor, nodeLookup: NodeLookup) {
    let node: Node<any>;
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
                    return node.getValue();
                },
                set(newValue) {
                    node.setValue(newValue);
                }
            }
    }
}