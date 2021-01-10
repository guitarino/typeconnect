import test from "ava";
import { Fake, fake } from "./utils/fake";
import { connect } from "../src/main";

type TestContext = {
	cCall: Fake,
	a: {
		a: number,
		b: number,
		c: number,
	},
};

test.beforeEach(t => {
	const cCall = fake();

	const A = connect(class {
		a: number = 1;
		
		b: number = 2;
	
		get c(): number {
			cCall();
			return this.a + this.b;
		}
	});

	const a = new A();
	
	const c: TestContext = {
		a, cCall,
	};

	t.context = c;
});

test(`Single level dependency`, t => {
	const c = t.context as TestContext;

	t.assert(c.cCall.calls.length === 1, `"Computed" getter is called before reading the value`);

	t.assert(c.a.c === 3, `"Computed" value is initially correct`);
	t.assert(c.cCall.calls.length === 1);

	c.a.a = 3;
	t.assert(c.a.c === 5, `"Computed" value recalculation can be caused by one dependency`);
	t.assert(c.cCall.calls.length === 2);

	c.a.b = 7;
	t.assert(c.a.c === 10, `"Computed" value recalculation can be caused by another dependency`);
	t.assert(c.cCall.calls.length === 3);
});