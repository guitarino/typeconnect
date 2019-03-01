import { computed, observed } from "./shared/decorators";
import { SinonSpy, fake } from "sinon";
import expect from "expect.js";

class A {
    @observed
    public a: number = 1;
    
    @observed
    public b: number = 2;

    @computed
    public get c(): number {
        // this.cCall();
        return this.a + this.b;
    }

    // public cCall: SinonSpy<any[], any>;

    constructor() {
        // this.cCall = fake();
    }
}

class B {
    private a: A;

    @observed
    public b: number = 7;

    @computed
    public get d(): number {
        // this.dCall();
        return this.a.a + this.b;
    }

    // public dCall: SinonSpy<any[], any>;

    constructor(a: A) {
        // this.dCall = fake();
        this.a = a;
    }
}

describe(`Single level dependency`, () => {
    describe(`A.a, A.b, A.c(A.a, A.b)`, () => {
        console.log('a is created next');
        const a = new A();
        console.log(a);
        console.log('a is created');

        it(`"A.c" should have already been called`, () => {
            expect(a.cCall.calledOnce).to.equal(true);
        });

        it(`"A.c" should be computed correctly`, () => {
            // computed.get A.c
            expect(a.c).to.equal(3);
            expect(a.cCall.calledOnce).to.equal(true);
        });

        it(`"A.c" should be recalculated when "A.a" is changed`, () => {
            // observed.set A.a - tried to set to 3
            a.a = 3;
            // computed.get A.c
            expect(a.c).to.equal(5);
            expect(a.cCall.calledTwice).to.equal(true);
        });

        it(`"A.c" should be recalculated when "A.b" is changed`, () => {
            // observed.set A.b - tried to set to 7
            a.b = 7;
            // computed.get A.c
            expect(a.c).to.equal(10);
            expect(a.cCall.calledThrice).to.equal(true);
        });
    });

    describe(`B.b, B.d(A.a, B.b)`, () => {
        console.log('a is created next');
        const a = new A();
        console.log('a is created');
        console.log('b is created next');
        const b = new B(a);
        console.log('b is created');

        it(`"B.d" should have already been called`, () => {
            expect(b.dCall.calledOnce).to.equal(true);
        });

        it(`"B.d" should be computed correctly`, () => {
            // computed.get B.d
            expect(b.d).to.equal(8);
            expect(b.dCall.calledOnce).to.equal(true);
        });

        it(`"B.d" should be recalculated when "A.a" is changed`, () => {
            // observed.set A.a - tried to set to 101
            a.a = 101;
            // computed.get B.d
            expect(b.d).to.equal(108);
            expect(b.dCall.calledTwice).to.equal(true);
        });

        it(`"B.d" should be recalculated when "B.b" is changed`, () => {
            // observed.set B.b - tried to set to 300
            b.b = 300;
            // computed.get B.d
            expect(b.d).to.equal(401);
            expect(b.dCall.calledThrice).to.equal(true);
        });
    });
});