import test from "ava";
import { connect } from "../src/main";
import { Fake, fake } from "./utils/fake";
import { next } from "./utils/next";

let bCall: Fake;
let cCall: Fake;

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

test(`Unncessary updates are avoided`, async t => {
	const a = new A();

	t.assert(bCall.calls.length === 1);
	t.assert(cCall.calls.length === 1);

	a.a = -1;
	await next();
	t.assert(bCall.calls.length === 2);
	t.assert(cCall.calls.length === 2);

	a.a = -6;
	await next();
	t.assert(bCall.calls.length === 3);
	t.assert(cCall.calls.length === 2);

	a.a = -6;
	await next();
	t.assert(bCall.calls.length === 3);
	t.assert(cCall.calls.length === 2);

	t.assert(a.c === -5);
});