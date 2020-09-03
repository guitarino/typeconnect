import { connect } from "../build";
import { Fake, fake } from "./utils/fake";
import assert from 'assert';

let bCall: Fake;
let cCall: Fake;
let dCall: Fake;
let eCall: Fake;
let fCall: Fake;
let gCall: Fake;

const A = connect(class {
	constructor() {
		bCall = fake();
		cCall = fake();
		dCall = fake();
		eCall = fake();
		fCall = fake();
		gCall = fake();
	}

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

describe(`Deep level dependency correct order`, () => {
	const a = new A();

	it(`All "computed" getters are called once before manipulating values`, () => {
		assert(bCall.calls.length === 1);
		assert(cCall.calls.length === 1);
		assert(dCall.calls.length === 1);
		assert(eCall.calls.length === 1);
		assert(fCall.calls.length === 1);
		assert(gCall.calls.length === 1);
	});

	it(`Deepest "computed" has initially correct value`, () => {
		assert(a.g === 44212);
	});

	it(`Deepest "computed" has correct value after update`, () => {
		a.a = 2;
		assert(a.g === 44214);
	});

	it(`All "computed" values are recalculated efficiently upon update`, () => {
		assert(bCall.calls.length === 2);
		assert(cCall.calls.length === 2);
		assert(dCall.calls.length === 2);
		assert(eCall.calls.length === 2);
		assert(fCall.calls.length === 2);
		assert(gCall.calls.length === 2);
	});
});