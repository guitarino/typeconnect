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

describe(`Single level dependency`, () => {
    describe(`A.a, A.b, A.c(A.a, A.b)`, () => {
        const a = new A();

        it(`"A.c" should have already been called`, () => {
            expect(a.cCall.calledOnce).to.equal(true);
        });

        it(`"A.c" should be computed correctly`, () => {
            expect(a.c).to.equal(3);
            expect(a.cCall.calledOnce).to.equal(true);
        });

        it(`"A.c" should be recalculated when "A.a" is changed`, () => {
            a.a = 3;
            expect(a.c).to.equal(5);
            expect(a.cCall.calledTwice).to.equal(true);
        });

        it(`"A.c" should be recalculated when "A.b" is changed`, () => {
            a.b = 7;
            expect(a.c).to.equal(10);
            expect(a.cCall.calledThrice).to.equal(true);
        });
    });

    describe(`B.b, B.d(A.a, B.b)`, () => {
        const a = new A();
        const b = new B(a);

        it(`"B.d" should have already been called`, () => {
            expect(b.dCall.calledOnce).to.equal(true);
        });

        it(`"B.d" should be computed correctly`, () => {
            expect(b.d).to.equal(8);
            expect(b.dCall.calledOnce).to.equal(true);
        });

        it(`"B.d" should be recalculated when "A.a" is changed`, () => {
            a.a = 101;
            expect(b.d).to.equal(108);
            expect(b.dCall.calledTwice).to.equal(true);
        });

        it(`"B.d" should be recalculated when "B.b" is changed`, () => {
            b.b = 300;
            expect(b.d).to.equal(401);
            expect(b.dCall.calledThrice).to.equal(true);
        });
    });
});