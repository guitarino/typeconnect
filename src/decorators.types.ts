import { Node } from "./Node.types";

export type createAndGetNode = (targetInstance: Object, value?: any) => Node;

export type createPropertyInitializerOptions = {
    property: string,
    enumerable: boolean,
    configurable: boolean,
    shouldSaveValue: boolean,
    createAndGetNode: createAndGetNode
};