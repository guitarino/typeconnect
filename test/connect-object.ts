import { connectObject } from "../build";
import { SinonSpy, fake } from "sinon";
import expect from "expect.js";

type Fun<A extends Array<any>, R> = (...args: A) => R;

type InstanceOf<Factory> = Factory extends Fun<any, infer R>
	? R
	: never;

let cCall: SinonSpy<any[], any>;
let dCall: SinonSpy<any[], any>;
let eCall: SinonSpy<any[], any>;

const createA = () => {
	cCall = fake();
	
	return connectObject({
		a: 1,

		b: 2,

		get c(): number {
			cCall();
			return this.a + this.b;
		},
	})
}

const createB = (a: InstanceOf<typeof createA>) => {
	dCall = fake();
	eCall = fake();

	return connectObject({
		b: 7,

		get d() {
			dCall();
			return a.a + this.b;
		},

		e() {
			eCall(this.b + this.d);
		}
	});
}

describe(`Connect object inter-class dependency`, () => {
	const a = createA();
	const b = createB(a);

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
		
		expect(eCall.calledThrice).to.equal(true);
		expect(eCall.lastCall.calledWith(701)).to.equal(true);
	});
});