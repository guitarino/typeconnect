import { Node } from "./Node";
import { Observed as IObserved } from "./Observed.types";
import { NodesCollector as INodesCollector } from "./NodesCollector.types";

export class Observed extends Node implements IObserved {
    constructor(nodesCollector: INodesCollector, value: any) {
        super(nodesCollector);
        this.value = value;
    }
}