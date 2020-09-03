import { connect } from "../build";
import { SinonSpy, fake } from "sinon";
import expect from "expect.js";

let bCall: SinonSpy<any[], any>;

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
		expect(bCall.callCount).to.equal(1);
		expect(bCall.calledWith(100)).to.equal(true);
	});

	it(`Effected function is called correctly after update`, () => {
		a.a = 200;
		expect(bCall.callCount).to.equal(2);
		expect(bCall.calledWith(200)).to.equal(true);
	});
});