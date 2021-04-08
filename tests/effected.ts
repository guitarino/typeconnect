import test from "ava";
import { Fake, fake } from "./utils/fake";
import { connect } from "./utils/api";
import { next } from "./utils/next";

type TestContext = {
	bCall: Fake,
	a: {
		a: number,
	},
};

test.beforeEach(t => {
	const bCall = fake();

	const A = connect(class {
		a = 100;
	
		b() {
			bCall(this.a);
		}
	});

	const a = new A();
	
	const c: TestContext = {
		a, bCall,
	};

	t.context = c;
});

test(`Effected`, async t => {
	const c = t.context as TestContext;

	t.assert(c.bCall.calls.length === 1);
	t.assert(c.bCall.calls[0][0] === 100, `Effected function is initially called correctly`);

	c.a.a = 200;
	await next();
	t.assert(c.bCall.calls.length === 2);
	t.assert(c.bCall.calls[1][0] === 200, `Effected function is called correctly after update`);
});