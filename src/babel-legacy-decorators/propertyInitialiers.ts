const PROPERTY_INITILIZERS = '_typeConnectPropertyInitializers';

export function getPropertyInitializers(target: Object) {
    if (!target[PROPERTY_INITILIZERS]) {
        target[PROPERTY_INITILIZERS] = [];
    }
    return target[PROPERTY_INITILIZERS];
}

export function deletePropertyInitializers(target: Object) {
    delete target[PROPERTY_INITILIZERS];
}