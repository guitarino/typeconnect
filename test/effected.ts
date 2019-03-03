import { observed, connect, effected } from "./shared/decorators";
import { SinonSpy, fake } from "sinon";
import expect from "expect.js";

class A {
    bCall: SinonSpy<any[], any>;

    constructor() {
        this.bCall = fake();
        connect(this);
    }

    @observed a = 100;

    @effected b() {
        this.bCall(this.a);
    }
}

describe(`Effected`, () => {
    const a = new A();

    it(`Effected function is initially called correctly`, () => {
        expect(a.bCall.callCount).to.equal(1);
        expect(a.bCall.calledWith(100)).to.equal(true);
    });

    it(`Effected function is called correctly after update`, () => {
        a.a = 200;
        expect(a.bCall.callCount).to.equal(2);
        expect(a.bCall.calledWith(200)).to.equal(true);
    });
});