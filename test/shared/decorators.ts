export function observed(target, property, descriptor) {
    console.log('observed', {
        target, property, descriptor
    });
    if (descriptor.initializer) {
        delete descriptor.initializer;
    }
}

export function computed(target, property, descriptor) {
    console.log('computed', {
        target, property, descriptor
    });
}

export function connect(target) {
    console.log('Connect start');
    console.log(target);
    console.log('Connect end');
    return function() {
        debugger;
    }
}