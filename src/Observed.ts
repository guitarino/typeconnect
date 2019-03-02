import { Node } from "./Node";
import { Observed as IObserved } from "./Observed.types";

export class Observed extends Node implements IObserved {
    constructor(value: any) {
        super();
        this.value = value;
    }
}