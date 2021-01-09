import test from "ava";
import { connect } from "../src/main";
import { Fake, fake } from "./utils/fake";

interface A {
	a: number,
	b: number,
	c: number,
}

type TestContext = {
	a: A,
	bCall: Fake,
	cCall: Fake,
};

test.beforeEach(t => {
	const bCall = fake();
	const cCall = fake();
	const A = connect(class {
		a: number = 1;
	
		get b(): number {
			bCall();
			return this.a >= 0 ? 1 : -1;
		}
	
		get c(): number {
			cCall();
			return this.b * 5;
		}
	});
	const c: TestContext = {
		a: new A(),
		bCall,
		cCall,
	};
	t.context = c;
});

test(`When value hasn't changed, the update doesn't trigger`, async t => {
	const c = t.context as TestContext;

	t.assert(c.bCall.calls.length === 1);
	t.assert(c.cCall.calls.length === 1);

	c.a.a = -1;
	t.assert(c.a.b === -1);
	t.assert(c.a.c === -5);
	t.assert(c.bCall.calls.length === 2);
	t.assert(c.cCall.calls.length === 2);

	c.a.a = -6;
	t.assert(c.a.b === -1);
	t.assert(c.a.c === -5);
	t.assert(c.bCall.calls.length === 3);
	t.assert(c.cCall.calls.length === 2);

	c.a.a = -6;
	t.assert(c.a.b === -1);
	t.assert(c.a.c === -5);
	t.assert(c.bCall.calls.length === 3);
	t.assert(c.cCall.calls.length === 2);
});