import { connect } from "../build";
import { SinonSpy, fake } from "sinon";
import expect from "expect.js";

let cCall: SinonSpy<any[], any>;
let dCall: SinonSpy<any[], any>;

class B {
    constructor() {
        dCall = fake();
    }

    a: number = 1;
    
    b: number = 2;

    d() {
        dCall(this.a + this.b);
    }
}

const A = connect(class extends B {
    constructor() {
        cCall = fake();
        super();
    }

    get c(): number {
        cCall();
        return this.a + this.b;
    }
});

describe(`Inherited class works like non-inherited class`, () => {
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

    it(`"Effected" value in inherited class gets called appropriately`, () => {
        expect(dCall.calledThrice).to.equal(true);
        expect(dCall.lastCall.calledWith(10));
    });
});