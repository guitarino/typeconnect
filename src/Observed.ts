import { Node } from "./Node";
import { Observed as IObserved } from "./Observed.types";

export class Observed<T> extends Node<T> implements IObserved<T> {
    public value: T;
    
    constructor(value: any) {
        super();
        this.value = value;
    }
}