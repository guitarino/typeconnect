import test from "ava";
import { Fake, fake } from "./utils/fake";
import { connectFactory } from "./utils/api";

type TestContext = {
	cCall: Fake,
	dCall: Fake,
	eCall: Fake,
	a: {
		a: number,
		b: number,
		c: number,
	},
	b: {
		b: number,
		d: number,
	}
};

test.beforeEach(t => {
	const cCall = fake();
	const dCall = fake();
	const eCall = fake();

	const createA = connectFactory(() => {
		return {
			a: 1,
	
			b: 2,
	
			get c(): number {
				cCall();
				return this.a + this.b;
			},
		}
	});
	
	const createB = connectFactory((a: TestContext['a']) => {
		return {
			b: 7,
	
			get d() {
				dCall();
				return a.a + this.b;
			},
	
			e() {
				eCall(this.b + this.d);
			}
		}
	});

	const a = createA();
	const b = createB(a);
	
	const c: TestContext = {
		a, b, cCall, dCall, eCall,
	};

	t.context = c;
});

test(`Factory inter-class dependency`, t => {
	const c = t.context as TestContext;

	t.assert(c.dCall.calls.length === 1, `"Computed" getter is called before reading the value`);

	t.assert(c.b.d === 8, `"Computed" value is initially correct`);
	t.assert(c.dCall.calls.length === 1);
	
	c.a.a = 101;
	t.assert(c.b.d === 108, `"Computed" value recalculation can be caused by another object`);
	t.assert(c.dCall.calls.length === 2);

	c.b.b = 300;
	t.assert(c.b.d === 401);
	t.assert(c.dCall.calls.length === 3);
	
	t.assert(c.eCall.calls.length === 3);
	t.assert(c.eCall.calls[c.eCall.calls.length - 1][0] === 701);
});