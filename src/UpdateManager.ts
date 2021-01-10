import { IComputed } from "./Computed.types";
import { INode } from "./Node.types";
import { NodeCollector } from "./NodeCollector";
import { ResolutionVisitor } from "./ResolutionVisitor";
import { addUniqueItemToArray, removeItemFromArrayIfExists } from "./utils";

function scheduleDefault(update: () => any) {
	return setTimeout(() => {
		update();
	}, 0);
}

function cancelDefault(id: any) {
	return clearTimeout(id);
}

export class UpdateManager {
	private static instance: UpdateManager;

	static get() {
		if (!UpdateManager.instance) {
			UpdateManager.instance = new UpdateManager();
		}
		return UpdateManager.instance;
	}
	
	private nodeCollector: NodeCollector;

	private scheduledNodes: INode<any>[] = [];
	private modifiedNodes: INode<any>[] = [];

	private isUpdating = false;

	private scheduledId: any = null;
	public scheduleFunction: (update: () => any) => any;
	public cancelFunction: (scheduledId: any) => any;

	constructor() {
		this.nodeCollector = NodeCollector.get();
		this.scheduleFunction = scheduleDefault;
		this.cancelFunction = cancelDefault;
	}

	public addObserved(node: INode<any>, value: any) {
		node.value = value;
	}

	public addComputed(node: IComputed<any>, calculate: () => any) {
		node.calculate = calculate;
		node.value = this.calculateValueAndDependencies(node);
	}

	public set(node: INode<any>, newValue: any) {
		if (node.value !== newValue) {
			node.value = newValue;
			this.scheduleUpdate(node);
		}
	}

	public get(node: INode<any>) {
		// If we call .get() during the current update, 
		// we shouldn't retrigger the update. If we call .get()
		// outside of the existing update, we need to trigger
		// the update, since a dependency might have changed.
		if (!this.isUpdating) {
			this.triggerUpdate();
		}
		this.nodeCollector.collect(node);
		return node.value;
	}

	private scheduleUpdate(node: INode<any>) {
		this.scheduledNodes.push(node);
		this.modifiedNodes.push(node);
		// If the update is already scheduled, we should just
		// wait for it rather than scheduling it again
		if (this.scheduledId === null) {
			this.scheduledId = this.scheduleFunction(() => {
				this.scheduledId = null;
				this.triggerUpdate();
			});
		}
	}

	private triggerUpdate() {
		// If there's no scheduledNodes, e.g. during outside ".get()" call,
		// then triggerUpdate should do nothing
		if (this.scheduledNodes.length < 1) {
			return;
		}
		// If we call triggerUpdate() after the update was
		// already scheduled, we should cancel the update and
		// just run it synchronously
		if (this.scheduledId !== null) {
			this.cancelFunction(this.scheduledId);
			this.scheduledId = null;
		}
		this.isUpdating = true;
		try {
			this.updateScheduledNodes();
			this.cleanupUpdate();
		}
		catch (error) {
			this.cleanupUpdate();
			throw error;
		}
	}

	private cleanupUpdate() {
		this.isUpdating = false;
		this.scheduledNodes = [];
		this.modifiedNodes = [];
	}

	private updateScheduledNodes() {
		const resolutionVisitor = new ResolutionVisitor();
		for (let i = 0; i < this.scheduledNodes.length; i++) {
			const scheduledNode = this.scheduledNodes[i];
			for (let j = 0; j < scheduledNode.derivedNodes.length; j++) {
				this.visitNode(scheduledNode.derivedNodes[j], resolutionVisitor);
			}
		}
		this.recalculateDerviedNodes(resolutionVisitor.getResolved());
	}

	private visitNode(node: IComputed<any>, resolutionVisitor: ResolutionVisitor) {
		if (!resolutionVisitor.shouldEnter(node)) {
			return;
		}
		resolutionVisitor.pre(node);
		for (let i = 0; i < node.derivedNodes.length; i++) {
			this.visitNode(node.derivedNodes[i], resolutionVisitor);
		}
		resolutionVisitor.post(node);
	}

	private recalculateDerviedNodes(derivedNodes: IComputed<any>[]) {
		for (let i = 0; i < derivedNodes.length; i++) {
			const derived = derivedNodes[i];
			this.recalculateValueAndUpdateIfNeeded(derived);
		}
	}

	private calculateValueAndDependencies(node: IComputed<any>) {
		this.nodeCollector.start();
		const newValue = node.calculate();
		this.setDependencies(node, this.nodeCollector.stop());
		return newValue;
	}

	private setDependencies(node: IComputed<any>, newDependencies: INode<any>[]) {
		this.removeFromDerivedListOfDependencies(node);
		node.dependencies = newDependencies;
		this.addToDerivedListOfDependencies(node);
	}

	private removeFromDerivedListOfDependencies(node: IComputed<any>) {
		for (let i = 0; i < node.dependencies.length; i++) {
			const dependency = node.dependencies[i];
			removeItemFromArrayIfExists(node, dependency.derivedNodes);
		}
	}

	private addToDerivedListOfDependencies(node: IComputed<any>) {
		for (let i = 0; i < node.dependencies.length; i++) {
			const dependency = node.dependencies[i];
			addUniqueItemToArray(node, dependency.derivedNodes);
		}
	}

	private recalculateValueAndUpdateIfNeeded(node: IComputed<any>) {
		if (this.isAtLeastOneDependencyChanged(node)) {
			const newValue = this.calculateValueAndDependencies(node);
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