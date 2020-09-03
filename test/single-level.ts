import { connect } from "../build";
import { SinonSpy, fake } from "sinon";
import expect from "expect.js";

let cCall: SinonSpy<any[], any>;

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
		expect(cCall.calledOnce).to.equal(true);
	});

	it(`"Computed" value is initially correct`, () => {
		expect(a.c).to.equal(3);
		expect(cCall.calledOnce).to.equal(true);
	});

	it(`"Computed" value recalculation can be caused by one dependency`, () => {
		a.a = 3;
		expect(a.c).to.equal(5);
		expect(cCall.calledTwice).to.equal(true);
	});

	it(`"Computed" value recalculation can be caused by another dependency`, () => {
		a.b = 7;
		expect(a.c).to.equal(10);
		expect(cCall.calledThrice).to.equal(true);
	});
});