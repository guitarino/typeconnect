import { connect, computed, observed } from "./shared/decorators";
import { SinonSpy, fake } from "sinon";
import expect from "expect.js";

class A {
    bCall: SinonSpy<any[], any>;
    cCall: SinonSpy<any[], any>;

    constructor() {
        this.bCall = fake();
        this.cCall = fake();
        connect(this);
    }

    @observed a: number = 1;

    @computed get b(): number {
        this.bCall();
        return this.a >= 0 ? 1 : -1;
    }

    @computed get c(): number {
        this.cCall();
        return this.b * 5;
    }
}

describe(`Avoiding unnecessary updates`, () => {
    const a = new A();

    it(`Unncessary updates are avoided`, () => {
        expect(a.bCall.callCount).to.equal(1);
        expect(a.cCall.callCount).to.equal(1);

        a.a = -1;
        expect(a.bCall.callCount).to.equal(2);
        expect(a.cCall.callCount).to.equal(2);

        a.a = -6;
        expect(a.bCall.callCount).to.equal(3);
        expect(a.cCall.callCount).to.equal(2);

        a.a = -6;
        expect(a.bCall.callCount).to.equal(3);
        expect(a.cCall.callCount).to.equal(2);

        expect(a.c).to.equal(-5);
    });
});