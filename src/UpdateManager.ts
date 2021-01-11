import { IComputed } from "./Computed.types";
import { DependenciesManager } from "./DependenciesManager";
import { INode } from "./Node.types";
import { NodeCollector } from "./NodeCollector";
import { SingleUpdateManger } from "./SingleUpdateManager";

type ScheduledUpdate = {
	nodes: INode<any>[],
	modified: INode<any>[],
};

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

	private scheduledId: any = null;
	private scheduledUpdates: ScheduledUpdate[] = [];

	private isUpdating = false;

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
		if (this.scheduledUpdates.length === 0 || this.isUpdating) {
			this.scheduledUpdates.push({
				nodes: [node],
				modified: [node],
			});
		}
		else {
			const lastUpdate = this.scheduledUpdates[this.scheduledUpdates.length - 1];
			lastUpdate.nodes.push(node);
			lastUpdate.modified.push(node);
		}
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
		// If we call triggerUpdate() after the update was
		// already scheduled, we should cancel the update and
		// just run it synchronously
		if (this.scheduledId !== null) {
			this.cancelFunction(this.scheduledId);
			this.scheduledId = null;
		}
		// If there's no scheduledUpdates, e.g. during outside ".get()" call,
		// then triggerUpdate should do nothing
		if (this.scheduledUpdates.length === 0) {
			return;
		}
		this.isUpdating = true;
		try {
			for (let i = 0; i < this.scheduledUpdates.length; i++) {
				const scheduled = this.scheduledUpdates[i];
				const singleUpdateManager = new SingleUpdateManger(
					scheduled.nodes,
					scheduled.modified
				);
				singleUpdateManager.update();
			}
			this.cleanupUpdate();
		}
		catch (error) {
			this.cleanupUpdate();
			throw error;
		}
	}

	private cleanupUpdate() {
		this.isUpdating = false;
		this.scheduledUpdates = [];
	}
}