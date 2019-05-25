import { Node } from "./Node";
import { Computed } from "./Computed";
import { Observed } from ".";
import { NewableClass, PropertyDescriptors } from "./connect.types";

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
    const propertyDescriptors = getAllPropertyDescriptors(object);
    deleteOwnPropertiesFromObject(object);
    defineConnectedProperties(object, propertyDescriptors);
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

function defineConnectedProperties(object: Object, propertyDescriptors: PropertyDescriptors): void {
    const propertyInitializers: Array<Function> = [];
    for (let p in propertyDescriptors) {
        const propertyDescriptor = propertyDescriptors[p];
        const { descriptor, initializer } = createComputedInitializer(object, propertyDescriptor);
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

function createComputedInitializer(object: Object, propertyDescriptor: PropertyDescriptor) {
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