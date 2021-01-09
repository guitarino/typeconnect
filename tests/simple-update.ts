import test from "ava";
import { Computed, Observed } from "../src/main";
import { fake, Fake } from "./utils/fake";
import { next } from "./utils/next";

type TestContext = {
	a: Observed<number>,
	b: Computed<number>,
	bCall: Fake,
	c: Computed<number>,
	cCall: Fake,
	x: Observed<number>,
	y: Observed<number>,
	z: Observed<number>,
};

test.beforeEach(t => {
	const bCall = fake();
	const cCall = fake();
	const a = new Observed(18);
	const x = new Observed(0);
	const y = new Observed(0);
	const z = new Observed(0);
	const b = new Computed(() => {
		bCall();
		return a.get() + x.get() + y.get() + 3;
	});
	const c = new Computed(() => {
		cCall();
		return a.get() + b.get() + z.get();
	});
	const context: TestContext = {
		a, b, c, x, y, z, bCall, cCall,
	};
	t.context = context;
});

test(`Initializing a computed calculates it value once`, t => {
	const c = t.context as TestContext;
	t.assert(c.bCall.calls.length === 1);
	t.assert(c.cCall.calls.length === 1);
});

test(`After updating multiple values at the same time, the update happens on the next tick`, async t => {
	const c = t.context as TestContext;
	c.a.set(20);
	c.x.set(1);
	c.y.set(2);
	c.z.set(3);
	t.assert(c.bCall.calls.length === 1);
	t.assert(c.cCall.calls.length === 1);
	await next();
	t.assert(c.bCall.calls.length === 2);
	t.assert(c.cCall.calls.length === 2);
	t.assert(c.b.get() === 26);
	t.assert(c.c.get() === 49);
	t.assert(c.bCall.calls.length === 2);
	t.assert(c.cCall.calls.length === 2);
});

test(`After updating multiple values at the same time, the update happens when getting a value`, t => {
	const c = t.context as TestContext;
	c.a.set(20);
	c.x.set(1);
	c.y.set(2);
	c.z.set(3);
	t.assert(c.bCall.calls.length === 1);
	t.assert(c.cCall.calls.length === 1);
	t.assert(c.b.get() === 26);
	t.assert(c.c.get() === 49);
	t.assert(c.bCall.calls.length === 2);
	t.assert(c.cCall.calls.length === 2);
});