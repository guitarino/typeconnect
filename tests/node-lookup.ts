import test from "ava";
import { fake } from "./utils/fake";
import { configureConnect, connect } from "../src";

type TestContext = {
	a: any,
	b: any,
	d: any,
};

test.beforeEach(t => {
	const cCall = fake();
	const dCall = fake();

	class TemplateClass {
		a: number = 1;
		
		b: number = 2;
	
		get c(): number {
			return this.a + this.b;
		}
		
		d(): number {
			return this.c + 4;
		}
	}

	const A = connect(TemplateClass);
	const a = new A();

	configureConnect({
		addNodeLookupToClass: true,
	});
	
	const B = connect(TemplateClass);
	const b = new B();

	configureConnect({
		addPropertyNamesToNodes: true,
	});
	
	const D = connect(TemplateClass);
	const d = new D();
	
	const c: TestContext = {
		a, b, d,
	};

	t.context = c;
});

test(`Node lookup and node names`, t => {
	const c = t.context as TestContext;

	t.assert(c.a._nodeLookup === undefined, `Does not return nodes unless configured`);

	t.assert(c.b._nodeLookup !== undefined), `Returns nodes correctly if configured`;

	t.assert(c.b._nodeLookup.a !== undefined, `Returns nodes correctly if configured`);
	t.assert(c.b._nodeLookup.b !== undefined, `Returns nodes correctly if configured`);
	t.assert(c.b._nodeLookup.c !== undefined, `Returns nodes correctly if configured`);
	t.assert(c.b._nodeLookup.d !== undefined, `Returns nodes correctly if configured`);

	t.assert(c.b._nodeLookup.a.get() === 1, `Returns nodes correctly if configured`);
	t.assert(c.b._nodeLookup.b.get() === 2, `Returns nodes correctly if configured`);
	t.assert(c.b._nodeLookup.c.get() === 3, `Returns nodes correctly if configured`);

	t.assert(c.b._nodeLookup.a._nodeName === undefined, `Does not have node names unless configured`);
	t.assert(c.b._nodeLookup.b._nodeName === undefined, `Does not have node names unless configured`);
	t.assert(c.b._nodeLookup.c._nodeName === undefined, `Does not have node names unless configured`);
	t.assert(c.b._nodeLookup.d._nodeName === undefined, `Does not have node names unless configured`);

	t.assert(c.d._nodeLookup.a._nodeName === 'a', `Has correct node names if configured`);
	t.assert(c.d._nodeLookup.b._nodeName === 'b', `Has correct node names if configured`);
	t.assert(c.d._nodeLookup.c._nodeName === 'c', `Has correct node names if configured`);
	t.assert(c.d._nodeLookup.d._nodeName === 'd', `Has correct node names if configured`);
});