import test from "ava";
import { Computed, CyclicError, Observed } from "../src";

type A = {
	a: Observed<number>,
	b: Computed<number>,
};

type B = {
	a: Observed<number>,
	b: Computed<number>,
};

type TestContext = {
	a: A,
	b: B,
};

test.beforeEach(t => {
	function createA() {
		var a = new Observed<number>(1);
	
		var b = new Computed<number>(() => {
			return (a.get() && b) ? b.get() : 20;
		});
		
		return { a, b };
	}
	
	function createB() {
		var a = new Observed<number>(1);
	
		var e: Computed<number>;
	
		var b = new Computed<number>(() => {
			return !e
				? a.get() + 20
				: e.get() + a.get() + 20;
		});
	
		var c = new Computed<number>(() => {
			return b.get() + 300;
		});
	
		var d = new Computed<number>(() => {
			return c.get() + 4000;
		});
	
		e = new Computed<number>(() => {
			return d.get() + 50000;
		});
	
		new Computed<number>(() => {
			return e.get() + 600000;
		});
		
		return { a, b };
	}

	const context: TestContext = {
		a: createA(),
		b: createB(),
	};
	t.context = context;
});

test(`Throws errors in case of cyclic dependencies`, t => {
	const c = t.context as TestContext;

	let e: CyclicError = t.throws(
		() => {
			c.a.a.set(2);
			c.a.b.get(); // reading to trigger an update
			c.a.a.set(3);
			c.a.b.get(); // reading to trigger an update
		},
		{ instanceOf: CyclicError },
		`Direct cyclic dependency throws CyclicError on update`
	);
	t.assert(e.path.length === 2, `Node path is returned`);
	t.assert(e.path[0] === e.path[1], `Node directly depends on itself`);

	e = t.throws(
		() => {
			c.b.a.set(2);
			c.b.b.get(); // reading to trigger an update
			c.b.a.set(3);
			c.b.b.get(); // reading to trigger an update
		},
		{ instanceOf: CyclicError },
		`Deep cyclic dependency throws error on update`
	);
	t.assert(e.path.length === 5, `Node path is returned`);
	t.assert(e.path[0] === e.path[4], `Node depends on itself and separated by 3 other nodes`);
});