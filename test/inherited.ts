import { connect } from "../build";
import { Fake, fake } from "./utils/fake";
import assert from 'assert';

let cCall: Fake;
let dCall: Fake;

class B {
	constructor() {
		dCall = fake();
	}

	a: number = 1;
	
	b: number = 2;

	d() {
		dCall(this.a + this.b);
	}
}

const A = connect(class extends B {
	constructor() {
		cCall = fake();
		super();
	}

	get c(): number {
		cCall();
		return this.a + this.b;
	}
});

describe(`Inherited class works like non-inherited class`, () => {
	const a = new A();

	it(`"Computed" getter is called before reading the value`, () => {
		assert(cCall.calls.length === 1);
	});

	it(`"Computed" value is initially correct`, () => {
		assert(a.c === 3);
		assert(cCall.calls.length === 1);
	});

	it(`"Computed" value recalculation can be caused by one dependency`, () => {
		a.a = 3;
		assert(a.c === 5);
		assert(cCall.calls.length === 2);
	});

	it(`"Computed" value recalculation can be caused by another dependency`, () => {
		a.b = 7;
		assert(a.c === 10);
		assert(cCall.calls.length === 3);
	});

	it(`"Effected" value in inherited class gets called appropriately`, () => {
		assert(dCall.calls.length === 3);
		assert(dCall.calls[dCall.calls.length - 1][0] === 10);
	});
});