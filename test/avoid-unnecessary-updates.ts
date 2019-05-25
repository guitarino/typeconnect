import { connect } from "../build";
import { SinonSpy, fake } from "sinon";
import expect from "expect.js";

let bCall: SinonSpy<any[], any>;
let cCall: SinonSpy<any[], any>;

const A = connect(class {
    constructor() {
        bCall = fake();
        cCall = fake();
    }

    a: number = 1;

    get b(): number {
        bCall();
        return this.a >= 0 ? 1 : -1;
    }

    get c(): number {
        cCall();
        return this.b * 5;
    }
});

describe(`Avoiding unnecessary updates`, () => {
    const a = new A();

    it(`Unncessary updates are avoided`, () => {
        expect(bCall.callCount).to.equal(1);
        expect(cCall.callCount).to.equal(1);

        a.a = -1;
        expect(bCall.callCount).to.equal(2);
        expect(cCall.callCount).to.equal(2);

        a.a = -6;
        expect(bCall.callCount).to.equal(3);
        expect(cCall.callCount).to.equal(2);

        a.a = -6;
        expect(bCall.callCount).to.equal(3);
        expect(cCall.callCount).to.equal(2);

        expect(a.c).to.equal(-5);
    });
});