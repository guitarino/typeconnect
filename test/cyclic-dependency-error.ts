import { Observed, Computed } from "../build";
import { CyclicError } from "../build/Errors";
import assert from 'assert';

function createA() {
	var a = new Observed<number>(1);

	var b = new Computed<number>(() => {
		return (a.getValue() && b) ? b.getValue() : 20;
	});
	
	return { a };
}

function createB() {
	var a = new Observed<number>(1);

	var e: Computed<number>;

	var b = new Computed<number>(() => {
		return !e
			? a.getValue() + 20
			: e.getValue() + a.getValue() + 20;
	});

	var c = new Computed<number>(() => {
		return b.getValue() + 300;
	});

	var d = new Computed<number>(() => {
		return c.getValue() + 4000;
	});

	e = new Computed<number>(() => {
		return d.getValue() + 50000;
	});

	var f = new Computed<number>(() => {
		return e.getValue() + 600000;
	});
	
	return { a };
}

describe(`Errors in case of cyclic dependencies`, () => {
	const a = createA();
	const b = createB();

	it(`Direct cyclic dependency throws error on update`, () => {
		assert.throws(
			() => {
				a.a.setValue(2);
				a.a.setValue(3);
			},
			(e: CyclicError) => {
				assert(e instanceof CyclicError === true);
				assert(e.path.length === 2);
				assert(e.path[0] === e.path[1]);
				return true;
			}
		);
	});

	it(`Deep cyclic dependency throws error on update`, () => {
		assert.throws(
			() => {
				b.a.setValue(2);
				b.a.setValue(3);
			},
			(e: CyclicError) => {
				assert(e instanceof CyclicError === true);
				assert(e.path.length === 5);
				assert(e.path[0] === e.path[4]);
				return true;
			}
		);
	});
});