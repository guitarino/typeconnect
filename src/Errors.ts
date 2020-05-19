import { Computed } from "./Computed.types";

export class CyclicError extends Error {
    public path: Computed<any>[];

    constructor(path: Computed<any>[]) {
        super(`Dependency path is cyclic. See this error's "path" property for the path details.`);
        this.path = path;
    }
}