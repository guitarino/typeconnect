import { connect } from "../build";
import { Fake, fake } from "./utils/fake";
import assert from 'assert';

let bCall: Fake;
let cCall: Fake;

const A = connect(class {
	constructor() {
		bCall = fake();
		cCall = fake();
	}

	a: number = 1;

	get b(): number {
		bCall();
		return this.a >= 0 ? 1 : -1;
	}

	get c(): number {
		cCall();
		return this.b * 5;
	}
});

describe(`Avoiding unnecessary updates`, () => {
	const a = new A();

	it(`Unncessary updates are avoided`, () => {
		assert(bCall.calls.length === 1);
		assert(cCall.calls.length === 1);

		a.a = -1;
		assert(bCall.calls.length === 2);
		assert(cCall.calls.length === 2);

		a.a = -6;
		assert(bCall.calls.length === 3);
		assert(cCall.calls.length === 2);

		a.a = -6;
		assert(bCall.calls.length === 3);
		assert(cCall.calls.length === 2);

		assert(a.c === -5);
	});
});