import { connectFactory } from "../build";
import { Fake, fake } from "./utils/fake";
import assert from 'assert';

type Fun<A extends Array<any>, R> = (...args: A) => R;

type InstanceOf<Factory> = Factory extends Fun<any, infer R>
	? R
	: never;

let cCall: Fake;
let dCall: Fake;
let eCall: Fake;

const createA = connectFactory(() => {
	cCall = fake();
	
	return {
		a: 1,

		b: 2,

		get c(): number {
			cCall();
			return this.a + this.b;
		},
	}
});

const createB = connectFactory((a: InstanceOf<typeof createA>) => {
	dCall = fake();
	eCall = fake();

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

describe(`Factory inter-class dependency`, () => {
	const a = createA();
	const b = createB(a);

	it(`"Computed" getter is called before reading the value`, () => {
		assert(dCall.calls.length === 1);
	});

	it(`"Computed" value is initially correct`, () => {
		assert(b.d === 8);
		assert(dCall.calls.length === 1);
	});

	it(`"Computed" value recalculation can be caused by another object`, () => {
		a.a = 101;
		assert(b.d === 108);
		assert(dCall.calls.length === 2);
	});

	it(`"Computed" value recalculation can be caused by the same object`, () => {
		b.b = 300;
		assert(b.d === 401);
		assert(dCall.calls.length === 3);
		
		assert(eCall.calls.length === 3);
		assert(eCall.calls[eCall.calls.length - 1][0] === 701);
	});
});