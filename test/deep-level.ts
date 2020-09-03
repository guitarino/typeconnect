import { connect } from "../build";
import { Fake, fake } from "./utils/fake";
import assert from 'assert';

let cCall: Fake;
let dCall: Fake;
let eCall: Fake;

const A = connect(class {
	constructor() {
		cCall = fake();
		dCall = fake();
		eCall = fake();
	}

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

describe(`Deep level dependency`, () => {
	const a = new A();

	it(`All "computed" getters are called once before manipulating values`, () => {
		assert(cCall.calls.length === 1);
		assert(dCall.calls.length === 1);
		assert(eCall.calls.length === 1);
	});

	it(`Deepest "computed" has initially correct value`, () => {
		assert(a.e === 12);
	});

	it(`Deepest "computed" has correct value after update`, () => {
		a.a = 100;
		assert(a.e === 408);
	});

	it(`All "computed" values are recalculated efficiently upon update`, () => {
		assert(cCall.calls.length === 2);
		assert(dCall.calls.length === 2);
		assert(eCall.calls.length === 2);
	});
});