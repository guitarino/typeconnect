import { connect } from "../build";
import { SinonSpy, fake } from "sinon";
import expect from "expect.js";

let bCall: SinonSpy<any[], any>;
let cCall: SinonSpy<any[], any>;
let dCall: SinonSpy<any[], any>;
let eCall: SinonSpy<any[], any>;
let fCall: SinonSpy<any[], any>;

const A = connect(class {
    constructor() {
        bCall = fake();
        cCall = fake();
        dCall = fake();
        eCall = fake();
        fCall = fake();
    }

    a: number = 1;

    get b(): number {
        bCall();
        return this.a + 1;
    }

    get c(): number {
        cCall();
        return this.a + 2;
    }

    get d(): number {
        dCall();
        return this.b + 100;
    }

    get e(): number {
        eCall();
        return this.d + 200;
    }

    get f(): number {
        fCall();
        return this.e + this.c;
    }
});

describe(`Deep level dependency correct order`, () => {
    const a = new A();

    it(`All "computed" getters are called once before manipulating values`, () => {
        expect(bCall.callCount).to.equal(1);
        expect(cCall.callCount).to.equal(1);
        expect(dCall.callCount).to.equal(1);
        expect(eCall.callCount).to.equal(1);
        expect(fCall.callCount).to.equal(1);
    });

    it(`Deepest "computed" has initially correct value`, () => {
        expect(a.f).to.equal(305);
    });

    it(`Deepest "computed" has correct value after update`, () => {
        a.a = 7;
        expect(a.f).to.equal(317);
    });

    it(`All "computed" values are recalculated efficiently upon update`, () => {
        expect(bCall.callCount).to.equal(2);
        expect(cCall.callCount).to.equal(2);
        expect(dCall.callCount).to.equal(2);
        expect(eCall.callCount).to.equal(2);
        expect(fCall.callCount).to.equal(2);
    });
});