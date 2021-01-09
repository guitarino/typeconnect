import { INode } from "./Node.types";

export interface IComputed<T> extends INode<T> {
	calculate: () => T;
	dependencies: INode<any>[];
}