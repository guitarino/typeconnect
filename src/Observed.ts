import { NodeClass } from "./Node";
import { Observed } from "./Observed.types";
import { NodesCollector } from "./NodesCollector";

export class ObservedClass extends NodeClass implements Observed {
    constructor(nodesCollector: NodesCollector, value: any) {
        super(nodesCollector);
        this.value = value;
    }
}