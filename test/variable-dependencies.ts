import { connect, computed, observed } from "./shared/decorators";
import { SinonSpy, fake } from "sinon";
import expect from "expect.js";

class A {
    eCall: SinonSpy<any[], any>;

    constructor() {
        this.eCall = fake();
        connect(this);
    }

    @observed flag: boolean = true;

    @observed a: number = 1;
    
    @observed b: number = 2;

    @observed c: number = 100;

    @observed d: number = 200;

    @computed get e() {
        this.eCall();
        if (this.flag) {
            return this.a + this.b;
        } else {
            return this.c + this.d;
        }
    }
}

describe(`Variable dependencies`, () => {
    const a = new A();

    it(`"Computed" value is initially correct`, () => {
        expect(a.e).to.equal(3);
    });

    it(`Inital dependencies are correct`, () => {
        a.a = 5;
        expect(a.eCall.callCount).to.equal(2);

        a.b = 10;
        expect(a.eCall.callCount).to.equal(3);

        a.c = 500;
        expect(a.eCall.callCount).to.equal(3);

        a.d = 1000;
        expect(a.eCall.callCount).to.equal(3);
    });

    it(`"Computed" value is correct upon update`, () => {
        expect(a.e).to.equal(15);
    });

    it(`Dependencies are recalculated correctly`, () => {
        a.flag = false;
        expect(a.eCall.callCount).to.equal(4);

        a.a = 6;
        expect(a.eCall.callCount).to.equal(4);

        a.b = 20;
        expect(a.eCall.callCount).to.equal(4);

        a.c = 600;
        expect(a.eCall.callCount).to.equal(5);

        a.d = 1100;
        expect(a.eCall.callCount).to.equal(6);
    });

    it(`"Computed" value is correct upon another update`, () => {
        expect(a.e).to.equal(1700);
    });
});