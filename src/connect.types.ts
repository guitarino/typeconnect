export type NewableClass<ConstructorArguments extends Array<any>, ClassInstance> = {
    new (...args: ConstructorArguments): ClassInstance;
};

export type PropertyDescriptors = {
    [k: string]: PropertyDescriptor
}