import { connect, computed, observed } from "./shared/decorators";
import { SinonSpy, fake } from "sinon";
import expect from "expect.js";

class A {
    bCall: SinonSpy<any[], any>;
    cCall: SinonSpy<any[], any>;
    dCall: SinonSpy<any[], any>;
    eCall: SinonSpy<any[], any>;
    fCall: SinonSpy<any[], any>;

    constructor() {
        this.bCall = fake();
        this.cCall = fake();
        this.dCall = fake();
        this.eCall = fake();
        this.fCall = fake();
        connect(this);
    }

    @observed a: number = 1;

    @computed get b(): number {
        this.bCall();
        return this.a + 1;
    }

    @computed get c(): number {
        this.cCall();
        return this.a + 2;
    }

    @computed get d(): number {
        this.dCall();
        return this.b + 100;
    }

    @computed get e(): number {
        this.eCall();
        return this.d + 200;
    }

    @computed get f(): number {
        this.fCall();
        return this.e + this.c;
    }
}

describe(`Deep level dependency order`, () => {
    const a = new A();

    it(`All "computed" getters are called once before manipulating values`, () => {
        expect(a.bCall.callCount).to.equal(1);
        expect(a.cCall.callCount).to.equal(1);
        expect(a.dCall.callCount).to.equal(1);
        expect(a.eCall.callCount).to.equal(1);
        expect(a.fCall.callCount).to.equal(1);
    });

    it(`Deepest "computed" has initially correct value`, () => {
        expect(a.f).to.equal(305);
    });

    it(`Deepest "computed" has correct value after update`, () => {
        a.a = 7;
        expect(a.f).to.equal(317);
    });

    it(`All "computed" values are recalculated efficiently upon update`, () => {
        expect(a.bCall.callCount).to.equal(2);
        expect(a.cCall.callCount).to.equal(2);
        expect(a.dCall.callCount).to.equal(2);
        expect(a.eCall.callCount).to.equal(2);
        expect(a.fCall.callCount).to.equal(2);
    });
});