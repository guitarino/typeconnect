import { connect } from "../build";
import { Fake, fake } from "./utils/fake";
import assert from 'assert';

let cCall: Fake;

const A = connect(class {
	constructor() {
		cCall = fake();
	}

	a: number = 1;
	
	b: number = 2;

	get c(): number {
		cCall();
		return this.a + this.b;
	}
});

describe(`Single level dependency`, () => {
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
});