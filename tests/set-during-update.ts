import test from "ava";
import { fake } from "./utils/fake";
import { connect } from "../src";

test(`Setting a value during an update works as expected`, t => {
	const A = connect(class {
		a: number = 0;

		b: number = 0;

		d: number = 0;

		f: number = 0;
	
		updateB() {
			this.b = this.a * 2;
		}

		get c(): number {
			return this.b * 3;
		}
	
		updateD() {
			this.d = this.c * 4;
		}

		get e(): number {
			return this.d * 5;
		}
	
		updateF() {
			this.f = this.e * 6;
		}

		get g(): number {
			return this.f * 7;
		}
	});

	const a = new A();

	a.a = -1;
	t.assert(a.b === -2);
	t.assert(a.c === -6);
	t.assert(a.d === -24);
	t.assert(a.e === -120);
	t.assert(a.f === -720);
	t.assert(a.g === -5040);
});

test(`Setting multiple values by single Computed during an update works efficiently`, t => {
	const dCall = fake();

	const B = connect(class {
		a: number = 0;

		b: number = 0;

		c: number = 0;

		d: number = 0;
	
		updateBC() {
			this.b = this.a * 3;
			this.c = this.a * 4;
			this.d = this.a * 5;
		}

		dTest() {
			dCall(this.c, this.d);
		}
	});

	const b = new B();

	b.a = -3;
	t.assert(b.d === -15);
	t.assert(dCall.calls.length === 2);
});