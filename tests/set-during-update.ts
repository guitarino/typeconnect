import test from "ava";
import { fake } from "./utils/fake";
import { connect, connectEffect } from "./utils/api";

test(`Setting a value during an update works as expected`, t => {
	const A = connect(class {
		a: number = 0;

		b: number = 0;

		d: number = 0;

		f: number = 0;

		get c(): number {
			return this.b * 3;
		}

		get e(): number {
			return this.d * 5;
		}

		get g(): number {
			return this.f * 7;
		}
	});

	const a = new A();

	connectEffect(
		() => a.a * 2,
		(result) => a.b = result,
	);

	connectEffect(
		() => a.c * 4,
		(result) => a.d = result,
	);

	connectEffect(
		() => a.e * 6,
		(result) => a.f = result,
	);

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
	});

	const b = new B();

	connectEffect(
		() => b.a,
		(a) => {
			b.b = a * 3;
			b.c = a * 4;
			b.d = a * 5;
		},
	);

	connectEffect(
		() => ({ c: b.c, d: b.d }),
		(result) => dCall(result.c, result.d),
	);

	b.a = -3;
	t.assert(b.d === -15);
	t.assert(dCall.calls.length === 2);
});