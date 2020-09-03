import { connect } from "../build";
import { Fake, fake } from "./utils/fake";
import assert from 'assert';

let bCall: Fake;

const A = connect(class {
	constructor() {
		bCall = fake();
	}

	a = 100;

	b() {
		bCall(this.a);
	}
});

describe(`Effected`, () => {
	const a = new A();

	it(`Effected function is initially called correctly`, () => {
		assert(bCall.calls.length === 1);
		assert(bCall.calls[0][0] === 100);
	});

	it(`Effected function is called correctly after update`, () => {
		a.a = 200;
		assert(bCall.calls.length === 2);
		assert(bCall.calls[1][0] === 200);
	});
});