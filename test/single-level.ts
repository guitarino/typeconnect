import { connect, computed, observed } from "./shared/decorators";
import { SinonSpy, fake } from "sinon";
import expect from "expect.js";

class A {
    cCall: SinonSpy<any[], any>;

    constructor() {
        this.cCall = fake();
        connect(this);
    }

    @observed a: number = 1;
    
    @observed b: number = 2;

    @computed get c(): number {
        this.cCall();
        return this.a + this.b;
    }
}

describe(`Single level dependency`, () => {
    const a = new A();

    it(`"Computed" getter is called before reading the value`, () => {
        expect(a.cCall.calledOnce).to.equal(true);
    });

    it(`"Computed" value is initially correct`, () => {
        expect(a.c).to.equal(3);
        expect(a.cCall.calledOnce).to.equal(true);
    });

    it(`"Computed" value recalculation can be caused by one dependency`, () => {
        a.a = 3;
        expect(a.c).to.equal(5);
        expect(a.cCall.calledTwice).to.equal(true);
    });

    it(`"Computed" value recalculation can be caused by another dependency`, () => {
        a.b = 7;
        expect(a.c).to.equal(10);
        expect(a.cCall.calledThrice).to.equal(true);
    });
});