import { IComputed } from "./Computed.types";

export interface INode<T> {
	value: T;
	derivedNodes: IComputed<any>[];
	set(newValue: T): void;
	get(): T;
}