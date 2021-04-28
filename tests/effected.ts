import test from "ava";
import { Fake, fake } from "./utils/fake";
import { connect, connectEffect } from "./utils/api";
import { next } from "./utils/next";

type TestContext = {
	bCall: Fake,
	a: {
		a: number,
		b: number,
	},
};

test.beforeEach(t => {
	const bCall = fake();

	const A = connect(class {
		a = 100;

		b = 0;
	});

	const a = new A();

	connectEffect(
		() => a.a,
		result => bCall(result + a.b),
	);
	
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

	c.a.b = 300;
	await next();
	t.assert(c.bCall.calls.length === 2, `Effected function is not called when getting values during effect`);

	c.a.a = 400;
	await next();
	t.assert(c.bCall.calls.length === 3);
	t.assert(c.bCall.calls[2][0] === 700, `Effected function is called correctly after next update`);
});