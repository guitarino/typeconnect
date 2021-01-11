import test from "ava";
import { configureConnect, connect } from "../src";

interface A {
	a: number,
	b: number,
	c: number,
	d: number,
	e: number,
	f: number,
	g: number,
}

type TestContext = {
	a: A,
};

test.beforeEach(t => {
	configureConnect({
		addNodeLookupToClass: true,
		addPropertyNamesToNodes: true,
	});

	const A = connect(class {
		a: number = 0;

		b: number = 0;

		d: number = 0;

		f: number = 0;
	
		updateB() {
			this.b = this.a * 2;
		}

		get c(): number {
			return this.b * 3;
		}
	
		updateD() {
			this.d = this.c * 4;
		}

		get e(): number {
			return this.d * 5;
		}
	
		updateF() {
			this.f = this.e * 6;
		}

		get g(): number {
			return this.f * 7;
		}
	});

	const c: TestContext = {
		a: new A()
	};

	t.context = c;
});

test(`Setting a value during an update works as expected`, t => {
	const c = t.context as TestContext;

	c.a.a = -1;
	t.assert(c.a.b === -2);
	t.assert(c.a.c === -6);
	t.assert(c.a.d === -24);
	t.assert(c.a.e === -120);
	t.assert(c.a.f === -720);
	t.assert(c.a.g === -5040);
});