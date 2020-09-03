import { connect } from "../build";
import { SinonSpy, fake } from "sinon";
import expect from "expect.js";
import { NewableClass } from "../build/connect.types";

type InstanceOf<Class> = Class extends NewableClass<any, infer I>
	? I
	: never;

let cCall: SinonSpy<any[], any>;
let dCall: SinonSpy<any[], any>;

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
		expect(dCall.calledOnce).to.equal(true);
	});

	it(`"Computed" value is initially correct`, () => {
		expect(b.d).to.equal(8);
		expect(dCall.calledOnce).to.equal(true);
	});

	it(`"Computed" value recalculation can be caused by another object`, () => {
		a.a = 101;
		expect(b.d).to.equal(108);
		expect(dCall.calledTwice).to.equal(true);
	});

	it(`"Computed" value recalculation can be caused by the same object`, () => {
		b.b = 300;
		expect(b.d).to.equal(401);
		expect(dCall.calledThrice).to.equal(true);
	});
});