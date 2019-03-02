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

class B {
    private a: A;

    dCall: SinonSpy<any[], any>;

    constructor(a: A) {
        this.dCall = fake();
        this.a = a;
        connect(this);
    }

    @observed b: number = 7;

    @computed get d(): number {
        this.dCall();
        return this.a.a + this.b;
    }
}

describe(`Inter-class dependency`, () => {
    const a = new A();
    const b = new B(a);

    it(`"Computed" getter is called before reading the value`, () => {
        expect(b.dCall.calledOnce).to.equal(true);
    });

    it(`"Computed" value is initially correct`, () => {
        expect(b.d).to.equal(8);
        expect(b.dCall.calledOnce).to.equal(true);
    });

    it(`"Computed" value recalculation can be caused by another object`, () => {
        a.a = 101;
        expect(b.d).to.equal(108);
        expect(b.dCall.calledTwice).to.equal(true);
    });

    it(`"Computed" value recalculation can be caused by the same object`, () => {
        b.b = 300;
        expect(b.d).to.equal(401);
        expect(b.dCall.calledThrice).to.equal(true);
    });
});