import test from "ava";
import { Fake, fake } from "./utils/fake";
import { connect } from "./utils/api";

type TestContext = {
	cCall: Fake,
	dCall: Fake,
	eCall: Fake,
	a: {
		a: number,
		b: number,
		c: number,
		d: number,
		e: number,
	},
};

test.beforeEach(t => {
	const cCall = fake();
	const dCall = fake();
	const eCall = fake();

	const A = connect(class {
		a: number = 1;
		
		b: number = 2;
	
		get c(): number {
			cCall();
			return this.a + this.b;
		}
	
		get d(): number {
			dCall();
			return this.a + this.b + this.c;
		}
	
		get e(): number {
			eCall();
			return this.a + this.b + this.c + this.d;
		}
	});

	const a = new A();
	
	const c: TestContext = {
		a, cCall, dCall, eCall,
	};

	t.context = c;
});

test(`Deep level dependency`, t => {
	const c = t.context as TestContext;

	t.assert(c.cCall.calls.length === 1);
	t.assert(c.dCall.calls.length === 1);
	t.assert(c.eCall.calls.length === 1);

	t.assert(c.a.e === 12, `Deepest "computed" has initially correct value`);
	
	c.a.a = 100;
	t.assert(c.a.e === 408, `Deepest "computed" has correct value after update`);

	t.assert(c.cCall.calls.length === 2);
	t.assert(c.dCall.calls.length === 2);
	t.assert(c.eCall.calls.length === 2);
});