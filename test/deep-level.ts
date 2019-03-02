import { connect, computed, observed } from "./shared/decorators";
import { SinonSpy, fake } from "sinon";
import expect from "expect.js";

class A {
    cCall: SinonSpy<any[], any>;
    dCall: SinonSpy<any[], any>;
    eCall: SinonSpy<any[], any>;

    constructor() {
        this.cCall = fake();
        this.dCall = fake();
        this.eCall = fake();
        connect(this);
    }

    @observed a: number = 1;
    
    @observed b: number = 2;

    @computed get c(): number {
        this.cCall();
        return this.a + this.b;
    }

    @computed get d(): number {
        this.dCall();
        return this.a + this.b + this.c;
    }

    @computed get e(): number {
        this.eCall();
        return this.a + this.b + this.c + this.d;
    }
}

describe(`Deep level dependency`, () => {
    const a = new A();

    it(`All "computed" getters are called once before manipulating values`, () => {
        expect(a.cCall.calledOnce).to.equal(true);
        expect(a.dCall.calledOnce).to.equal(true);
        expect(a.eCall.calledOnce).to.equal(true);
    });

    it(`Deepest "computed" has initially correct value`, () => {
        expect(a.e).to.equal(12);
    });

    it(`Deepest "computed" has correct value after update`, () => {
        a.a = 100;
        expect(a.e).to.equal(408);
    });

    it(`All "computed" values are recalculated efficiently upon update`, () => {
        expect(a.cCall.calledTwice).to.equal(true);
        expect(a.dCall.calledTwice).to.equal(true);
        expect(a.eCall.calledTwice).to.equal(true);
    });
});