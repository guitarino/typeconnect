import { connect } from "../build";
import { Fake, fake } from "./utils/fake";
import assert from 'assert';
import { NewableClass } from "../build/connect.types";

type InstanceOf<Class> = Class extends NewableClass<any, infer I>
	? I
	: never;

let cCall: Fake;
let dCall: Fake;

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

const B = connect(class {
	private readonly a: InstanceOf<typeof A>;

	constructor(a: InstanceOf<typeof A>) {
		dCall = fake();
		this.a = a;
	}

	b: number = 7;

	get d(): number {
		dCall();
		return this.a.a + this.b;
	}
});

describe(`Inter-class dependency`, () => {
	const a = new A();
	const b = new B(a);

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
	});
});