import { connect } from "../build";
import { SinonSpy, fake } from "sinon";
import expect from "expect.js";

let eCall: SinonSpy<any[], any>;

const A = connect(class {
    constructor() {
        eCall = fake();
    }

    flag: boolean = true;

    a: number = 1;
    
    b: number = 2;

    c: number = 100;

    d: number = 200;

    get e() {
        eCall();
        if (this.flag) {
            return this.a + this.b;
        } else {
            return this.c + this.d;
        }
    }
});

describe(`Variable dependencies`, () => {
    const a = new A();

    it(`"Computed" value is initially correct`, () => {
        expect(a.e).to.equal(3);
    });

    it(`Inital dependencies are correct`, () => {
        a.a = 5;
        expect(eCall.callCount).to.equal(2);

        a.b = 10;
        expect(eCall.callCount).to.equal(3);

        a.c = 500;
        expect(eCall.callCount).to.equal(3);

        a.d = 1000;
        expect(eCall.callCount).to.equal(3);
    });

    it(`"Computed" value is correct upon update`, () => {
        expect(a.e).to.equal(15);
    });

    it(`Dependencies are recalculated correctly`, () => {
        a.flag = false;
        expect(eCall.callCount).to.equal(4);

        a.a = 6;
        expect(eCall.callCount).to.equal(4);

        a.b = 20;
        expect(eCall.callCount).to.equal(4);

        a.c = 600;
        expect(eCall.callCount).to.equal(5);

        a.d = 1100;
        expect(eCall.callCount).to.equal(6);
    });

    it(`"Computed" value is correct upon another update`, () => {
        expect(a.e).to.equal(1700);
    });
});