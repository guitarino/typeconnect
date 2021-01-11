import test from "ava";
import { configureConnect, connect } from "../src";
import { next } from "./utils/next";

interface A {
	a: number,
	b: number,
	c: number,
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
		a: number = 1;

		b: number = 100;
	
		updateB() {
			if (this.a > 0) {
				this.b = 100;
			}
			else if (this.a < 0) {
				this.b = -100;
			}
			else {
				this.b = 0;
			}
		}

		get c(): number {
			return this.b * 2;
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
	t.assert(c.a.c === -200);
});