import type { INode } from "./Node.types";

export type Configuration = {
	addPropertyNamesToNodes: boolean,
	addNodeLookup: boolean,
	setCallback: null | ((node: INode<unknown>, value: unknown) => any),
};

export function createConfiguration(): Configuration {
	return {
		addPropertyNamesToNodes: false,
		addNodeLookup: false,
		setCallback: null,
	};
}

export function configureConnect(configuration: Configuration, newConfiguration: Partial<Configuration>) {
	if (newConfiguration.addPropertyNamesToNodes !== undefined) {
		configuration.addPropertyNamesToNodes = newConfiguration.addPropertyNamesToNodes;
	}
	if (newConfiguration.addNodeLookup !== undefined) {
		configuration.addNodeLookup = newConfiguration.addNodeLookup;
	}
	if (newConfiguration.setCallback !== undefined) {
		configuration.setCallback = newConfiguration.setCallback;
	}
}