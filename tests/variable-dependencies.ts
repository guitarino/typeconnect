import test from "ava";
import { Fake, fake } from "./utils/fake";
import { connect } from "../src/main";

type TestContext = {
	eCall: Fake,
	a: {
		flag: boolean,
		a: number,
		b: number,
		c: number,
		d: number,
		e: number,
	},
};

test.beforeEach(t => {
	const eCall = fake();

	const A = connect(class {
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

	const a = new A();
	
	const c: TestContext = {
		a, eCall,
	};

	t.context = c;
});

test(`Variable dependencies`, t => {
	const c = t.context as TestContext;

	t.assert(c.a.e === 3, `"Computed" value is initially correct`);

	c.a.a = 5;
	t.assert(c.a.e === 7, `"Computed" value is correct upon update`);
	t.assert(c.eCall.calls.length === 2, `Inital dependencies are correct`);

	c.a.b = 10;
	t.assert(c.a.e === 15, `"Computed" value is correct upon update`);
	t.assert(c.eCall.calls.length === 3, `Inital dependencies are correct`);

	c.a.c = 500;
	t.assert(c.a.e === 15, `"Computed" value is correct upon update`);
	t.assert(c.eCall.calls.length === 3, `Inital dependencies are correct`);

	c.a.d = 1000;
	t.assert(c.a.e === 15, `"Computed" value is correct upon update`);
	t.assert(c.eCall.calls.length === 3, `Inital dependencies are correct`);

	c.a.flag = false;
	
	t.assert(c.a.e === 1500, `"Computed" value is correct upon another update`);
	t.assert(c.eCall.calls.length === 4, `Dependencies are recalculated correctly`);

	c.a.a = 6;
	t.assert(c.a.e === 1500, `"Computed" value is correct upon another update`);
	t.assert(c.eCall.calls.length === 4, `Dependencies are recalculated correctly`);

	c.a.b = 20;
	t.assert(c.a.e === 1500, `"Computed" value is correct upon another update`);
	t.assert(c.eCall.calls.length === 4, `Dependencies are recalculated correctly`);

	c.a.c = 600;
	t.assert(c.a.e === 1600, `"Computed" value is correct upon another update`);
	t.assert(c.eCall.calls.length === 5, `Dependencies are recalculated correctly`);

	c.a.d = 1100;
	t.assert(c.a.e === 1700, `"Computed" value is correct upon another update`);
	t.assert(c.eCall.calls.length === 6, `Dependencies are recalculated correctly`);
});