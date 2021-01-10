import test from "ava";
import { Fake, fake } from "./utils/fake";
import { connect } from "../src/main";

type TestContext = {
	cCall: Fake,
	dCall: Fake,
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

	const A = connect(class {
		a: number = 1;
		
		b: number = 2;
	
		get c(): number {
			cCall();
			return this.a + this.b;
		}
	});
	
	const B = connect(class {
		private readonly a: TestContext['a'];
	
		constructor(a: TestContext['a']) {
			this.a = a;
		}
	
		b: number = 7;
	
		get d(): number {
			dCall();
			return this.a.a + this.b;
		}
	});

	const a = new A();
	const b = new B(a);
	
	const c: TestContext = {
		a, b, cCall, dCall,
	};

	t.context = c;
});

test(`Inter-class dependency`, t => {
	const c = t.context as TestContext;

	t.assert(c.dCall.calls.length === 1, `"Computed" getter is called before reading the value`);

	t.assert(c.b.d === 8, `"Computed" value is initially correct`);
	t.assert(c.dCall.calls.length === 1);

	c.a.a = 101;
	t.assert(c.b.d === 108, `"Computed" value recalculation can be caused by another object`);
	t.assert(c.dCall.calls.length === 2);

	c.b.b = 300;
	t.assert(c.b.d === 401, `"Computed" value recalculation can be caused by the same object`);
	t.assert(c.dCall.calls.length === 3);
});