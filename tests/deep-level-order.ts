import test from "ava";
import { Fake, fake } from "./utils/fake";
import { connect } from "../src";

type TestContext = {
	bCall: Fake,
	cCall: Fake,
	dCall: Fake,
	eCall: Fake,
	fCall: Fake,
	gCall: Fake,
	a: {
		a: number,
		b: number,
		c: number,
		d: number,
		e: number,
		f: number,
		g: number,
	},
};

test.beforeEach(t => {
	const bCall = fake();
	const cCall = fake();
	const dCall = fake();
	const eCall = fake();
	const fCall = fake();
	const gCall = fake();

	const A = connect(class {
		a: number = 1;
	
		get b(): number {
			bCall();
			return this.a + 10;
		}
	
		get c(): number {
			cCall();
			return this.a + 200;
		}
	
		get d(): number {
			dCall();
			return this.b + 3000;
		}
	
		get e(): number {
			eCall();
			return this.d + 40000;
		}
	
		get f(): number {
			fCall();
			return this.e + this.c;
		}
		
		get g(): number {
			gCall();
			return this.f + 1000;
		}
	});

	const a = new A();
	
	const c: TestContext = {
		a, bCall, cCall, dCall, eCall, fCall, gCall
	};

	t.context = c;
});

test(`Deep level dependency correct order`, t => {
	const c = t.context as TestContext;

	t.assert(c.bCall.calls.length === 1);
	t.assert(c.cCall.calls.length === 1);
	t.assert(c.dCall.calls.length === 1);
	t.assert(c.eCall.calls.length === 1);
	t.assert(c.fCall.calls.length === 1);
	t.assert(c.gCall.calls.length === 1);

	t.assert(c.a.g === 44212, `Deepest "computed" has initially correct value`);
	
	c.a.a = 2;
	t.assert(c.a.g === 44214, `Deepest "computed" has correct value after update`);

	t.assert(c.bCall.calls.length === 2);
	t.assert(c.cCall.calls.length === 2);
	t.assert(c.dCall.calls.length === 2);
	t.assert(c.eCall.calls.length === 2);
	t.assert(c.fCall.calls.length === 2);
	t.assert(c.gCall.calls.length === 2);
});