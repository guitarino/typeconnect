import { IComputed } from "./Computed.types";
import { DependenciesManager } from "./DependenciesManager";
import { INode } from "./Node.types";
import { NodeCollector } from "./NodeCollector";
import { SingleUpdateManger } from "./SingleUpdateManager";

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
	
	private dependenciesManager: DependenciesManager;
	private nodeCollector: NodeCollector;

	private scheduledNodes: INode<any>[] = [];
	private modifiedNodes: INode<any>[] = [];

	private currentlyScheduledNodes: INode<any>[] = [];
	private currentlyModifiedNodes: INode<any>[] = [];

	private isUpdating = false;

	private scheduledId: any = null;
	public scheduleFunction: (update: () => any) => any;
	public cancelFunction: (scheduledId: any) => any;

	constructor() {
		this.dependenciesManager = DependenciesManager.get();
		this.nodeCollector = NodeCollector.get();
		this.scheduleFunction = scheduleDefault;
		this.cancelFunction = cancelDefault;
	}

	public addObserved(node: INode<any>, value: any) {
		node.value = value;
	}

	public addComputed(node: IComputed<any>, calculate: () => any) {
		node.calculate = calculate;
		node.value = this.dependenciesManager.calculateValueAndDependencies(node);
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
		// From now on, we clean up the scheduled and modified fields, so that
		// they can be used if another update is to be scheduled, as it happens
		// when a Computed calls a ".set()" on another node during update.
		// We use "currentlyScheduledNodes" and "currentlyModifiedNodes" for the rest
		// of the update.
		this.currentlyScheduledNodes = this.scheduledNodes;
		this.currentlyModifiedNodes = this.modifiedNodes;
		this.scheduledNodes = [];
		this.modifiedNodes = [];

		this.isUpdating = true;
		try {
			const singleUpdateManager = new SingleUpdateManger(
				this.currentlyScheduledNodes,
				this.currentlyModifiedNodes
			);
			singleUpdateManager.update();
			this.cleanupUpdate();
		}
		catch (error) {
			this.cleanupUpdate();
			throw error;
		}
	}

	private cleanupUpdate() {
		this.isUpdating = false;
		this.currentlyScheduledNodes = [];
		this.currentlyModifiedNodes = [];
	}
}