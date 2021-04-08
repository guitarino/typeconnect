import type { IComputed } from "./Computed.types";
import type { DependenciesManager } from "./DependenciesManager";
import type { INode } from "./Node.types";
import { ResolutionVisitor } from "./ResolutionVisitor";

export class SingleUpdateManger {
	private dependenciesManager: DependenciesManager;
	private resolutionVisitor: ResolutionVisitor;
	private scheduledNodes: INode<any>[] = [];
	private modifiedNodes: INode<any>[] = [];

	constructor(dependenciesManager: DependenciesManager, scheduledNodes: INode<any>[], modifiedNodes: INode<any>[]) {
		this.dependenciesManager = dependenciesManager;
		this.resolutionVisitor = new ResolutionVisitor();
		this.scheduledNodes = scheduledNodes;
		this.modifiedNodes = modifiedNodes;
	}

	public update() {
		for (let i = 0; i < this.scheduledNodes.length; i++) {
			const scheduledNode = this.modifiedNodes[i];
			for (let j = 0; j < scheduledNode.derivedNodes.length; j++) {
				this.visitNode(scheduledNode.derivedNodes[j]);
			}
		}
		this.recalculateDerviedNodes(this.resolutionVisitor.getResolved());
	}

	private visitNode(node: IComputed<any>) {
		if (!this.resolutionVisitor.shouldEnter(node)) {
			return;
		}
		this.resolutionVisitor.pre(node);
		for (let i = 0; i < node.derivedNodes.length; i++) {
			this.visitNode(node.derivedNodes[i]);
		}
		this.resolutionVisitor.post(node);
	}

	private recalculateDerviedNodes(derivedNodes: IComputed<any>[]) {
		for (let i = 0; i < derivedNodes.length; i++) {
			const derived = derivedNodes[i];
			this.recalculateValueAndUpdateIfNeeded(derived);
		}
	}

	private recalculateValueAndUpdateIfNeeded(node: IComputed<any>) {
		if (this.isAtLeastOneDependencyChanged(node)) {
			const newValue = this.dependenciesManager.calculateValueAndDependencies(node);
			if (node.value !== newValue) {
				node.value = newValue;
				this.modifiedNodes.push(node);
			}
		}
	}

	private isAtLeastOneDependencyChanged(node: IComputed<any>) {
		for (let i = 0; i < node.dependencies.length; i++) {
			const dependency = node.dependencies[i];
			if (this.modifiedNodes.indexOf(dependency) >= 0) {
				return true;
			}
		}
		return false;
	}
}