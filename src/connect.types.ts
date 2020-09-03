import { Node } from "./Node.types";

export type NodeLookup = {
	[k: string]: Node<any>
};

export type Configuration = {
	addPropertyNamesToNodes: boolean,
	addNodeLookupToClass: boolean,
};

export type NewableClass<ConstructorArguments extends Array<any>, ClassInstance> = {
	new (...args: ConstructorArguments): ClassInstance;
};

export type PropertyDescriptors = {
	[k: string]: PropertyDescriptor
}