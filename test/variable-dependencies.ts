import { connect } from "../build";
import { Fake, fake } from "./utils/fake";
import assert from 'assert';

let eCall: Fake;

const A = connect(class {
	constructor() {
		eCall = fake();
	}

	flag: boolean = true;

	a: number = 1;
	
	b: number = 2;

	c: number = 100;

	d: number = 200;

	get e() {
		eCall();
		if (this.flag) {
			return this.a + this.b;
		} else {
			return this.c + this.d;
		}
	}
});

describe(`Variable dependencies`, () => {
	const a = new A();

	it(`"Computed" value is initially correct`, () => {
		assert(a.e === 3);
	});

	it(`Inital dependencies are correct`, () => {
		a.a = 5;
		assert(eCall.calls.length === 2);

		a.b = 10;
		assert(eCall.calls.length === 3);

		a.c = 500;
		assert(eCall.calls.length === 3);

		a.d = 1000;
		assert(eCall.calls.length === 3);
	});

	it(`"Computed" value is correct upon update`, () => {
		assert(a.e === 15);
	});

	it(`Dependencies are recalculated correctly`, () => {
		a.flag = false;
		assert(eCall.calls.length === 4);

		a.a = 6;
		assert(eCall.calls.length === 4);

		a.b = 20;
		assert(eCall.calls.length === 4);

		a.c = 600;
		assert(eCall.calls.length === 5);

		a.d = 1100;
		assert(eCall.calls.length === 6);
	});

	it(`"Computed" value is correct upon another update`, () => {
		assert(a.e === 1700);
	});
});