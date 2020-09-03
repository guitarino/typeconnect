import { connect } from "../build";
import { SinonSpy, fake } from "sinon";
import expect from "expect.js";

let cCall: SinonSpy<any[], any>;
let dCall: SinonSpy<any[], any>;
let eCall: SinonSpy<any[], any>;

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
		expect(cCall.calledOnce).to.equal(true);
		expect(dCall.calledOnce).to.equal(true);
		expect(eCall.calledOnce).to.equal(true);
	});

	it(`Deepest "computed" has initially correct value`, () => {
		expect(a.e).to.equal(12);
	});

	it(`Deepest "computed" has correct value after update`, () => {
		a.a = 100;
		expect(a.e).to.equal(408);
	});

	it(`All "computed" values are recalculated efficiently upon update`, () => {
		expect(cCall.calledTwice).to.equal(true);
		expect(dCall.calledTwice).to.equal(true);
		expect(eCall.calledTwice).to.equal(true);
	});
});