import test from "ava";
import { connectObject } from "./utils/api";
import { fake, Fake } from "./utils/fake";

type A = {
	a: number,
	b: number,
	c: number,
};

type B = {
	b: number,
	d: number,
};

type TestContext = {
	a: A,
	b: B,
	cCall: Fake,
	dCall: Fake,
	eCall: Fake,
};

test.beforeEach(t => {
	const cCall = fake();
	const dCall = fake();
	const eCall = fake();

	const createA = () => {
		return connectObject({
			a: 1,
			b: 2,
			get c(): number {
				cCall();
				return this.a + this.b;
			},
		})
	};
	
	const createB = (a: A) => {
		return connectObject({
			b: 7,
			get d() {
				dCall();
				const result = a.a + this.b;
				debugger;
				return result;
			},
			e() {
				eCall(this.b + this.d);
			}
		});
	};

	const a = createA();
	const b = createB(a);

	const context: TestContext = {
		a, b, cCall, dCall, eCall,
	};
	t.context = context;
});

test(`Connect object inter-class dependency`, t => {
	const c = t.context as TestContext;

	t.assert(c.dCall.calls.length === 1, `"Computed" getter is called before reading the value`);

	t.assert(c.b.d === 8, `"Computed" value is initially correct`);
	t.assert(c.dCall.calls.length === 1, `No update happened yet`);

	c.a.a = 101;
	t.assert(c.b.d === 108, `"Computed" value recalculation can be caused by another object`);
	t.assert(c.dCall.calls.length === 2, `Update happened once`);

	c.b.b = 300;
	t.assert(c.b.d === 401, `"Computed" value recalculation can be caused by the same object`);
	t.assert(c.dCall.calls.length === 3, `Update happened twice`);
		
	t.assert(c.eCall.calls.length === 3, `Effected value update happened twice`);
	t.assert(c.eCall.calls[c.eCall.calls.length - 1][0] === 701, `Effected was called correctly`);
});