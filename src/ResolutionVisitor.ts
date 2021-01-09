import { IComputed } from "./Computed.types";

export class CyclicError extends Error {
	public path: IComputed<any>[];

	constructor(path: IComputed<any>[]) {
		super(`Dependency path is cyclic. See this error's "path" property for the path details.`);
		this.path = path;
	}
}

class CyclicCheckVisitor {
	private pathVisitor: PathVisitor;

	constructor(pathVisitor: PathVisitor) {
		this.pathVisitor = pathVisitor;
	}

	public pre(node: IComputed<any>) {
		const index = this.pathVisitor.path.indexOf(node);
		if (index >= 0) {
			throw new CyclicError([...this.pathVisitor.path.slice(index), node]);
		}
	}
}

class PathVisitor {
	public path: IComputed<any>[] = [];

	public pre(node: IComputed<any>) {
		this.path.push(node);
	}

	public post() {
		this.path.pop();
	}
}

class VisitedNodesVisitor {
	public visited: IComputed<any>[] = [];

	public shouldEnter(node: IComputed<any>) {
		return this.visited.indexOf(node) < 0;
	}

	public post(node: IComputed<any>) {
		this.visited.push(node);
	}
}

export class ResolutionVisitor {
	private pathVisitor: PathVisitor;
	private cyclicVisitor: CyclicCheckVisitor;
	private visitedNodesVisitor: VisitedNodesVisitor;
	private resolved: IComputed<any>[];

	constructor() {
		this.pathVisitor = new PathVisitor();
		this.cyclicVisitor = new CyclicCheckVisitor(this.pathVisitor);
		this.visitedNodesVisitor = new VisitedNodesVisitor();
		this.resolved = [];
	}

	public shouldEnter(node: IComputed<any>) {
		return this.visitedNodesVisitor.shouldEnter(node);
	}

	public pre(node: IComputed<any>) {
		this.cyclicVisitor.pre(node);
		this.pathVisitor.pre(node);
	}

	public post(node: IComputed<any>) {
		this.pathVisitor.post();
		this.visitedNodesVisitor.post(node);
		this.resolved.unshift(node);
	}

	public getResolved() {
		return this.resolved;
	}
}